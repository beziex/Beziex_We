import { vec3, mat3, mat4 } from "gl-matrix";
import { BxGlProgramBase } from './bxGlProgramBase';
import { BxGlMain } from './bxGlMain';
import { BxCmSeparatePatch_Object } from '../bxCom/bxCmSeparatePatch';
import { BxCmUiParam } from '../bxCom/bxCmUiParam';

class GlExt {
    public vao: OES_vertex_array_object;
    public instancedAry: ANGLE_instanced_arrays|null;

    public constructor(gl: WebGLRenderingContext) {
        if (!gl.getExtension("OES_texture_float")) alert("!gl.getExtension(\"OES_texture_float\")");
        if (!gl.getExtension("OES_element_index_uint")) alert("!gl.getExtension(\"OES_element_index_uint\")");
 
        this.vao = <OES_vertex_array_object>gl.getExtension("OES_vertex_array_object");
        this.instancedAry = <ANGLE_instanced_arrays|null>gl.getExtension("ANGLE_instanced_arrays");
    }
};

class BufInfo {

    protected gl_: WebGLRenderingContext;
    public    glExt: GlExt;

    public vbo:         (WebGLBuffer|null)[];
    public ebo:         (WebGLBuffer|null)[];
    public numVertices: number;
    public numIndices:  number;
    public vaoHandle:   (WebGLVertexArrayObjectOES|null)[];

    public constructor(gl: WebGLRenderingContext) {
        this.gl_ = gl;
        this.glExt = new GlExt(this.gl_);

        this.vbo = new Array<WebGLBuffer>(2);
        this.vbo[0] = null;
        this.vbo[1] = null;

        this.ebo = new Array<WebGLBuffer>(1);
        this.ebo[0] = null;

        this.numVertices = Number.MAX_SAFE_INTEGER;
        this.numIndices  = Number.MAX_SAFE_INTEGER;

        this.vaoHandle = new Array<WebGLVertexArrayObjectOES>(1);
        this.vaoHandle[0] = null;
    }

    // ------

    public hasVertexBuffer(): boolean {
        if (this.vbo[0])
            return true;

        return false;
    }

    public releaseVertexBuffer(): void {
        this.gl_.deleteBuffer(this.vbo[0]);
        this.gl_.deleteBuffer(this.vbo[1]);

        this.vbo[0] = null;
        this.vbo[1] = null;
    }

    public releaseVaoHandle(): void {
        this.glExt.vao.deleteVertexArrayOES(this.vaoHandle[0]);

        this.vaoHandle[0] = null;
    }

    // ------

    public hasIndexBuffer(): boolean {
        if (this.ebo[0])
            return true;

        return false;
    }

    public releaseIndexBuffer(): void {
        this.gl_.deleteBuffer(this.ebo[0]);

        this.ebo[0]     = null;
        this.numIndices = Number.MAX_SAFE_INTEGER;
    }
}

export abstract class BxGlShaderBase {

    private readonly KPi = 3.141592;

    // -------------------------------------------------------

    protected gl_: WebGLRenderingContext;
    private   canvasID_: string;
    protected parent_: BxGlMain;
    protected programObj_: BxGlProgramBase|null = null;

    public tessLevel = 8;
    public buf: BufInfo;

    // -------------------------------------------------------

    protected abstract setVertexBuffer(): void;
    protected abstract setVAO(): void;
    protected abstract patchParameter(): void;
    protected abstract drawMain(): void;

    protected setIndexBuffer(): void { }

    // -------------------------------------------------------

    public constructor(gl: WebGLRenderingContext, canvasID: string, parent: BxGlMain) {
        this.gl_       = gl;
        this.canvasID_ = canvasID;
        this.parent_   = parent;

        this.buf = new BufInfo(this.gl_);
    }

    public genBuf(patch: BxCmSeparatePatch_Object, param: BxCmUiParam): void {
        this.tessLevel = param.numTess;

        this.setVertexBuffer();
        this.setVAO();

        if (param.min && param.max) {
            const min = new vec3([param.min.x, param.min.y, param.min.z]);
            const max = new vec3([param.max.x, param.max.y, param.max.z]);

            this.parent_.setObjSize(min, max);
        }
    }

    public draw(param: BxCmUiParam): void {
        this.gl_.useProgram((<BxGlProgramBase>this.programObj_).shaderProgram());

        this.tessLevel = param.numTess;

        this.setTessLevel();
        this.setProject();

        this.setView(0.0);
        this.setLight();

        this.drawMain();
    }

    public isEmpty(): boolean {
        if (this.buf.numVertices == Number.MAX_SAFE_INTEGER)
            return true;

        return false;
    }

    public releaseBufInfo(): void {
        this.buf.releaseVertexBuffer();
        this.buf.releaseVaoHandle();
    }

    // ------

    protected setFaceColor(): void {
        const ambient   = vec3.fromValues(0.2,  0.2, 0.2);
        const diffuse   = vec3.fromValues(0.75, 0.0, 0.0);
        const specular  = vec3.fromValues(0.4,  0.4, 0.4);
        const shininess = 50.0;

        const programObj    = <BxGlProgramBase>this.programObj_;
        const shaderProgram = <WebGLProgram>programObj.shaderProgram();

        const ambientLocation   = this.gl_.getUniformLocation(shaderProgram, "mtlAmb");
        const diffuseLocation   = this.gl_.getUniformLocation(shaderProgram, "mtlDif");
        const specularLocation  = this.gl_.getUniformLocation(shaderProgram, "mtlSpec");
        const shininessLocation = this.gl_.getUniformLocation(shaderProgram, "mtlShin");

        this.gl_.uniform3fv(ambientLocation,   ambient);
        this.gl_.uniform3fv(diffuseLocation,   diffuse);
        this.gl_.uniform3fv(specularLocation,  specular);
        this.gl_.uniform1f( shininessLocation, shininess);
    }

    // ------

    private setView(ofsZ: number): void {
        const cameraMatrix = mat4.create();
        const viewMatrix   = mat4.create();

        const eye    = vec3.fromValues(0.0, 0.0, (10.0 + ofsZ));
        const center = vec3.fromValues(0.0, 0.0, (0.0 + ofsZ));
        const up     = vec3.fromValues(0.0, 1.0, 0.0);

        const transformMatrix = this.transformMatrix();
        mat4.lookAt(cameraMatrix, eye, center, up);
        mat4.mul(viewMatrix, cameraMatrix, transformMatrix);

        const normalMatrix = this.normalMatrix();

        const programObj    = <BxGlProgramBase>this.programObj_;
        const shaderProgram = <WebGLProgram>programObj.shaderProgram();

        const viewMatrixLocation = this.gl_.getUniformLocation(shaderProgram, "viewMatrix");
        this.gl_.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

        const normalMatrixLocation = this.gl_.getUniformLocation(shaderProgram, "normalMatrix");
        this.gl_.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);
    }

    private transformMatrix(): mat4 {
        return this.parent_.transformMatrix();
    }

    private normalMatrix(): mat3 {
        return this.parent_.normalMatrix();
    }

    // -------------------------------------------------------

    private setTessLevel(): void {
        const programObj    = <BxGlProgramBase>this.programObj_;
        const shaderProgram = <WebGLProgram>programObj.shaderProgram();

        const tessLevelLocation = this.gl_.getUniformLocation(shaderProgram, "tessLevel");
        this.gl_.uniform1f(tessLevelLocation, this.tessLevel);
    }

    private setProject(): void {
        const canvas = <HTMLCanvasElement>document.getElementById(this.canvasID_);

        this.gl_.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

        let   fieldOfViewY: number;
        const fieldOfViewMin = 30.0 * (this.KPi / 180.0);
        if (canvas.clientWidth < canvas.clientHeight) {
            const zLength = (canvas.clientWidth / 2) * Math.tan(((this.KPi / 180.0) * 90.0) - (fieldOfViewMin / 2));
            fieldOfViewY = Math.atan((canvas.clientHeight / 2) / zLength) * 2;
        }
        else
            fieldOfViewY = fieldOfViewMin;

        const aspect = canvas.clientWidth / canvas.clientHeight;

        const projMatrix = mat4.create();
        mat4.perspective(projMatrix, fieldOfViewY, aspect, 1.0, 100.0);

        const programObj    = <BxGlProgramBase>this.programObj_;
        const shaderProgram = <WebGLProgram>programObj.shaderProgram();

        const projMatrixLocation = this.gl_.getUniformLocation(shaderProgram, "projMatrix");
        this.gl_.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
    }

    private setLight(): void {
        this.setLight0();
    }

    private setLight0(): void {
        const ambient  = vec3.fromValues(0, 0, 0);
        const diffuse  = vec3.fromValues(1, 1, 1);
        const specular = vec3.fromValues(1, 1, 1);
        const lightDir = vec3.fromValues(-0.5, -3.0, -4.0);

        const mLightDir = vec3.create();
        vec3.negate(mLightDir, lightDir);

        const lightVec = vec3.create();
        vec3.normalize(lightVec, mLightDir);

        const programObj    = <BxGlProgramBase>this.programObj_;
        const shaderProgram = <WebGLProgram>programObj.shaderProgram();

        const ambientLocation  = this.gl_.getUniformLocation(shaderProgram, "lightAmb");
        const diffuseLocation  = this.gl_.getUniformLocation(shaderProgram, "lightDif");
        const specularLocation = this.gl_.getUniformLocation(shaderProgram, "lightSpec");
        const lightVecLocation = this.gl_.getUniformLocation(shaderProgram, "lightVec");

        this.gl_.uniform3fv(ambientLocation,  ambient);
        this.gl_.uniform3fv(diffuseLocation,  diffuse);
        this.gl_.uniform3fv(specularLocation, specular);
        this.gl_.uniform3fv(lightVecLocation, lightVec);
    }
}
