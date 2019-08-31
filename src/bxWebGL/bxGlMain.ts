import { BxGlMainBase } from './bxGlMainBase';
import { BxGlShaderBase } from './bxGlShaderBase';
import { BxGlShader_Face } from './bxGlShader_Face';
import { BxGlShader_Wire } from './bxGlShader_Wire';
import { BxGlProgContainer } from './bxGlProgContainer';
import { BxCmUiParam } from '../bxCom/bxCmUiParam';
import { BxCmSeparatePatch_Object } from '../bxCom/bxCmSeparatePatch';
import { BxCmCorrectSeparator } from '../bxCom/bxCmCorrectSeparator';

export class BxGlMain extends BxGlMainBase {

    private canvasID_: string;
    private progContainer_: BxGlProgContainer;

    private patch_: BxCmSeparatePatch_Object|null = null;
    private shade_: BxGlShader_Face|null          = null;
    private wire_:  BxGlShader_Wire|null          = null;

    // -------------------------------------------------------

    public constructor(gl: WebGLRenderingContext, canvasID: string, patch: BxCmSeparatePatch_Object, progContainer: BxGlProgContainer) {
        super(gl);

        this.canvasID_      = canvasID;
        this.progContainer_ = progContainer;

        this.patch_ = patch;
        this.shade_ = new BxGlShader_Face(gl, canvasID, progContainer, this);
        this.wire_  = null;
    }

    protected setModelData(param: BxCmUiParam): void {
        this.genBufInner(param);
    }

    protected genBufMain(param: BxCmUiParam): void {
        this.genBufInner(param);
    }

    protected hasBufferMain(): boolean {
        return (this.patch_ != null);
    }

    // ------

    protected releaseBufInfo(): void {
        if (this.shade_)
            this.shade_.releaseBufInfo();

        if (this.wire_)
            this.wire_.releaseBufInfo();
    }

    protected isEmptyMain(): boolean|null {
        return this.shade_ ? this.shade_.isEmpty() : null;
    }

    protected drawMain(param: BxCmUiParam): void {
        if (this.shade_)
            this.shade_.draw(param);

        if (this.wire_)
            this.wire_.draw(param);
    }

    protected changeShaderMain(): void {
        this.shade_ = new BxGlShader_Face(this.gl_, this.canvasID_, this.progContainer_, this);
        this.wire_  = null;
    }

    protected changeShaderMain_Wire(): void {
        this.shade_ = null;
        this.wire_  = new BxGlShader_Wire(this.gl_, this.canvasID_, this.progContainer_, this);
    }

    protected setPatchMain(patch: BxCmSeparatePatch_Object): void {
        this.patch_ = patch;
    }

    // -------------------------------------------------------

    private genBufInner(param: BxCmUiParam): void {
        if (!this.patch_)
            return;

        const tmp = this.correctProc(this.patch_);

        if (this.shade_)
            this.shade_.genBuf(tmp, param);

        if (this.wire_)
            this.wire_.genBuf(tmp, param);
    }

    private correctProc(src: BxCmSeparatePatch_Object): BxCmSeparatePatch_Object {
        const objCorrect = new BxCmCorrectSeparator();
        return objCorrect.exec(src);
    }
}
