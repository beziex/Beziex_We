import { BxVec3 } from './bxCmMath';

export class BxCmUiParam {
    public numTess: number;
    public min:     BxVec3|null;
    public max:     BxVec3|null;
    public isWire:  boolean;

    public constructor() {
        this.numTess = 8;
        this.min     = null;
        this.max     = null;
        this.isWire  = false;
    }
}
