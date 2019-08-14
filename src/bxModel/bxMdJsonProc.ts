import { BxVec3 } from '../bxCom/bxCmMath';
import {
    BxCmSeparatePatch_SurfaceEdge,
    BxCmSeparatePatch_Surface,
    BxCmSeparatePatch_Object
} from '../bxCom/bxCmSeparatePatch';
import { BxTNodeType } from '../bxCom/bxCmGridInfo';

/* ---------------------------
// JSON example
{
    "minMax" : [
        0.0,  1.0,  2.0,
        9.0, 10.0, 11.0
    ],
    "surface" : [
        [
            "vertex" : [
                0.0,  1.0,  2.0,
                3.0,  4.0,  5.0,
                6.0,  7.0,  8.0,
                9.0, 10.0, 11.0
            ],
            "surfaceEdge" : {
                "bez00" : [
                     0.0,  1.0,  2.0,
                     3.0,  4.0,  5.0,
                     6.0,  7.0,  8.0,
                     9.0, 10.0, 11.0,
                    12.0, 13.0, 14.0,
                    15.0, 16.0, 17.0,
                    18.0, 19.0, 20.0
                ],
                "bez01" : [
                     0.0,  1.0,  2.0,
                     3.0,  4.0,  5.0,
                     6.0,  7.0,  8.0,
                     9.0, 10.0, 11.0,
                    12.0, 13.0, 14.0,
                    15.0, 16.0, 17.0,
                    18.0, 19.0, 20.0
                ],
                "bez10" : [
                     0.0,  1.0,  2.0,
                     3.0,  4.0,  5.0,
                     6.0,  7.0,  8.0,
                     9.0, 10.0, 11.0,
                    12.0, 13.0, 14.0,
                    15.0, 16.0, 17.0,
                    18.0, 19.0, 20.0
                ],
                "bez11" : [
                     0.0,  1.0,  2.0,
                     3.0,  4.0,  5.0,
                     6.0,  7.0,  8.0,
                     9.0, 10.0, 11.0,
                    12.0, 13.0, 14.0,
                    15.0, 16.0, 17.0,
                    18.0, 19.0, 20.0
                ]
            },
            "tNodeType" : {
                "edge00" : "none",
                "edge01" : "part",
                "edge10" : "all",
                "edge11" : "none"
            },
            "preDivided" : "false"
        ],
        [
            ...
        ],
           :
           :
    ]
}
--------------------------- */

class JsonPatchInfo_SurfaceEdge {
    public bez00: number[]|null;
    public bez01: number[]|null;
    public bez10: number[]|null;
    public bez11: number[]|null;

    public constructor() {
        this.bez00 = null;
        this.bez01 = null;
        this.bez10 = null;
        this.bez11 = null;
    }
}

class JsonPatchInfo_TNodeType {
    public edge00: string|null;
    public edge01: string|null;
    public edge10: string|null;
    public edge11: string|null;

    public constructor() {
        this.edge00 = null;
        this.edge01 = null;
        this.edge10 = null;
        this.edge11 = null;
    }
}

class JsonPatchInfo_Surface {
    public vertex:      number[]|null;
    public surfaceEdge: JsonPatchInfo_SurfaceEdge|null;
    public tNodeType:   JsonPatchInfo_TNodeType|null;
    public preDivided:  string|null;

    public constructor() {
        this.vertex      = null;
        this.surfaceEdge = null;
        this.tNodeType   = null;
        this.preDivided  = null;
    }
}

class JsonPatchInfo {
    public minMax:  number[]|null;
    public surface: JsonPatchInfo_Surface[]|null;

    public constructor() {
        this.minMax  = null;
        this.surface = null;
    }
}

// -------------------------------------------------------

export class BxMdJsonProc {
    
    public exec(beziexDataJson: string): {min: BxVec3|null, max: BxVec3|null, patch: BxCmSeparatePatch_Object|null} {
        const jsonOrg = JSON.parse(beziexDataJson);
        const json    = this.convJson(jsonOrg);

        return this.fromJson(json);
    }

    // ---

    private convJson(jsonOrg: any): JsonPatchInfo|null {
        if (jsonOrg == null || jsonOrg.surface == null || jsonOrg.minMax == null)
            return null;

        const patch = new JsonPatchInfo();
        patch.minMax = jsonOrg.minMax;

        const jsonSurface = <any[]>jsonOrg.surface;
        patch.surface = new Array<JsonPatchInfo_Surface>(jsonSurface.length);

        for (let i=0; i<jsonSurface.length; i++) {
            if (jsonSurface[i].vertex == null    || jsonSurface[i].surfaceEdge == null ||
                jsonSurface[i].tNodeType == null || jsonSurface[i].preDivided  == null)
            {
                return null;
            }

            patch.surface[i] = new JsonPatchInfo_Surface();
            
            patch.surface[i].vertex      = jsonSurface[i].vertex;
            patch.surface[i].surfaceEdge = this.convJsonSurfaceEdge(jsonSurface[i].surfaceEdge);
            patch.surface[i].tNodeType   = this.convJsonTNodeType(jsonSurface[i].tNodeType);
            patch.surface[i].preDivided  = jsonSurface[i].preDivided;
        }

        return patch;
    }

    private convJsonSurfaceEdge(surfaceEdgeOrg: any): JsonPatchInfo_SurfaceEdge {
        const surfaceEdge = new JsonPatchInfo_SurfaceEdge();

        surfaceEdge.bez00 = surfaceEdgeOrg.bez00;
        surfaceEdge.bez01 = surfaceEdgeOrg.bez01;
        surfaceEdge.bez10 = surfaceEdgeOrg.bez10;
        surfaceEdge.bez11 = surfaceEdgeOrg.bez11;

        return surfaceEdge;
    }

    private convJsonTNodeType(tNodeTypeOrg: any): JsonPatchInfo_TNodeType {
        const tNodeType = new JsonPatchInfo_TNodeType();

        tNodeType.edge00 = tNodeTypeOrg.edge00;
        tNodeType.edge01 = tNodeTypeOrg.edge01;
        tNodeType.edge10 = tNodeTypeOrg.edge10;
        tNodeType.edge11 = tNodeTypeOrg.edge11;

        return tNodeType;
    }

    // ---

    private fromJson(json: JsonPatchInfo|null): {min: BxVec3|null, max: BxVec3|null, patch: BxCmSeparatePatch_Object|null} {
        let success: boolean;

        if (json == null || json.surface == null || json.minMax == null) {
            const min = null;  const max = null;  const patch = null;
            return {min, max, patch};
        }

        const {min, max} = this.fromJson_MinMax(json.minMax);

        const numSurface = json.surface.length;
        const patch = new BxCmSeparatePatch_Object();
        patch.alloc(numSurface);
    
        let cntSurface = 0;
        for (let i=0; i<json.surface.length; i++) {
            if (json.surface[i] == null || json.surface[i].surfaceEdge == null) {
                const patch = null;
                return {min, max, patch};
            }

            if (patch.get(cntSurface)) {
                const surface = <BxCmSeparatePatch_Surface>patch.get(cntSurface);
                surface.alloc();

                if (json.surface[i].vertex && json.surface[i].surfaceEdge) {
                    this.fromJson_Vertex(<number[]>json.surface[i].vertex, surface);
                    success = this.fromJson_SurfaceEdge(<JsonPatchInfo_SurfaceEdge>json.surface[i].surfaceEdge, surface);
                    if (success == false) {
                        const patch = null;
                        return {min, max, patch};
                    }
                }

                if (json.surface[i].tNodeType) {
                    success = this.fromJson_TNodeType(<JsonPatchInfo_TNodeType>json.surface[i].tNodeType, surface);
                    if (success == false) {
                        const patch = null;
                        return {min, max, patch};
                    }
                }

                if (json.surface[i].preDivided) {
                    success = this.fromJson_PreDivided(<string>json.surface[i].preDivided, surface);
                    if (success == false) {
                        const patch = null;
                        return {min, max, patch};
                    }
                }
            }

            cntSurface++;
        }
        if (cntSurface != numSurface) alert("cntSurface != numSurface");

        return {min, max, patch};
    }

    private fromJson_MinMax(minMax: number[]): {min: BxVec3, max: BxVec3} {
        const min = new BxVec3();
        const max = new BxVec3();

        for (let i=0; i<3; i++) {
            min.set(i, minMax[0 + i]);
            max.set(i, minMax[3 + i]);
        }

        return {min, max};
    }

    private fromJson_Vertex(vertex: number[], surface: BxCmSeparatePatch_Surface): void {
        let  dstCnt = 0;
        for (let i=0; i<vertex.length; i++) {
            const dstIdx = Math.floor(dstCnt / 3);
            const dstMod = dstCnt % 3;

            if (surface.vertex && surface.vertex[dstIdx].pos) {
                const pos = <BxVec3>surface.vertex[dstIdx].pos;
                switch (dstMod) {
                case 0:
                    pos.x = vertex[i];
                    break;
                case 1:
                    pos.y = vertex[i];
                    break;
                default: // 2
                    if (dstMod != 2) alert("dstMod != 2");
                    pos.z = vertex[i];
                    break;
                }
            }

            dstCnt++;
        }
        if (dstCnt != ( 4 * 3 )) alert("dstCnt != ( 4 * 3 )");
    }

    private fromJson_SurfaceEdge(surfaceEdge: JsonPatchInfo_SurfaceEdge, surface: BxCmSeparatePatch_Surface): boolean {
        if (surfaceEdge.bez00 == null || surfaceEdge.bez01 == null || surfaceEdge.bez10 == null || surfaceEdge.bez11 == null)
            return false;

        if (surface.surfaceEdge) {
            const patchSurfaceEdge = <BxCmSeparatePatch_SurfaceEdge[][]>surface.surfaceEdge;
            this.fromJson_SurfaceEdgeOne(surfaceEdge.bez00, patchSurfaceEdge[0][0]);
            this.fromJson_SurfaceEdgeOne(surfaceEdge.bez01, patchSurfaceEdge[0][1]);
            this.fromJson_SurfaceEdgeOne(surfaceEdge.bez10, patchSurfaceEdge[1][0]);
            this.fromJson_SurfaceEdgeOne(surfaceEdge.bez11, patchSurfaceEdge[1][1]);
        }

        return true;
    }

    private fromJson_SurfaceEdgeOne(bez: number[], surfaceEdge: BxCmSeparatePatch_SurfaceEdge): void {
        let dstCnt = 0;
        for (let i=0; i<bez.length; i++) {
            const dstIdx = Math.floor(dstCnt / 3);
            const dstMod = dstCnt % 3;

            if (surfaceEdge.inner) {
                switch (dstMod) {
                case 0:
                    surfaceEdge.inner.get(dstIdx).x = bez[i];
                    break;
                case 1:
                    surfaceEdge.inner.get(dstIdx).y = bez[i];
                    break;
                default: // 2
                    if (dstMod != 2) alert("dstMod != 2");
                    surfaceEdge.inner.get(dstIdx).z = bez[i];
                    break;
                }
            }

            dstCnt++;
        }
        if (dstCnt != ( 7 * 3 )) alert("dstCnt != ( 7 * 3 )");
    }

    private fromJson_TNodeType(tNodeType: JsonPatchInfo_TNodeType, surface: BxCmSeparatePatch_Surface): boolean {
        if (tNodeType.edge00 == null || tNodeType.edge01 == null || tNodeType.edge10 == null || tNodeType.edge11 == null)
            return false;

        if (surface.tNodeType) {
            surface.tNodeType[0][0] = this.fromJson_TNodeTypeOne(tNodeType.edge00);
            surface.tNodeType[0][1] = this.fromJson_TNodeTypeOne(tNodeType.edge01);
            surface.tNodeType[1][0] = this.fromJson_TNodeTypeOne(tNodeType.edge10);
            surface.tNodeType[1][1] = this.fromJson_TNodeTypeOne(tNodeType.edge11);
        }

        return true;
    }

    private fromJson_TNodeTypeOne(edge: string): BxTNodeType  {
        switch( edge ) {
        case "none":
            return BxTNodeType.KTNodeType_None;
        case "part":
            return BxTNodeType.KTNodeType_Part;
        default: // "all"
            if (edge != "all") alert("edge != \"all\"");
            return BxTNodeType.KTNodeType_All;
        }
    }

    private fromJson_PreDivided(preDivided: string, surface: BxCmSeparatePatch_Surface): boolean {
        if (preDivided == null)
            return false;

        if (preDivided == "true")
            surface.preDivided = true;
        else {
            if (preDivided != "false") alert("preDivided != \"false\"");
            surface.preDivided = false;
        }

        return true;
    }
}
