import { BxMath, BxVec3, BxBezier6Line3, BxBezier3Line3 } from './bxCmMath';
import {
    BxCmSeparatePatch_Vertex,
    BxCmSeparatePatch_SurfaceEdge,
    BxCmSeparatePatch_Surface,
    BxCmSeparatePatch_Object
} from '../bxCom/bxCmSeparatePatch';

export class BxCmCorrectSeparator {

    public exec(src: BxCmSeparatePatch_Object): BxCmSeparatePatch_Object {
        const dst = new BxCmSeparatePatch_Object();
        dst.alloc(src.numSurface);
        for (let i=0; i<src.numSurface; i++ )
            dst.set(i, <BxCmSeparatePatch_Surface>src.get(i));

        this.execMain(src, dst);

        return dst;
     }

    // -------------------------------------------------------

    private execMain(src: BxCmSeparatePatch_Object, dst: BxCmSeparatePatch_Object): void {
        for (let i=0; i<src.numSurface; i++ ) {
            this.execBezU(src, i, dst);
            this.execBezV(src, i, dst);
        }
    }

    private execBezU(src: BxCmSeparatePatch_Object, surfaceNo: number, dst: BxCmSeparatePatch_Object): void {
        const bezU6: BxBezier6Line3[] = new Array<BxBezier6Line3>(4);
        const bezV3: BxBezier3Line3[] = new Array<BxBezier3Line3>(7);

        for(let i=0; i<4; i++)
            bezU6[ i ] = new BxBezier6Line3();
        for(let i=0; i<7; i++)
            bezV3[ i ] = new BxBezier3Line3();

        const hvId = 0;

        this.getBezier(src, surfaceNo, hvId, bezU6);
        this.transBezier(bezU6, bezV3);
        this.correct(bezV3, surfaceNo, hvId, dst);
    }

    private execBezV(src: BxCmSeparatePatch_Object, surfaceNo: number, dst: BxCmSeparatePatch_Object): void {
        const bezV6: BxBezier6Line3[] = new Array<BxBezier6Line3>(4);
        const bezU3: BxBezier3Line3[] = new Array<BxBezier3Line3>(7);

        for(let i=0; i<4; i++ )
            bezV6[ i ] = new BxBezier6Line3();
        for(let i=0; i<7; i++ )
            bezU3[ i ] = new BxBezier3Line3();

        const hvId = 1;

        this.getBezier(src, surfaceNo, hvId, bezV6);
        this.transBezier(bezV6, bezU3);
        this.correct(bezU3, surfaceNo, hvId, dst);
    }

    // ------

    private getBezier(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number, tmpBez6: BxBezier6Line3[/*4*/]): void {
        let hvOfs: number, crossIdx: number, idxPosBez0: number, idxPosBez1: number;

        hvOfs      = 0;
        crossIdx   = 0;
        idxPosBez0 = 0;
        idxPosBez1 = 1;
        this.getBezierOuter(src, surfaceNo, hvId, hvOfs, crossIdx, idxPosBez0, tmpBez6);
        this.getBezierInner(src, surfaceNo, hvId, hvOfs, idxPosBez1, tmpBez6);

        hvOfs      = 1;
        crossIdx   = 6;
        idxPosBez0 = 3;
        idxPosBez1 = 2;
        this.getBezierOuter(src, surfaceNo, hvId, hvOfs, crossIdx, idxPosBez0, tmpBez6);
        this.getBezierInner(src, surfaceNo, hvId, hvOfs, idxPosBez1, tmpBez6);
    }

    private getBezierOuter(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number, hvOfs: number, crossIdx: number, idxPosBez: number,
                           tmpBez6: BxBezier6Line3[/*4*/]): void {
        const {vertexNo0, vertexNo1} = this.hVtoVertexNo( hvId, hvOfs);
        const vNo0 = vertexNo0;
        const vNo1 = vertexNo1;

        const wingHvId = 1 - hvId;
        const bez3 = new BxBezier3Line3();

        const srcSurface     = <BxCmSeparatePatch_Surface>src.get(surfaceNo);
        const srcVertex      = <BxCmSeparatePatch_Vertex[]>srcSurface.vertex;
        const srcSurfaceEdge = <BxCmSeparatePatch_SurfaceEdge[][]>srcSurface.surfaceEdge;

        bez3.set(0, <BxVec3>srcVertex[vNo0].pos);
        bez3.set(3, <BxVec3>srcVertex[vNo1].pos);

        bez3.set(1, (<BxBezier6Line3>srcSurfaceEdge[wingHvId][0].inner).get(crossIdx));
        bez3.set(2, (<BxBezier6Line3>srcSurfaceEdge[wingHvId][1].inner).get(crossIdx));

        tmpBez6[idxPosBez] = bez3.upperTo6();
    }

    private hVtoVertexNo(hvId: number, hvOfs: number): {vertexNo0: number, vertexNo1: number} {
        let vertexNo0: number, vertexNo1: number;

        if (hvId == 0) {
            if (hvOfs == 0) {
                vertexNo0 = 0;
                vertexNo1 = 1;
            }
            else {
                if (hvOfs != 1) alert("hvOfs != 1");
                vertexNo0 = 3;
                vertexNo1 = 2;
            }
        }
        else {
            if (hvId != 1) alert("hvId != 1");
            if (hvOfs == 0) {
                vertexNo0 = 0;
                vertexNo1 = 3;
            }
            else {
                if (hvOfs != 1) alert("hvOfs != 1");
                vertexNo0 = 1;
                vertexNo1 = 2;
            }
        }

        return {vertexNo0: vertexNo0, vertexNo1: vertexNo1};
    }

    private getBezierInner(src: BxCmSeparatePatch_Object, surfaceNo: number, hvId: number, hvOfs: number, idxPosBez1: number, tmpBez6: BxBezier6Line3[/*4*/]): void {
        for (let i=0; i<7; i++) {
            const srcSurface     = <BxCmSeparatePatch_Surface>src.get(surfaceNo);
            const srcSurfaceEdge = <BxCmSeparatePatch_SurfaceEdge[][]>srcSurface.surfaceEdge;

            tmpBez6[idxPosBez1].set(i, (<BxBezier6Line3>srcSurfaceEdge[hvId][hvOfs].inner).get(i));
        }
    }

    // ------

    private transBezier(srcBez6: BxBezier6Line3[/*4*/] , transBez3: BxBezier3Line3[/*7*/]): void {
        for (let i=0; i<7; i++) {
            for (let j=0; j<4; j++)
                transBez3[i].set(j, srcBez6[j].get(i));
        }
    }

    private correct(transBez3: BxBezier3Line3[/*7*/], surfaceNo: number, hvId: number, dst: BxCmSeparatePatch_Object): void {
        const handle = new Array<BxVec3>(2);

        for (let i=0; i<7; i++) {
            this.correctMain(transBez3[i], handle);

            for (let j=0; j<2; j++) {
                if (handle[ j ] != null) {
                    let srcBez6Idx = 0;
                    if (j == 1)
                        srcBez6Idx = 3;

                    const dstSurface     = <BxCmSeparatePatch_Surface>dst.get(surfaceNo);
                    const dstSurfaceEdge = <BxCmSeparatePatch_SurfaceEdge[][]>dstSurface.surfaceEdge;
            
                    for (let k=0; k<3; k++)
                        (<BxBezier6Line3>dstSurfaceEdge[hvId][j].inner).get(i).set(k, (handle[j].get(k) + transBez3[i].get(srcBez6Idx).get(k)));
                }
            }
        }
    }

    private correctMain(transBez3: BxBezier3Line3, dstHandle: (BxVec3|null)[/*2*/]): void {
        const {lIdxNoHandleZero, rIdxNoHandleZero} = transBez3.getIdxNoHandleZero();

        const dim = rIdxNoHandleZero - lIdxNoHandleZero + 1;

        dstHandle[0] = null;
        dstHandle[1] = null;

        if (!(1 <= dim && dim <= 3)) alert("!(1 <= dim && dim <= 3)");
        if (dim == 3)
            return;

        const betweenVtx = new BxVec3();
        for (let i=0; i<3; i++)
            betweenVtx.set(i, (transBez3.get(3).get(i) - transBez3.get(0).get(i)));

        const lenBetweenVtx = betweenVtx.length();
        let   minimumLen    = lenBetweenVtx * BxMath.KDirectionEpsRatio;

        if (minimumLen < BxMath.KDirectionEpsRatio)
            minimumLen = BxMath.KDirectionEpsRatio;

        if (dim == 2) {
            if (lIdxNoHandleZero > 0) {
                const tmp = new BxVec3();
                for (let i=0; i<3; i++)
                    tmp.set(i, (transBez3.get(2).get(i) - transBez3.get(0).get(i)));

                const length = tmp.length();

                (<BxVec3>dstHandle[0]) = new BxVec3();
                for (let i=0; i<3; i++)
                    (<BxVec3>dstHandle[0]).set(i, (tmp.get(i) / length * minimumLen));
            }
            else {
                if (rIdxNoHandleZero >= 2) alert("rIdxNoHandleZero >= 2");

                const tmp = new BxVec3();
                for (let i=0; i<3; i++)
                    tmp.set(i, (transBez3.get(1).get(i) - transBez3.get(3).get(i)));

                const length = tmp.length();

                (<BxVec3>dstHandle[1]) = new BxVec3();
                for (let i=0; i<3; i++)
                    (<BxVec3>dstHandle[1]).set(i, (tmp.get(i) / length * minimumLen));
            }
        }
        else if( dim == 1 ) {
            if( rIdxNoHandleZero == 2 ) {
                const tmp = new BxVec3();
                for (let i=0; i<3; i++)
                    tmp.set(i, (transBez3.get(3).get(i) - transBez3.get(0).get(i)));

                let length = tmp.length();

                (<BxVec3>dstHandle[0]) = new BxVec3();
                for (let i=0; i<3; i++)
                    (<BxVec3>dstHandle[0]).set(i, (tmp.get(i) / length * minimumLen));

                // ---

                for (let i=0; i<3; i++)
                    tmp.set(i, (transBez3.get(2).get(i) - transBez3.get(3).get(i)));

                length = tmp.length();

                (<BxVec3>dstHandle[1]) = new BxVec3();
                for (let i=0; i<3; i++)
                    (<BxVec3>dstHandle[1]).set(i, (tmp.get(i) * ((length - minimumLen) / length)));
            }
            else if( lIdxNoHandleZero == 0 ) {
                const tmp = new BxVec3();
                for (let i=0; i<3; i++)
                    tmp.set(i, (transBez3.get(1).get(i) - transBez3.get(0).get(i)));

                let length = tmp.length();

                (<BxVec3>dstHandle[0]) = new BxVec3();
                for (let i=0; i<3; i++)
                    (<BxVec3>dstHandle[0]).set(i, (tmp.get(i) * ((length - minimumLen) / length)));

                // ---

                for (let i=0; i<3; i++)
                    tmp.set(i, (transBez3.get(0).get(i) - transBez3.get(3).get(i)));

                length = tmp.length();

                (<BxVec3>dstHandle[1]) = new BxVec3();
                for (let i=0; i<3; i++)
                    (<BxVec3>dstHandle[1]).set(i, (tmp.get(i) / length * minimumLen));
            }
            else {
                const tmp0 = new BxVec3();
                for (let i=0; i<3; i++)
                    tmp0.set(i, (transBez3.get(3).get(i) - transBez3.get(0).get(i)));

                const length = tmp0.length();

                (<BxVec3>dstHandle[0]) = new BxVec3();
                (<BxVec3>dstHandle[1]) = new BxVec3();

                const tmp1 = new BxVec3();
                for (let i=0; i<3; i++) {
                    tmp1.set(i, (tmp0.get(i) / length * minimumLen));

                    (<BxVec3>dstHandle[0]).set(i, tmp1.get(i));
                    (<BxVec3>dstHandle[1]).set(i, -tmp1.get(i));
                }
            }
        }
    }
}
