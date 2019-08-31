import { vec3 } from "gl-matrix";
import {
    BxMath,
    BxVec3,
    BxBezier2Line3,
    BxBezier3Line3,
    BxBezier5Line3,
    BxBezier6Line3
} from '../bxCom/bxCmMath';
import { BxGlProgramBase } from './bxGlProgramBase';
import { BxGlShaderBase } from './bxGlShaderBase';
import { BxCmSeparatePatch_Object } from '../bxCom/bxCmSeparatePatch';
import { BxCmUiParam } from '../bxCom/bxCmUiParam';
import {
    BxCmSeparatePatch_Surface,
    BxCmSeparatePatch_Vertex,
    BxCmSeparatePatch_SurfaceEdge
} from '../bxCom/bxCmSeparatePatch';
import { BxGlMain } from './bxGlMain';

export abstract class BxGlShader extends BxGlShaderBase {

    private   readonly KNumFloatInVector4 = 4;
    protected readonly KNumTessMax        = 32;

    protected numSurface_: number = 0;
    private   texture_: (WebGLTexture|null)[];
    protected numSurface_NonPreDiv_: number = 0;

    // -------------------------------------------------------

    public constructor(gl: WebGLRenderingContext, canvasID: string, parent: BxGlMain) {
        super(gl, canvasID, parent);

        this.texture_ = new Array<WebGLTexture|null>(1);
        this.texture_[0] = null;
    }

    public releaseVertexBuffer(): void {
        super.releaseBufInfo();

        this.releaseVtf();
    }

    // ------

    public genBuf(patch: BxCmSeparatePatch_Object, param: BxCmUiParam): void {
        this.numSurface_ = patch.numSurface;
        this.tessLevel   = param.numTess;

        this.setVertexBuffer();
        this.setIndexBuffer();
        this.setVAO();

        let min: vec3|null = null;
        let max: vec3|null = null;

        if (param.min)
            min = vec3.fromValues(param.min.x, param.min.y, param.min.z);
        if (param.max)
            max = vec3.fromValues(param.max.x, param.max.y, param.max.z);

        if (min && max)
            this.parent_.setObjSize(min, max);

        this.initVtf(patch);
    }

    public draw(param: BxCmUiParam): void {
        this.drawVtf();

        super.draw(param);

        this.gl_.bindTexture(this.gl_.TEXTURE_2D, null);
    }

    protected setVertexBuffer(): void {
        if (this.buf.hasVertexBuffer() == true)
            this.buf.releaseVertexBuffer();

        const vertexAry: vec3[] = this.genVertexAry();
        this.buf.numVertices = vertexAry.length;

        const vertexAryFloat: number[] = new Array<number>(vertexAry.length * 3);
        let cnt = 0;
        for (let i=0; i<vertexAry.length; i++) {
            vertexAryFloat[cnt++] = vertexAry[i][0];
            vertexAryFloat[cnt++] = vertexAry[i][1];
            vertexAryFloat[cnt++] = vertexAry[i][2];
        }

        const instanceAry: number[] = new Array<number>(this.numSurface_);
        for (let i=0; i<this.numSurface_; i++ )
            instanceAry[i] = i + 0.5;

        this.buf.vbo[0] = this.gl_.createBuffer();
        this.buf.vbo[1] = this.gl_.createBuffer();

        this.gl_.bindBuffer(this.gl_.ARRAY_BUFFER, this.buf.vbo[0]);
        this.gl_.bufferData(this.gl_.ARRAY_BUFFER, new Float32Array(vertexAryFloat), this.gl_.STATIC_DRAW);

        this.gl_.bindBuffer(this.gl_.ARRAY_BUFFER, this.buf.vbo[1]);
        this.gl_.bufferData(this.gl_.ARRAY_BUFFER, new Float32Array(instanceAry), this.gl_.STATIC_DRAW);

        this.gl_.bindBuffer(this.gl_.ARRAY_BUFFER, null);
    }

    protected setIndexBuffer(): void {
        if (this.buf.hasIndexBuffer() == true)
            this.buf.releaseIndexBuffer();

        const indexAry: number[] = this.genIndexAry();
        this.buf.numIndices = indexAry.length;

        this.buf.ebo[0] = this.gl_.createBuffer();
        this.gl_.bindBuffer(this.gl_.ELEMENT_ARRAY_BUFFER, this.buf.ebo[0]);
        this.gl_.bufferData(this.gl_.ELEMENT_ARRAY_BUFFER, new Int32Array(indexAry), this.gl_.STATIC_DRAW);

        this.gl_.bindBuffer(this.gl_.ELEMENT_ARRAY_BUFFER, null);
    }

    protected setVAO(): void {
        this.buf.vaoHandle[0] = this.buf.glExt.vao.createVertexArrayOES();
        this.buf.glExt.vao.bindVertexArrayOES(this.buf.vaoHandle[0]);

        this.gl_.bindBuffer(this.gl_.ARRAY_BUFFER, this.buf.vbo[0]);

        const programObj    = <BxGlProgramBase>this.programObj_;
        const shaderProgram = <WebGLProgram>programObj.shaderProgram();

        const vertexUVLocation = this.gl_.getAttribLocation(shaderProgram, "vertVertexUV");
        this.gl_.enableVertexAttribArray(vertexUVLocation);
        this.gl_.vertexAttribPointer(vertexUVLocation, 3, this.gl_.FLOAT, false, 0, 0);

        this.gl_.bindBuffer(this.gl_.ARRAY_BUFFER, this.buf.vbo[1]);

        const instanceIdLocation = this.gl_.getAttribLocation(shaderProgram, "vertInstanceID");
        this.gl_.enableVertexAttribArray(instanceIdLocation);
        this.gl_.vertexAttribPointer(instanceIdLocation, 1, this.gl_.FLOAT, false, 0, 0);

        (<ANGLE_instanced_arrays>(this.buf.glExt.instancedAry)).vertexAttribDivisorANGLE(0, 0);
        (<ANGLE_instanced_arrays>(this.buf.glExt.instancedAry)).vertexAttribDivisorANGLE(1, 1);

        this.buf.glExt.vao.bindVertexArrayOES(null);
    }

    protected patchParameter(): void {}

    // ------

    protected abstract drawMain_NonPreDiv(): void;
    protected abstract drawMain_PreDiv(): void;
    protected abstract genIndexAry(): number[];

    // ------

    protected drawMain(): void {
        this.setUniformForTexture();
        this.setFaceColor();

        this.buf.glExt.vao.bindVertexArrayOES(this.buf.vaoHandle[0]);
        this.gl_.bindBuffer(this.gl_.ELEMENT_ARRAY_BUFFER, this.buf.ebo[0]);

        this.drawMain_NonPreDiv();
        this.drawMain_PreDiv();

        this.buf.glExt.vao.bindVertexArrayOES(null);
    }

    // ------

    protected setUniform(surfaceOfs: number, tessDenom: number): void {
        const programObj    = <BxGlProgramBase>this.programObj_;
        const shaderProgram = <WebGLProgram>programObj.shaderProgram();

        const surfaceOfsLocation = this.gl_.getUniformLocation(shaderProgram, "surfaceOfs");
        this.gl_.uniform1f(surfaceOfsLocation, surfaceOfs);

        const tessDenomLocation = this.gl_.getUniformLocation(shaderProgram, "tessDenom");
        this.gl_.uniform1f(tessDenomLocation, tessDenom);
    }

    // ------

    private genVertexAry(): vec3[] {
        const numTessMaxP = this.KNumTessMax + 1;

        const vertexAry: vec3[] = new Array<vec3>(numTessMaxP * numTessMaxP);
        for (let v=0; v<numTessMaxP; v++) {
            for (let u=0; u<numTessMaxP; u++) {
                const n = v * numTessMaxP + u;

                vertexAry[n] = vec3.fromValues(u, v, 0.0);
            }
        }

        return vertexAry;
    }

    // ------

    public hasVtf(): boolean {
        if (this.texture_[0])
            return true;

        return false;
    }

    public releaseVtf(): void {
        this.gl_.deleteTexture(this.texture_[0]);
        this.texture_[0] = null;
    }

    // ------

    private initVtf(patch: BxCmSeparatePatch_Object): void
    {
        const {width, height, vtfAry} = this.initVtf_Pre(patch);

        let cnt = 0;
        cnt = this.initVtf_NonPreDiv(patch, vtfAry, cnt);

        this.numSurface_NonPreDiv_ = cnt;
        cnt = this.initVtf_PreDiv(patch, width, height, vtfAry, cnt);

        if (cnt != patch.numSurface) alert("cnt != patch.numSurface");
        this.initVtf_Post(width, height, vtfAry);
    }

    private initVtf_Pre(patch: BxCmSeparatePatch_Object): {width: number, height: number, vtfAry: number[]} {
        if (this.hasVtf() == true)
            this.releaseVtf();

        const division = 20;

        const width  = 80 * division;
        const height = Math.floor((patch.numSurface + division - 1) / division);

        const vtfAry = new Array<number>((width * this.KNumFloatInVector4) * height);

        return {width: width, height: height, vtfAry: vtfAry};
    }

    private initVtf_Post(width: number, height: number, vtfAry: number[]): void {
        this.gl_.activeTexture(this.gl_.TEXTURE0);
        this.texture_[0] = this.gl_.createTexture();
        this.gl_.bindTexture(this.gl_.TEXTURE_2D, this.texture_[0]);
        this.gl_.pixelStorei(this.gl_.UNPACK_ALIGNMENT, 1);
        this.gl_.texImage2D(this.gl_.TEXTURE_2D, 0, this.gl_.RGBA, width, height, 0, this.gl_.RGBA, this.gl_.FLOAT, new Float32Array(vtfAry));

        this.gl_.texParameteri(this.gl_.TEXTURE_2D, this.gl_.TEXTURE_MAG_FILTER, this.gl_.NEAREST);
        this.gl_.texParameteri(this.gl_.TEXTURE_2D, this.gl_.TEXTURE_MIN_FILTER, this.gl_.NEAREST);
        this.gl_.texParameteri(this.gl_.TEXTURE_2D, this.gl_.TEXTURE_WRAP_S, this.gl_.CLAMP_TO_EDGE);
        this.gl_.texParameteri(this.gl_.TEXTURE_2D, this.gl_.TEXTURE_WRAP_T, this.gl_.CLAMP_TO_EDGE);

        this.gl_.bindTexture(this.gl_.TEXTURE_2D, null);
    }

    private setUniformForTexture(): void {
        const programObj    = <BxGlProgramBase>this.programObj_;
        const shaderProgram = <WebGLProgram>programObj.shaderProgram();

        const vtfLocation        = this.gl_.getUniformLocation(shaderProgram, "vtf");
        const numSurfaceLocation = this.gl_.getUniformLocation(shaderProgram, "numSurface");

        this.gl_.uniform1i(vtfLocation, 0);
        this.gl_.uniform1f(numSurfaceLocation, this.numSurface_);
    }

    // ------

    private convVtfInfo(hPosBez0: BxBezier3Line3|null, hPosBez1: BxBezier6Line3|null, hPosBez2: BxBezier6Line3|null, hPosBez3: BxBezier3Line3|null,
        vPosBez0: BxBezier3Line3|null, vPosBez1: BxBezier6Line3|null, vPosBez2: BxBezier6Line3|null, vPosBez3: BxBezier3Line3|null,
        hDiffBez0: BxBezier2Line3|null, hDiffBez1: BxBezier5Line3|null, hDiffBez2: BxBezier5Line3|null, hDiffBez3: BxBezier2Line3|null,
        vDiffBez0: BxBezier2Line3|null, vDiffBez1: BxBezier5Line3|null, vDiffBez2: BxBezier5Line3|null, vDiffBez3: BxBezier2Line3|null,
        surfaceOfs: number, vtfInfo: number[]): void {

        this.fromBezier3(<BxBezier3Line3>hPosBez0,  surfaceOfs,  0, vtfInfo);
        this.fromBezier6(<BxBezier6Line3>hPosBez1,  surfaceOfs,  4, vtfInfo);
        this.fromBezier6(<BxBezier6Line3>hPosBez2,  surfaceOfs, 11, vtfInfo);
        this.fromBezier3(<BxBezier3Line3>hPosBez3,  surfaceOfs, 18, vtfInfo);

        this.fromBezier3(<BxBezier3Line3>vPosBez0,  surfaceOfs, 22, vtfInfo);
        this.fromBezier6(<BxBezier6Line3>vPosBez1,  surfaceOfs, 26, vtfInfo);
        this.fromBezier6(<BxBezier6Line3>vPosBez2,  surfaceOfs, 33, vtfInfo);
        this.fromBezier3(<BxBezier3Line3>vPosBez3,  surfaceOfs, 40, vtfInfo);

        this.fromBezier2(<BxBezier2Line3>hDiffBez0, surfaceOfs, 44, vtfInfo);
        this.fromBezier5(<BxBezier5Line3>hDiffBez1, surfaceOfs, 47, vtfInfo);
        this.fromBezier5(<BxBezier5Line3>hDiffBez2, surfaceOfs, 53, vtfInfo);
        this.fromBezier2(<BxBezier2Line3>hDiffBez3, surfaceOfs, 59, vtfInfo);

        this.fromBezier2(<BxBezier2Line3>vDiffBez0, surfaceOfs, 62, vtfInfo);
        this.fromBezier5(<BxBezier5Line3>vDiffBez1, surfaceOfs, 65, vtfInfo);
        this.fromBezier5(<BxBezier5Line3>vDiffBez2, surfaceOfs, 71, vtfInfo);
        this.fromBezier2(<BxBezier2Line3>vDiffBez3, surfaceOfs, 77, vtfInfo);
    }

    private fromBezier2(src: BxBezier2Line3, surfaceOfs: number, ofsBase: number, dst: number[]): void {
        const texelOfs = (surfaceOfs * 80 * this.KNumFloatInVector4) + (ofsBase * this.KNumFloatInVector4);

        for (let i=0; i<3; i++) {
            dst[texelOfs + i * this.KNumFloatInVector4 + 0] = src.get(i).x;
            dst[texelOfs + i * this.KNumFloatInVector4 + 1] = src.get(i).y;
            dst[texelOfs + i * this.KNumFloatInVector4 + 2] = src.get(i).z;
        }
    }

    private fromBezier3(src: BxBezier3Line3, surfaceOfs: number, ofsBase: number, dst: number[]): void {
        const texelOfs = (surfaceOfs * 80 * this.KNumFloatInVector4) + (ofsBase * this.KNumFloatInVector4);

        for (let i=0; i<4; i++) {
            dst[texelOfs + i * this.KNumFloatInVector4 + 0] = src.get(i).x;
            dst[texelOfs + i * this.KNumFloatInVector4 + 1] = src.get(i).y;
            dst[texelOfs + i * this.KNumFloatInVector4 + 2] = src.get(i).z;
        }
    }

    private fromBezier5(src: BxBezier5Line3, surfaceOfs: number, ofsBase: number, dst: number[]): void {
        const texelOfs = (surfaceOfs * 80 * this.KNumFloatInVector4) + (ofsBase * this.KNumFloatInVector4);

        for (let i=0; i<6; i++) {
            dst[texelOfs + i * this.KNumFloatInVector4 + 0] = src.get(i).x;
            dst[texelOfs + i * this.KNumFloatInVector4 + 1] = src.get(i).y;
            dst[texelOfs + i * this.KNumFloatInVector4 + 2] = src.get(i).z;
        }
    }

    private fromBezier6(src: BxBezier6Line3, surfaceOfs: number, ofsBase: number, dst: number[]): void {
        const texelOfs = (surfaceOfs * 80 * this.KNumFloatInVector4) + (ofsBase * this.KNumFloatInVector4);

        for (let i=0; i<7; i++) {
            dst[texelOfs + i * this.KNumFloatInVector4 + 0] = src.get(i).x;
            dst[texelOfs + i * this.KNumFloatInVector4 + 1] = src.get(i).y;
            dst[texelOfs + i * this.KNumFloatInVector4 + 2] = src.get(i).z;
        }
    }

    private drawVtf(): void {
        this.gl_.activeTexture(this.gl_.TEXTURE0);
        this.gl_.bindTexture(this.gl_.TEXTURE_2D, this.texture_[0]);
    }

    // ------

    private initVtf_NonPreDiv(patch: BxCmSeparatePatch_Object, vtfAry: number[], cnt: number): number {
        for (let i=0; i<patch.numSurface; i++) {
            if (patch.get(i) && (<BxCmSeparatePatch_Surface>patch.get(i)).preDivided != true) {
                const {
                    hPosBez0, hPosBez1, hPosBez2, hPosBez3, vPosBez0, vPosBez1, vPosBez2, vPosBez3, hDiffBez0, hDiffBez1, hDiffBez2, hDiffBez3,
                    vDiffBez0, vDiffBez1, vDiffBez2, vDiffBez3
                } = this.getPosDiff(patch, i);

                this.convVtfInfo(hPosBez0, hPosBez1, hPosBez2, hPosBez3, vPosBez0, vPosBez1, vPosBez2, vPosBez3, hDiffBez0, hDiffBez1, hDiffBez2, hDiffBez3,
                                 vDiffBez0, vDiffBez1, vDiffBez2, vDiffBez3, cnt, vtfAry);

                cnt++;
            }
        }

        return cnt;
    }

    private initVtf_PreDiv(patch: BxCmSeparatePatch_Object, width: number, height: number, vtfAry: number[], cnt: number): number {
        for (let i=0; i<patch.numSurface; i++ ) {
            if (patch.get(i) && (<BxCmSeparatePatch_Surface>patch.get(i)).preDivided == true) {
                const {
                    hPosBez0, hPosBez1, hPosBez2, hPosBez3, vPosBez0, vPosBez1, vPosBez2, vPosBez3, hDiffBez0, hDiffBez1, hDiffBez2, hDiffBez3,
                    vDiffBez0, vDiffBez1, vDiffBez2, vDiffBez3
                } = this.getPosDiff(patch, i);

                this.convVtfInfo(hPosBez0, hPosBez1, hPosBez2, hPosBez3, vPosBez0, vPosBez1, vPosBez2, vPosBez3, hDiffBez0, hDiffBez1, hDiffBez2, hDiffBez3,
                                 vDiffBez0, vDiffBez1, vDiffBez2, vDiffBez3, cnt, vtfAry);

                cnt++;
            }
        }

        return cnt;
    }

    // -------------------------------------------------------

    private getPosDiff(patch: BxCmSeparatePatch_Object, surfaceNo: number): {
        hPosBez0: BxBezier3Line3|null, hPosBez1: BxBezier6Line3|null, hPosBez2: BxBezier6Line3|null, hPosBez3: BxBezier3Line3|null,
        vPosBez0: BxBezier3Line3|null, vPosBez1: BxBezier6Line3|null, vPosBez2: BxBezier6Line3|null, vPosBez3: BxBezier3Line3|null,
        hDiffBez0: BxBezier2Line3|null, hDiffBez1: BxBezier5Line3|null, hDiffBez2: BxBezier5Line3|null, hDiffBez3: BxBezier2Line3|null,
        vDiffBez0: BxBezier2Line3|null, vDiffBez1: BxBezier5Line3|null, vDiffBez2: BxBezier5Line3|null, vDiffBez3: BxBezier2Line3|null}
    {
        const {hPosBez0, hPosBez1, hPosBez2, hPosBez3} = this.getPosBezierH(patch, surfaceNo);
        const {vPosBez0, vPosBez1, vPosBez2, vPosBez3} = this.getPosBezierV(patch, surfaceNo);
        const {hDiffBez0, hDiffBez1, hDiffBez2, hDiffBez3} = this.getDiffBezierH(patch, surfaceNo);
        const {vDiffBez0, vDiffBez1, vDiffBez2, vDiffBez3} = this.getDiffBezierV(patch, surfaceNo);

        return {
            hPosBez0: hPosBez0, hPosBez1: hPosBez1, hPosBez2: hPosBez2, hPosBez3: hPosBez3, vPosBez0: vPosBez0, vPosBez1: vPosBez1, vPosBez2: vPosBez2,
            vPosBez3: vPosBez3, hDiffBez0: hDiffBez0, hDiffBez1: hDiffBez1, hDiffBez2: hDiffBez2, hDiffBez3: hDiffBez3, vDiffBez0: vDiffBez0,
            vDiffBez1: vDiffBez1, vDiffBez2: vDiffBez2, vDiffBez3: vDiffBez3
        }
    }

    // ------

    private getPosBezierH(src: BxCmSeparatePatch_Object, surfaceNo: number): {
        hPosBez0: BxBezier3Line3|null, hPosBez1: BxBezier6Line3|null, hPosBez2: BxBezier6Line3|null, hPosBez3: BxBezier3Line3|null}
    {
        const {posBez0, posBez1, posBez2, posBez3} = this.getPosBezierMain(src, surfaceNo, 0);

        return {hPosBez0: posBez0, hPosBez1: posBez1, hPosBez2: posBez2, hPosBez3: posBez3};
    }

    private getPosBezierV(src: BxCmSeparatePatch_Object, surfaceNo: number): {
        vPosBez0: BxBezier3Line3|null, vPosBez1: BxBezier6Line3|null, vPosBez2: BxBezier6Line3|null, vPosBez3: BxBezier3Line3|null}
    {
        const {posBez0, posBez1, posBez2, posBez3} = this.getPosBezierMain(src, surfaceNo, 1);

        return {vPosBez0: posBez0, vPosBez1: posBez1, vPosBez2: posBez2, vPosBez3: posBez3};
    }

    private getPosBezierMain(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number): {
        posBez0: BxBezier3Line3|null, posBez1: BxBezier6Line3|null, posBez2: BxBezier6Line3|null, posBez3: BxBezier3Line3|null}
    {
        let hvOfs: number, crossIdx: number;

        hvOfs    = 0;
        crossIdx = 0;
        const posBez0 = this.getPosBezierOuter(src, surfaceNo, hvId, hvOfs, crossIdx);
        const posBez1 = this.getPosBezierInner(src, surfaceNo, hvId, hvOfs);

        hvOfs    = 1;
        crossIdx = 6;
        const posBez3 = this.getPosBezierOuter(src, surfaceNo, hvId, hvOfs, crossIdx);
        const posBez2 = this.getPosBezierInner(src, surfaceNo, hvId, hvOfs,);

        return {posBez0: posBez0, posBez1: posBez1, posBez2: posBez2, posBez3: posBez3};
    }

    private getPosBezierOuter(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number, hvOfs: number, crossIdx: number): BxBezier3Line3|null {
        if (!src.get(surfaceNo))
            return null;

        const surface = <BxCmSeparatePatch_Surface>src.get(surfaceNo);
        if (!surface.vertex || !surface.surfaceEdge)
            return null;

        const vertex = <BxCmSeparatePatch_Vertex[]>surface.vertex;
        const surfaceEdge = <BxCmSeparatePatch_SurfaceEdge[][]>surface.surfaceEdge;

        const {vertexNo0, vertexNo1} = this.hVtoVertexNo(hvId, hvOfs);
        const vNo0 = vertexNo0;
        const vNo1 = vertexNo1;

        const wingHvId = 1 - hvId;

        const posBez = new BxBezier3Line3();
        posBez.get(0).setVec(<BxVec3>vertex[vNo0].pos);
        posBez.get(3).setVec(<BxVec3>vertex[vNo1].pos);
        posBez.get(1).setVec((<BxBezier6Line3>surfaceEdge[wingHvId][0].inner).get(crossIdx));
        posBez.get(2).setVec((<BxBezier6Line3>surfaceEdge[wingHvId][1].inner).get(crossIdx));

        return posBez;
    }

    private hVtoVertexNo(hvId: number, hvOfs: number): {vertexNo0: number, vertexNo1: number} {
        let vertexNo0: number, vertexNo1: number;

        if (hvId == 0) {
            if (hvOfs == 0) {
                vertexNo0 = 0;
                vertexNo1 = 1;
            }
            else {
                if (hvOfs != 1) alert("hvOfs != 1");
                vertexNo0 = 3;
                vertexNo1 = 2;
            }
        }
        else {
            if (hvId != 1) alert("hvId != 1");
            if (hvOfs == 0) {
                vertexNo0 = 0;
                vertexNo1 = 3;
            }
            else {
                if (hvOfs != 1) alert("hvOfs != 1");
                vertexNo0 = 1;
                vertexNo1 = 2;
            }
        }

        return {vertexNo0: vertexNo0, vertexNo1: vertexNo1};
    }

    private getPosBezierInner(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number, hvOfs: number): BxBezier6Line3|null {
        if (!src.get(surfaceNo))
            return null;

        const surface = <BxCmSeparatePatch_Surface>src.get(surfaceNo);
        if (!surface.surfaceEdge)
            return null;

        const surfaceEdge = <BxCmSeparatePatch_SurfaceEdge[][]>surface.surfaceEdge;

        const posBezInner = new BxBezier6Line3();
        posBezInner.setBez(<BxBezier6Line3>surfaceEdge[hvId][hvOfs].inner);

        return posBezInner;
    }

    // ------

    private getDiffBezierH(src: BxCmSeparatePatch_Object, surfaceNo: number): {
        hDiffBez0: BxBezier2Line3|null, hDiffBez1: BxBezier5Line3|null, hDiffBez2: BxBezier5Line3|null, hDiffBez3: BxBezier2Line3|null}
    {
        const {diffBez0, diffBez1, diffBez2, diffBez3} = this.getDiffBezierMain(src, surfaceNo, 0);

        return {hDiffBez0: diffBez0, hDiffBez1: diffBez1, hDiffBez2: diffBez2, hDiffBez3: diffBez3};
    }

    private getDiffBezierV(src: BxCmSeparatePatch_Object, surfaceNo: number): {
        vDiffBez0: BxBezier2Line3|null, vDiffBez1: BxBezier5Line3|null, vDiffBez2: BxBezier5Line3|null, vDiffBez3: BxBezier2Line3|null}
    {
        const {diffBez0, diffBez1, diffBez2, diffBez3} = this.getDiffBezierMain(src, surfaceNo, 1);

        return {vDiffBez0: diffBez0, vDiffBez1: diffBez1, vDiffBez2: diffBez2, vDiffBez3: diffBez3};
    }

    private getDiffBezierMain(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number): {
        diffBez0: BxBezier2Line3|null, diffBez1: BxBezier5Line3|null, diffBez2: BxBezier5Line3|null, diffBez3: BxBezier2Line3|null}
    {
        let hvOfs: number, crossIdx: number;

        hvOfs    = 0;
        crossIdx = 0;
        const diffBez0 = this.getDiffBezierOuter(src, surfaceNo, hvId, hvOfs, crossIdx);
        const diffBez1 = this.getDiffBezierInner(src, surfaceNo, hvId, hvOfs);

        hvOfs    = 1;
        crossIdx = 6;
        const diffBez3 = this.getDiffBezierOuter(src, surfaceNo, hvId, hvOfs, crossIdx);
        const diffBez2 = this.getDiffBezierInner(src, surfaceNo, hvId, hvOfs);

        return {diffBez0: diffBez0, diffBez1: diffBez1, diffBez2: diffBez2, diffBez3: diffBez3};
    }

    private getDiffBezierOuter(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number, hvOfs: number, crossIdx: number): BxBezier2Line3|null {
        if (!src.get(surfaceNo))
            return null;

        const surface = <BxCmSeparatePatch_Surface>src.get(surfaceNo);
        if (!surface.vertex || !surface.surfaceEdge)
            return null;

        const vertex = <BxCmSeparatePatch_Vertex[]>surface.vertex;
        const surfaceEdge = <BxCmSeparatePatch_SurfaceEdge[][]>surface.surfaceEdge;

        const {vertexNo0, vertexNo1} = this.hVtoVertexNo(hvId, hvOfs);
        const vNo0 = vertexNo0;
        const vNo1 = vertexNo1;

        const wingHvId = 1 - hvId;

        const posBez = new BxBezier3Line3();
        posBez.get(0).setVec(<BxVec3>vertex[vNo0].pos);
        posBez.get(3).setVec(<BxVec3>vertex[vNo1].pos);
        posBez.get(1).setVec((<BxBezier6Line3>surfaceEdge[wingHvId][0].inner).get(crossIdx));
        posBez.get(2).setVec((<BxBezier6Line3>surfaceEdge[wingHvId][1].inner).get(crossIdx));

        const diffBez = posBez.diff();

        if (diffBez.get(0).length() < (BxMath.KNearZero * 10.0)) alert("diffBez.get(0).length() < (BxMath.KNearZero * 10.0)");
        if (diffBez.get(2).length() < (BxMath.KNearZero * 10.0)) alert("diffBez.get(2).length() < (BxMath.KNearZero * 10.0)");

        return diffBez;
    }

    private getDiffBezierInner(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number, hvOfs: number): BxBezier5Line3|null {
        if (!src.get(surfaceNo))
            return null;

        const surface = <BxCmSeparatePatch_Surface>src.get(surfaceNo);
        if (!surface.surfaceEdge)
            return null;

        const surfaceEdge = <BxCmSeparatePatch_SurfaceEdge[][]>surface.surfaceEdge;

        const diffBezInner = (<BxBezier6Line3>surfaceEdge[hvId][hvOfs].inner).diff();
        return diffBezInner;
    }
}
