import { BxRdMain }    from './bxRead/bxRdMain';
import { BxMdRoot }    from './bxModel/bxMdRoot';
import { BxCmUiParam } from './bxCom/bxCmUiParam';
import { BxGlRoot }    from './bxWebGL/bxGlRoot';
import { BxRdModel }   from './bxRead/bxRdModel';
import { BxCmSeparatePatch_Object } from './bxCom/bxCmSeparatePatch';

export class BxRoot {

    public objMdRoot: BxMdRoot|null;
    public objGlRoot: BxGlRoot|null;
    public objRdModel: BxRdModel|null;
    public param: BxCmUiParam|null;
 
    private isInitialized_: boolean;

    constructor() {
        this.objMdRoot  = null;
        this.objGlRoot  = null;
        this.objRdModel = null;

        this.param          = null;
        this.isInitialized_ = false;
    }

    public init(): void {
        const objRdMain = new BxRdMain((beziexDataJson: string, vertexShaderCode: string, fragmentShaderCode: string, fragmentShaderCode_wire: string) => {
            this.delayInit(beziexDataJson, vertexShaderCode, fragmentShaderCode, fragmentShaderCode_wire);
        });
        objRdMain.exec();
    }

    public draw(): void {
        if (this.isInitialized_)
            (<BxGlRoot>this.objGlRoot).draw(<BxCmUiParam>this.param);
    }

    public changeShader(): void {
        if (this.isInitialized_)
            (<BxGlRoot>this.objGlRoot).changeShader(<BxCmUiParam>this.param);
    }

    public setPatch(patch: BxCmSeparatePatch_Object): void {
        (<BxGlRoot>this.objGlRoot).setPatch(patch);
    }

    public genBuf(): void {
        if (this.isInitialized_)
            (<BxGlRoot>this.objGlRoot).genBuf(<BxCmUiParam>this.param);
    }

    private delayInit(beziexDataJson: string, vertexShaderCode: string, fragmentShaderCode: string, fragmentShaderCode_wire: string): void {
        this.objMdRoot  = new BxMdRoot();
        this.objGlRoot  = new BxGlRoot();
        this.objRdModel = new BxRdModel();

        this.param = new BxCmUiParam();
        const patch = this.objMdRoot.exec(beziexDataJson, this.param);

        this.objGlRoot.exec(patch, this.param, vertexShaderCode, fragmentShaderCode, fragmentShaderCode_wire);

        this.isInitialized_ = true;
    }
}
