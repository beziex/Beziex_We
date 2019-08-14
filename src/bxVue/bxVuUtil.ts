// @ts-ignore: Unreachable code error
import * as isMobile from "../../node_modules/ismobilejs/dist/isMobile.min.js";

import { BxRoot }      from '../bxRoot';
import { BxCmUiParam } from '../bxCom/bxCmUiParam';
import { BxGlRoot }    from '../bxWebGL/bxGlRoot';
import { BxGlMain }    from '../bxWebGL/bxGlMain';
import { BxRdRoot }    from '../bxRead/bxRdRoot';
import { BxRdModel }   from '../bxRead/bxRdModel';
import { BxMdRoot }    from '../bxModel/bxMdRoot';
import { BxCmSeparatePatch_Object } from '../bxCom/bxCmSeparatePatch';

export class BxControlValueConst {
    public static readonly SliderTess = 8;
    public static readonly RadioShape = "Solid";
    
    public static readonly SliderRotV  = 50;
    public static readonly SliderRotH  = 50;
    public static readonly SliderRotR  = 50;
    public static readonly SliderMovH  = 50;
    public static readonly SliderMovV  = 50;
    public static readonly SliderScale = 50;
}

export class BxControlValue {
    public sliderTess = BxControlValueConst.SliderTess;
    public radioShape = BxControlValueConst.RadioShape;
    
    public sliderRotV  = BxControlValueConst.SliderRotV;
    public sliderRotH  = BxControlValueConst.SliderRotH;
    public sliderRotR  = BxControlValueConst.SliderRotR;
    public sliderMovH  = BxControlValueConst.SliderMovH;
    public sliderMovV  = BxControlValueConst.SliderMovV;
    public sliderScale = BxControlValueConst.SliderScale;
}

export class TransInfo {
    public valRotH: number  = 0; public valRotV: number  = 0; public valRotAxisZ: number = 0;
    public valMoveH: number = 0; public valMoveV: number = 0; public valScale: number = 0;
}

export class BxVuUtil {
    private readonly KCanvasID = "gl-canvas";

    private nowResize_ = false;
    private timerId_: any;

    private rdRoot_: BxRdRoot = new BxRdRoot();

    public resizeCanvas(objRoot: BxRoot): void {
        this.resizeCanvasMain(objRoot);
    }

    public isMobile(): boolean {
        return isMobile.any;
    }
    public isVertical(): boolean {
        return (window.innerWidth <= window.innerHeight);
    }

    // ------------------------------------------------

    private resizeCanvasMain(objRoot: BxRoot): void {
        const canvas = <HTMLCanvasElement>document.getElementById(this.KCanvasID);
        if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
            if (!this.nowResize_) {
                canvas.width  = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                objRoot.draw();

                this.intervalForResizeCanvas(canvas, objRoot);
            }

            this.nowResize_ = true;
        }
    }

    private intervalForResizeCanvas(canvas: HTMLCanvasElement, objRoot: BxRoot): void {
        this.timerId_ = setInterval(() => {
            canvas.width  = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            objRoot.draw();
            if (!this.nowResize_)
                clearInterval(this.timerId_);
            
            this.nowResize_ = false;
        }, 200);
    }

    // ------------------------------------------------

    private kFocusRotUnknown_ = -1;
    private kFocusRotH_ = 0;
    private kFocusRotV_ = 1;
    private kFocusRotR_ = 2;

    private focusRot_: number = this.kFocusRotUnknown_;

    // ------------------------------------------------

    public selectFile_Selected(index: number, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.initControl(objCtrlVal, objRoot);

        (<BxRdModel>objRoot.objRdModel).exec(index, (beziexDataJson: string) => {
            const param: BxCmUiParam = <BxCmUiParam>objRoot.param;
            const patch = (<BxMdRoot>objRoot.objMdRoot).exec(beziexDataJson, param);

            objRoot.setPatch(<BxCmSeparatePatch_Object>patch);
            objRoot.genBuf();
            objRoot.draw();               
        });
    }

    public sliderTess_Changed(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        (<BxCmUiParam>objRoot.param).numTess = Number(objCtrlVal.sliderTess);
        objRoot.draw();
    }

    public sliderTess_DragStarted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderTess_DragCompleted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public radioFaceType_Checked(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        (<BxCmUiParam>objRoot.param).isWire = false;

        objRoot.changeShader();
        objRoot.genBuf();
        objRoot.draw();
    }

    public radioWireType_Checked(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        (<BxCmUiParam>objRoot.param).isWire = true;
        
        objRoot.changeShader();
        objRoot.genBuf();
        objRoot.draw();
    }

    // ------------------------------------------------

    public sliderRotH_Changed(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        if (this.focusRot_ != this.kFocusRotH_) {
            this.focusRot_ = this.kFocusRotH_;

            this.fixMatRot(objRoot);
            objCtrlVal.sliderRotV = 50;
            objCtrlVal.sliderRotR = 50;
        }

        this.setMatrixAndDraw(objCtrlVal, objRoot);
    }

    public sliderRotV_Changed(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        if (this.focusRot_ != this.kFocusRotV_) {
            this.focusRot_ = this.kFocusRotV_;

            this.fixMatRot(objRoot);
            objCtrlVal.sliderRotH = 50;
            objCtrlVal.sliderRotR = 50;
        }

        this.setMatrixAndDraw(objCtrlVal, objRoot);
    }

    public sliderRotR_Changed(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        if (this.focusRot_ != this.kFocusRotR_) {
            this.focusRot_ = this.kFocusRotR_;

            this.fixMatRot(objRoot);
            objCtrlVal.sliderRotH = 50;
            objCtrlVal.sliderRotV = 50;
        }

        this.setMatrixAndDraw(objCtrlVal, objRoot);
    }

    public sliderRotH_DragStarted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderRotV_DragStarted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderRotR_DragStarted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderRotH_DragCompleted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderRotV_DragCompleted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderRotR_DragCompleted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    // ------------------------------------------------

    public sliderMovH_Changed(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.setMatrixAndDraw(objCtrlVal, objRoot);
    }

    public sliderMovV_Changed(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.setMatrixAndDraw(objCtrlVal, objRoot);
    }

    public sliderMovH_DragStarted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderMovV_DragStarted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderMovH_DragCompleted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderMovV_DragCompleted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    // ------------------------------------------------

    public sliderScale_Changed(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.setMatrixAndDraw(objCtrlVal, objRoot);
    }

    public sliderScale_DragStarted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    public sliderScale_DragCompleted(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
    }

    // ------------------------------------------------

    public buttonRotInit_Click(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.initRot(objCtrlVal, objRoot);
        objRoot.draw();
    }

    public buttonMovInit_Click(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.initMove(objCtrlVal, objRoot);
        objRoot.draw();
    }

    public buttonScaleInit_Click(e: Event, objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.initScale(objCtrlVal, objRoot);
        objRoot.draw();
    }

    // ------------------------------------------------

    private setMatrixAndDraw(objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        const trans: TransInfo = this.getSliderValue(objCtrlVal);

        const objGlMain: BxGlMain|null = (<BxGlRoot>objRoot.objGlRoot).objGlMain;
        (<BxGlMain>objGlMain).sliderMatrix(trans.valRotH, trans.valRotV, trans.valRotAxisZ, trans.valMoveH, trans.valMoveV, trans.valScale);

        objRoot.draw();
    }

    private initRot(objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.focusRot_ = this.kFocusRotUnknown_;
        this.initMatRot(objRoot);

        objCtrlVal.sliderRotV = BxControlValueConst.SliderRotV;
        objCtrlVal.sliderRotH = BxControlValueConst.SliderRotH;
        objCtrlVal.sliderRotR = BxControlValueConst.SliderRotR;
    }

    private initMove(objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.initMatMove(objRoot);

        objCtrlVal.sliderMovH = BxControlValueConst.SliderMovH;
        objCtrlVal.sliderMovV = BxControlValueConst.SliderMovV;
    }

    private initScale(objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        this.initMatScale(objRoot);

        objCtrlVal.sliderScale = BxControlValueConst.SliderScale;
    }

    // ------------------------------------------------

    private initMatRot(objRoot: BxRoot): void {
        const objGlMain: BxGlMain|null = (<BxGlRoot>objRoot.objGlRoot).objGlMain;
        (<BxGlMain>objGlMain).initMatrix_Rot();
    }

    private initMatMove(objRoot: BxRoot): void {
        const objGlMain: BxGlMain|null = (<BxGlRoot>objRoot.objGlRoot).objGlMain;
        (<BxGlMain>objGlMain).initMatrix_Move();
    }

    private initMatScale(objRoot: BxRoot): void {
        const objGlMain: BxGlMain|null = (<BxGlRoot>objRoot.objGlRoot).objGlMain;
        (<BxGlMain>objGlMain).initMatrix_Scale();
    }

    private fixMatRot(objRoot: BxRoot): void {
        const objGlMain: BxGlMain|null = (<BxGlRoot>objRoot.objGlRoot).objGlMain;
        (<BxGlMain>objGlMain).fixMatRot();
    }

    // ------------------------------------------------

    private getSliderValue(objCtrlVal: BxControlValue): TransInfo {
        const dst = new TransInfo();

        dst.valRotH     = objCtrlVal.sliderRotH / 100.0;
        dst.valRotV     = objCtrlVal.sliderRotV / 100.0;
        dst.valRotAxisZ = objCtrlVal.sliderRotR / 100.0;
        dst.valMoveH    = objCtrlVal.sliderMovH / 100.0;
        dst.valMoveV    = objCtrlVal.sliderMovV / 100.0;
        dst.valScale    = objCtrlVal.sliderScale / 100.0;

        return dst;
    }

    // ------------------------------------------------

    private initControl(objCtrlVal: BxControlValue, objRoot: BxRoot): void {
        objCtrlVal.sliderTess = BxControlValueConst.SliderTess;
        (<BxCmUiParam>objRoot.param).numTess = Number(objCtrlVal.sliderTess);

        objCtrlVal.radioShape = BxControlValueConst.RadioShape;
        (<BxCmUiParam>objRoot.param).isWire = false;
        objRoot.changeShader();

        this.initRot(objCtrlVal, objRoot);
        this.initMove(objCtrlVal, objRoot);
        this.initScale(objCtrlVal, objRoot);
    }
}
