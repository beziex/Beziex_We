import { BxVec3, BxBezier6Line3 } from './bxCmMath';
import { BxTNodeType } from './bxCmGridInfo';

export class BxCmSeparatePatch_Vertex {

    public pos: BxVec3|null;

    public constructor() {
        this.pos = null;
    }
    
    public alloc(): void {
        this.pos = new BxVec3();
    }
}

export class BxCmSeparatePatch_SurfaceEdge {

    public inner: BxBezier6Line3|null;

    public constructor() {
        this.inner = null;
    }
    
    public alloc(): void {
        this.inner = new BxBezier6Line3();
    }
}

export class BxCmSeparatePatch_Surface {

    public vertex:      BxCmSeparatePatch_Vertex[/*4*/]|null;
    public surfaceEdge: BxCmSeparatePatch_SurfaceEdge[/*2*/][/*2*/]|null;
    public tNodeType:   BxTNodeType[/*2*/][/*2*/]|null;
    public preDivided:  boolean|null;

    public constructor() {
        this.vertex      = null;
        this.surfaceEdge = null;
        this.tNodeType   = null;
        this.preDivided  = null;
    }

    public alloc(): void {
        this.allocVertex();
        this.allocSurfaceEdge();
        this.allocTNodeType();
    }

    public allocVertex(): void {
        this.vertex = new Array<BxCmSeparatePatch_Vertex>(4);
        for (let i=0; i<4; i++) {
            this.vertex[i] = new BxCmSeparatePatch_Vertex();
            this.vertex[i].alloc();
        }
    }

    public allocSurfaceEdge(): void {
        this.surfaceEdge = new Array<BxCmSeparatePatch_SurfaceEdge[]>(2);
        for (let i=0; i<2; i++) {
            this.surfaceEdge[i] = new Array<BxCmSeparatePatch_SurfaceEdge>(2);

            for (let j=0; j<2; j++) {
                this.surfaceEdge[i][j] = new BxCmSeparatePatch_SurfaceEdge();
                this.surfaceEdge[i][j].alloc();
            }
        }
    }

    public allocTNodeType(): void {
        this.tNodeType = new Array<BxTNodeType[]>(2);
        for (let i=0; i<2; i++)
            this.tNodeType[i] = new Array<BxTNodeType>(2);
    }
}

export class BxCmSeparatePatch_Object {

    private surface_: BxCmSeparatePatch_Surface[]|null;

    public constructor() {
        this.surface_ = null;
    }
    
    public alloc(numSurface: number): void {
        this.surface_ = null;
        if (numSurface > 0) {
            this.surface_ = new Array<BxCmSeparatePatch_Surface>(numSurface);
            for (let i=0; i<numSurface; i++)
                this.surface_[i] = new BxCmSeparatePatch_Surface();
        }
    }

    public get(index: number): BxCmSeparatePatch_Surface|null {
        return this.surface_ ? this.surface_[index] : null;
    }
    public set(index: number, value: BxCmSeparatePatch_Surface): void {
        if (this.surface_)
            this.surface_[index] = value;
    }

    public get numSurface(): number {
        if (!this.surface_)
            return 0;

        return this.surface_.length;
    }
}
