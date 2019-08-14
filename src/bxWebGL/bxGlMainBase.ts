import { vec3, mat3, mat4 } from "gl-matrix";
import { BxCmUiParam } from '../bxCom/bxCmUiParam';
import { BxVec3 } from '../bxCom/bxCmMath';
import { BxCmSeparatePatch_Object, BxCmSeparatePatch_Surface } from '../bxCom/bxCmSeparatePatch';

export abstract class BxGlMainBase {

    protected abstract setModelData(param: BxCmUiParam): void;
    protected abstract genBufMain(param: BxCmUiParam): void;
    protected abstract hasBufferMain(): boolean;
    protected abstract releaseBufInfo(): void;
    protected abstract isEmptyMain(): boolean|null;
    protected abstract drawMain(param: BxCmUiParam): void;
    protected abstract changeShaderMain(): void;
    protected abstract changeShaderMain_Wire(): void;
    protected abstract setPatchMain(patch: BxCmSeparatePatch_Object): void;

    // -------------------------------------------------------

    private readonly KPi            = 3.141592;
    private readonly KDispSizeRatio = 2.5;

    private objSize_:          number = 0;
    private objCenter_:        vec3;
    private matScaleSlider_:   mat4;
    private matMoveSlider_:    mat4;
    private matRotSlider_:     mat4;
    private matRotSlider_Org_: mat4;

    // -------------------------------------------------------

    protected gl_: WebGLRenderingContext;

    private initDrawFlag_: boolean;
    public  initReadFlag:  boolean;

    // -------------------------------------------------------

    public constructor(gl: WebGLRenderingContext) {
        this.gl_ = gl;

        this.objCenter_       = vec3.create();
        this.matScaleSlider_  = mat4.create();
        this.matMoveSlider_   = mat4.create();
        this.matRotSlider_    = mat4.create();
        this.matRotSlider_Org_= mat4.create();

        this.initDrawFlag_ = false;
        this.initReadFlag  = false;
    }

    public release(releasing: boolean): void {
        if (releasing)
            this.releaseBufInfo();
    }

    // ------

    public draw(param: BxCmUiParam): void {
        if (this.initDrawFlag_ == false ) {
            this.initParams();
            this.initDrawFlag_ = true;
        }

        if (this.initReadFlag == false) {
            this.setModelData(param);
            this.initReadFlag = true;
        }

        if (this.isEmpty() == true)
            this.clrScreen();
        else {
            this.clrScreen();
            this.drawMain(param);
        }
    }

    public changeShader(param: BxCmUiParam): void {
        if (param.isWire)
            this.changeShaderMain_Wire();
        else
            this.changeShaderMain();
    }

    public setPatch(patch: BxCmSeparatePatch_Object): void {
        this.setPatchMain(patch);
    }

    public genBuf(param: BxCmUiParam): void {
        this.genBufMain(param);
    }

    public hasBuffer(): boolean {
        return this.hasBufferMain();
    }

    public sliderMatrix(valRotH: number, valRotV: number, valRotAxisZ: number, valMoveH: number, valMoveV: number, valScale: number): void {
        this.sliderMatrix_Scale(valScale);
        this.sliderMatrix_Move(valMoveH, valMoveV);
        this.sliderMatrix_Rot(valRotH, valRotV, -valRotAxisZ);
    }

    public fixMatRot(): void {
        mat4.copy(this.matRotSlider_Org_, this.matRotSlider_);
    }

    public isEmpty(): boolean|null {
        return this.isEmptyMain();
    }

    // ------

    public initMatrix(): void {
        this.objCenter_ = vec3.fromValues(0.0, 0.0, 0.0);

        this.initMatrix_Scale();
        this.initMatrix_Move();
        this.initMatrix_Rot();
    }

    public initMatrix_Scale(): void {
        mat4.identity(this.matScaleSlider_);
    }

    public initMatrix_Move(): void {
        mat4.identity(this.matMoveSlider_);
    }

    public initMatrix_Rot(): void {
        mat4.identity(this.matRotSlider_);
        mat4.identity(this.matRotSlider_Org_);
    }

    // ------

    public clrScreen(): void {
        this.gl_.clearColor(211/255, 211/255, 211/255, 255/255);
        this.gl_.clear(this.gl_.COLOR_BUFFER_BIT | this.gl_.DEPTH_BUFFER_BIT);
    }

    // -------------------------------------------------------

    public getMinMax(patch: BxCmSeparatePatch_Object): {min: vec3, max: vec3} {
        let min = vec3.fromValues(0, 0, 0);
        let max = vec3.fromValues(0, 0, 0);

        for (let i=0; i<3; i++) {
            if (patch.get(0) && (<BxCmSeparatePatch_Surface>patch.get(0)).vertex) {
                const vertex = (<BxCmSeparatePatch_Surface>patch.get(0)).vertex;
                if (vertex && vertex[0].pos)
                    min[i] = max[i] = (<BxVec3>vertex[0].pos).get(i);
            }
        }

        for (let i=1; i<patch.numSurface; i++) {
            for (let j=0; j<4; j++) {
                for (let k=0; k<3; k++) {
                    if (patch.get(i) && (<BxCmSeparatePatch_Surface>patch.get(i)).vertex) {
                        const vertex = (<BxCmSeparatePatch_Surface>patch.get(i)).vertex;
                        if (vertex && vertex[j].pos) {
                            if (min[k] > (<BxVec3>vertex[j].pos).get(k))
                                min[k] = (<BxVec3>vertex[j].pos).get(k);
                            if (max[k] < (<BxVec3>vertex[j].pos).get(k))
                                max[k] = (<BxVec3>vertex[j].pos).get(k);
                        }
                    }
                }
            }
        }

        return {min, max};
    }

    public getMinMax2(vertices: number[], numSizeCalcVertices: number): {min: vec3, max: vec3} {
        let min = vec3.fromValues(0, 0, 0);
        let max = vec3.fromValues(0, 0, 0);

        for (let i=0; i<3; i++)
            min[i] = max[i] = vertices[i];

        const numVertices = Math.floor(numSizeCalcVertices / 3);
        for (let i=1; i<numVertices; i++) {
            for (let j=0; j<3; j++) {
                const k = i * 3 + j;
                if (min[j] > vertices[k])
                    min[j] = vertices[k];
                if (max[j] < vertices[k])
                    max[j] = vertices[k];
            }
        }

        return {min, max};
    }

    public setObjSize(min: vec3, max: vec3): void {
        const tmp = new Array<number>(3);

        for (let i=0; i<3; i++) {
            this.objCenter_[i] = (min[i] + max[i]) / 2.0;
            tmp[i] = max[i] - min[i];
        }

        this.objSize_ = Math.sqrt(tmp[0]*tmp[0] + tmp[1]*tmp[1] + tmp[2]*tmp[2]);
    }

    // -------------------------------------------------------

    public transformMatrix(): mat4 {
        const matMoveFit  = mat4.create();
        const matScaleFit = mat4.create();

        mat4.fromTranslation(matMoveFit, vec3.fromValues(-this.objCenter_[0], -this.objCenter_[1], -this.objCenter_[2]));
    
        const scale = 2.0 * this.KDispSizeRatio / this.objSize_;
        mat4.fromScaling(matScaleFit, vec3.fromValues(scale, scale, scale));

        const mtx0 = mat4.create();
        const mtx1 = mat4.create();
        const mtx2 = mat4.create();
        const mtx3 = mat4.create();
        mat4.mul(mtx0, this.matRotSlider_, matMoveFit);
        mat4.mul(mtx1, this.matMoveSlider_, mtx0);
        mat4.mul(mtx2, this.matScaleSlider_, mtx1);
        mat4.mul(mtx3, matScaleFit, mtx2);

        return mtx3;
    }

    public normalMatrix(): mat3 {
        let result = mat3.create();
        mat3.fromMat4(result, this.matRotSlider_);

        return result;
    }

    // -------------------------------------------------------

    private initParams(): void {
        this.gl_.disable(this.gl_.CULL_FACE);

        this.gl_.enable(this.gl_.DEPTH_TEST);
        this.gl_.depthFunc(this.gl_.LEQUAL);
    }

    // -------------------------------------------------------

    private sliderMatrix_Scale(valScale: number): void {
        let scale: number;
        if (valScale >= 0.5) {
            const  t = (valScale - 0.5) * 2.0;
            scale = (1.0 - t) * 1.0 + t * 10.0;
        }
        else {
            const  t = valScale * 2.0;
            scale = (1.0 - t) * 0.1 + t * 1.0;
        }

        mat4.fromScaling(this.matScaleSlider_, vec3.fromValues(scale, scale, scale));
    }

    private sliderMatrix_Move(valMoveH: number, valMoveV: number): void {
        const moveLen = this.objSize_ / this.KDispSizeRatio;

        const moveH = ( 1.0 - valMoveH ) * -moveLen + valMoveH * moveLen;
        const moveV = ( 1.0 - valMoveV ) * -moveLen + valMoveV * moveLen;

        mat4.fromTranslation(this.matMoveSlider_, vec3.fromValues(moveH, moveV, 0.0));
    }

    private sliderMatrix_Rot(valRotH: number, valRotV: number, valRotAxisZ: number): void {
        const matRotV     = mat4.create();
        const matRotH     = mat4.create();
        const matRotAxisZ = mat4.create();

        const rotV     = (1.0 - valRotV    ) * -this.KPi + valRotV     *  this.KPi;
        const rotH     = (1.0 - valRotH    ) *  this.KPi + valRotH     * -this.KPi;
        const rotAxisZ = (1.0 - valRotAxisZ) *  this.KPi + valRotAxisZ * -this.KPi;

        mat4.fromXRotation(matRotV,     -rotV);
        mat4.fromYRotation(matRotH,     -rotH);
        mat4.fromZRotation(matRotAxisZ, -rotAxisZ);

        const mtx0 = mat4.create();
        const mtx1 = mat4.create();
        mat4.mul(mtx0, matRotAxisZ, this.matRotSlider_Org_);
        mat4.mul(mtx1, matRotH, mtx0);
        mat4.mul(this.matRotSlider_, matRotV, mtx1);
    }
}
