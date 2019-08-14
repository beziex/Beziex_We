export abstract class BxGlProgramObject {
    public abstract releaseShaderProgram(): void;
}

export class BxGlProgContainer {

    private viewProgGL3_FaceObj_: BxGlProgramObject;
    private viewProgGL3_WireObj_: BxGlProgramObject;

    // -------------------------------------------------------

    public constructor(viewProgGL3_FaceObj: BxGlProgramObject, viewProgGL3_WireObj: BxGlProgramObject) {
        this.viewProgGL3_FaceObj_ = viewProgGL3_FaceObj;
        this.viewProgGL3_WireObj_ = viewProgGL3_WireObj;
    }

    public releaseShaderProgram(): void {
        if (this.viewProgGL3_FaceObj_)
            this.viewProgGL3_FaceObj_.releaseShaderProgram();

        if (this.viewProgGL3_WireObj_)
            this.viewProgGL3_WireObj_.releaseShaderProgram();
    }

    public viewProgGL3_FaceObj(): BxGlProgramObject {
        return this.viewProgGL3_FaceObj_;
    }
    public viewProgGL3_WireObj(): BxGlProgramObject  {
        return this.viewProgGL3_WireObj_;
    }
}
