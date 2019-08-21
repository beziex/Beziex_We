// @ts-ignore: Unreachable code error
import * as pako from "../../node_modules/pako/dist/pako.js";

import { BxRdRoot } from './bxRdRoot';

export class BxRdModel {

    private rdRoot_: BxRdRoot = new BxRdRoot();

    public exec(beziexDataIndex: number, callback: (beziexDataJson: string) => void): void {
        const beziexDataUrl: string = this.getDataName(beziexDataIndex);

        const promises: Promise<string> = BxRdModel.getPromise(beziexDataUrl);
        promises.then((beziexDataJson) => {
            callback(beziexDataJson);
        });
    }

    private getDataName(index: number): string {
        return "./data/" + this.rdRoot_.dataName[index] + ".gzjson";
    }

    private static getPromise(url: string): Promise<string> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();xhr.responseType = "arraybuffer";
            xhr.open('GET', url);
            xhr.responseType = "arraybuffer";

            xhr.addEventListener('load', (e) => {
                const result: string = pako.ungzip(xhr.response, {to: 'string'});
                resolve(result);
            });
            xhr.send();
        });
    }
}
