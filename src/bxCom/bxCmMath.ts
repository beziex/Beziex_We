export class BxMath {
    public static readonly KElmX = 0;
    public static readonly KElmY = 1;
    public static readonly KElmZ = 2;

    public static readonly KNearZero                 = 1.0E-6;
    public static readonly KDirectionEpsRatio        = 1.0E-4;
    public static readonly KDirectionEpsRatioSquared = 1.0E-8;
}

export class BxVec3 {
    public static readonly KNumVec3 = 3;
    
    private dt_: number[];

    public constructor() {
        this.dt_ = new Array<number>(3);

        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
    }

    public get(index: number): number {
        return this.dt_[index];
    }
    public set(index: number, value: number): void {
        this.dt_[index] = value;
    }

    public setVec(value: BxVec3): void {
        for (let i=0; i<3; i++)
            this.dt_[i] = value.get(i);
    }

    public get x(): number {
        return this.dt_[BxMath.KElmX];
    }
    public get y(): number {
        return this.dt_[BxMath.KElmY];
    }
    public get z(): number {
        return this.dt_[BxMath.KElmZ];
    }

    public set x(value: number) {
        this.dt_[BxMath.KElmX] = value;
    }
    public set y(value: number) {
        this.dt_[BxMath.KElmY] = value;
    }
    public set z(value: number) {
        this.dt_[BxMath.KElmZ] = value;
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    public lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
}

export class BxBezier2Line3 {

    private dt_: BxVec3[];

    public constructor() {
        this.dt_ = new Array<BxVec3>(3);

        for (let i=0; i<3; i++)
            this.dt_[i] = new BxVec3();
    }

    public get(index: number): BxVec3 {
        return this.dt_[index];
    }
    public set(index: number, value: BxVec3): void {
        this.dt_[index].setVec(value);
    }

    public setBez(value: BxBezier2Line3): void {
        for (let i=0; i<3; i++)
            this.dt_[i].setVec(value.get(i));
    }
}

export class BxBezier3Line3 {

    private dt_: BxVec3[];

    public constructor() {
        this.dt_ = new Array<BxVec3>(4);

        for (let i=0; i<4; i++)
            this.dt_[i] = new BxVec3();
    }

    public get(index: number): BxVec3 {
        return this.dt_[index];
    }
    public set(index: number, value: BxVec3): void {
        this.dt_[index].setVec(value);
    }

    public setBez(value: BxBezier3Line3): void {
        for (let i=0; i<4; i++)
            this.dt_[i].setVec(value.get(i));
    }

    public diff(): BxBezier2Line3 {
        const diff = new BxBezier2Line3();

        for (let i=0; i<BxVec3.KNumVec3; i++) {
            for (let j=0; j<3; j++)
                diff.get(j).set(i, (3.0 * (this.get(j+1).get(i) - this.get(j).get(i))));
        }

        return diff;
    }

    public upperTo6(): BxBezier6Line3 {
        const result = new BxBezier6Line3();

        result.set(0, this.get(0));
        for (let i=0; i<3; i++) {
            result.get(1).set(i, (this.get(0).get(i) + this.get(1).get(i)) / 2.0);
            result.get(2).set(i, (this.get(0).get(i) + 3.0 * this.get(1).get(i) + this.get(2).get(i)) / 5.0);
            result.get(3).set(i, (this.get(0).get(i) + 9.0 * this.get(1).get(i) + 9.0 * this.get(2).get(i) + this.get(3).get(i)) / 20.0);
            result.get(4).set(i, (this.get(1).get(i) + 3.0 * this.get(2).get(i) + this.get(3).get(i)) / 5.0);
            result.get(5).set(i, (this.get(2).get(i) + this.get(3).get(i)) / 2.0);
        }
        result.set(6, this.get(3));

        return result;
    }

    public getIdxNoHandleZero(): {lIdxNoHandleZero: number, rIdxNoHandleZero: number} {
        let lIdxNoHandleZero: number, rIdxNoHandleZero: number;

        const tmp = new BxVec3();
        for (let i=0; i<3; i++)
            tmp.set(i, (this.get(3).get(i) - this.get(0).get(i)));

        const lenBetweenVtx     = tmp.lengthSquared();
        let   minimumLenSquared = lenBetweenVtx * BxMath.KDirectionEpsRatioSquared;
        if( minimumLenSquared < ( BxMath.KNearZero * BxMath.KNearZero ) )
            minimumLenSquared = BxMath.KNearZero * BxMath.KNearZero;

        lIdxNoHandleZero = 0;
        for (let i=0; i<3; i++) {
            for (let k=0; k<3; k++)
                tmp.set(k, (this.get(i+1).get(k) - this.get(i).get(k)));

            if (tmp.lengthSquared() >= minimumLenSquared)
                break;

            lIdxNoHandleZero++;
        }

        rIdxNoHandleZero = 2;
        for (let i=0; i<3; i++ ) {
            const j = 2 - i;

            for (let k=0; k<3; k++)
            tmp.set(k, (this.get(j+1).get(k) - this.get(j).get(k)));

            if (tmp.lengthSquared() >= minimumLenSquared)
                break;

            rIdxNoHandleZero--;
        }

        if( lIdxNoHandleZero == 3 )
            rIdxNoHandleZero = 2;

        return {lIdxNoHandleZero: lIdxNoHandleZero, rIdxNoHandleZero: rIdxNoHandleZero};
    }
}

export class BxBezier5Line3 {

    private dt_: BxVec3[];

    public constructor() {
        this.dt_ = new Array<BxVec3>(6);

        for (let i=0; i<6; i++)
            this.dt_[i] = new BxVec3();
    }

    public get(index: number): BxVec3 {
        return this.dt_[index];
    }
    public set(index: number, value: BxVec3): void {
        this.dt_[index].setVec(value);
    }

    public setBez(value: BxBezier5Line3): void {
        for (let i=0; i<6; i++)
            this.dt_[i].setVec(value.get(i));
    }
}

export class BxBezier6Line3 {

    private dt_: BxVec3[];

    public constructor() {
        this.dt_ = new Array<BxVec3>(7);

        for (let i=0; i<7; i++)
            this.dt_[i] = new BxVec3();
    }

    public get(index: number): BxVec3 {
        return this.dt_[index];
    }
    public set(index: number, value: BxVec3): void {
        this.dt_[index].setVec(value);
    }

    public setBez(value: BxBezier6Line3): void {
        for (let i=0; i<7; i++)
            this.dt_[i].setVec(value.get(i));
    }

    public diff(): BxBezier5Line3 {
        const diff = new BxBezier5Line3();

        for (let i=0; i<BxVec3.KNumVec3; i++) {
            for (let j=0; j<6; j++)
                diff.get(j).set(i, (6.0 * (this.get(j+1).get(i) - this.get(j).get(i))));
        }

        return diff;
    }
}
