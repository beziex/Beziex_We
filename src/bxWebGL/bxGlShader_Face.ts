import { BxGlShader } from './bxGlShader';
import { BxGlProgContainer } from './bxGlProgContainer';
import { BxGlProgramBase } from './bxGlProgramBase';
import { BxGlMain } from './bxGlMain';

export class BxGlShader_Face extends BxGlShader {

    public constructor(gl: WebGLRenderingContext, canvasID: string, progContainer: BxGlProgContainer, parent: BxGlMain) {
        super(gl, canvasID, parent);

        this.programObj_ = <BxGlProgramBase>progContainer.viewProgGL3_FaceObj();
    }

    // ------

    protected drawMain_NonPreDiv(): void {
        if (this.numSurface_NonPreDiv_ == 0)
            return;

        this.setUniform(0, 1);

        const instancedAry = <ANGLE_instanced_arrays>(this.buf.glExt.instancedAry);

        const m = this.tessLevel * this.tessLevel * 3 * 2;
        instancedAry.drawElementsInstancedANGLE(this.gl_.TRIANGLES, m, this.gl_.UNSIGNED_INT, 0, this.numSurface_NonPreDiv_);
    }

    protected drawMain_PreDiv(): void {
        const numSurface_PreDiv = this.numSurface_ - this.numSurface_NonPreDiv_;
        if (numSurface_PreDiv == 0)
            return;

        this.setUniform(this.numSurface_NonPreDiv_, 2);

        const tessCount = this.tessLevel / 2;

        const instancedAry = <ANGLE_instanced_arrays>(this.buf.glExt.instancedAry);

        const m = tessCount * tessCount * 3 * 2;
        instancedAry.drawElementsInstancedANGLE(this.gl_.TRIANGLES, m, this.gl_.UNSIGNED_INT, 0, numSurface_PreDiv);
    }

    // ------

    protected genIndexAry(): number[] {
        const indexAry = new Array<number>(this.KNumTessMax * this.KNumTessMax * 3 * 2);

        let   start = 0;
        const numTessMaxP = this.KNumTessMax + 1;

        for (let i=0; i<this.KNumTessMax; i++) {
            for (let u=0; u<i; u++) {
                this.genIndexAryMain(indexAry, numTessMaxP, start, u, i);
                start += 6;
            }

            for(let v=0; v<i; v++) {
                this.genIndexAryMain(indexAry, numTessMaxP, start, i, v);
                start += 6;
            }

            this.genIndexAryMain(indexAry, numTessMaxP, start, i, i);
            start += 6;
        }

        return indexAry;
    }

    private genIndexAryMain(indexAry: number[], numTessP: number, start: number, u: number, v: number): void {
        const vNo0 = (v + 0) * numTessP + (u + 0);
        const vNo1 = (v + 0) * numTessP + (u + 1);
        const vNo2 = (v + 1) * numTessP + (u + 1);
        const vNo3 = (v + 1) * numTessP + (u + 0);

        indexAry[start + 0] = vNo0;
        indexAry[start + 1] = vNo1;
        indexAry[start + 2] = vNo2;

        indexAry[start + 3] = vNo2;
        indexAry[start + 4] = vNo3;
        indexAry[start + 5] = vNo0;
    }
}
