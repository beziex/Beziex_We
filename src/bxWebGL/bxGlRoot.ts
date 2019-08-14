import { BxGlMain } from './bxGlMain';
import { BxGlProgramBase } from './bxGlProgramBase';
import { BxGlProgramObject, BxGlProgContainer } from './bxGlProgContainer';
import { BxCmUiParam } from '../bxCom/bxCmUiParam';
import { BxCmSeparatePatch_Object } from '../bxCom/bxCmSeparatePatch';

export class BxGlRoot {

    private readonly KCanvasID = "gl-canvas";

    public objGlMain: BxGlMain|null;
    public progContainer: BxGlProgContainer|null;

    constructor() {
        this.objGlMain = null;
        this.progContainer = null;
    }

    public exec(patch: BxCmSeparatePatch_Object|null, param: BxCmUiParam, vertexShaderCode: string, fragmentShaderCode: string,
                fragmentShaderCode_wire: string): void {
        const canvas = <HTMLCanvasElement>document.getElementById(this.KCanvasID);
        const gl = canvas.getContext("webgl");

        if (gl && patch) {
            this.progContainer = this.newProgContainer(gl, vertexShaderCode, fragmentShaderCode, fragmentShaderCode_wire);
            this.objGlMain = new BxGlMain(gl, this.KCanvasID, patch, this.progContainer);

            this.objGlMain.draw(param);
        }
    }

    public draw(param: BxCmUiParam): void {
        (<BxGlMain>this.objGlMain).draw(param);
    }

    public changeShader(param: BxCmUiParam): void {
        (<BxGlMain>this.objGlMain).changeShader(param);
    }

    public setPatch(patch: BxCmSeparatePatch_Object): void {
        (<BxGlMain>this.objGlMain).setPatch(patch);
    }

    public genBuf(param: BxCmUiParam): void {
        (<BxGlMain>this.objGlMain).genBuf(param);
    }

    private newProgContainer(gl: WebGLRenderingContext, vertexShaderCode: string, fragmentShaderCode: string,
                             fragmentShaderCode_wire: string): BxGlProgContainer {
        const viewProgGL3_FaceObj: BxGlProgramObject = new BxGlProgramBase(gl, vertexShaderCode, fragmentShaderCode);
        const viewProgGL3_WireObj: BxGlProgramObject = new BxGlProgramBase(gl, vertexShaderCode, fragmentShaderCode_wire);

        return new BxGlProgContainer(viewProgGL3_FaceObj, viewProgGL3_WireObj);
    }
}
