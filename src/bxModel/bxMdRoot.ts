import { BxMdJsonProc } from './bxMdJsonProc';
import { BxCmUiParam } from '../bxCom/bxCmUiParam';
import { BxCmSeparatePatch_Object } from '../bxCom/bxCmSeparatePatch';

export class BxMdRoot {
    
    public exec(beziexDataJson: string, param: BxCmUiParam): BxCmSeparatePatch_Object|null {
        const objJsonProc = new BxMdJsonProc();        
        const {min, max, patch} = objJsonProc.exec(beziexDataJson);
        param.min = min;
        param.max = max;

        return patch;
    }
}
