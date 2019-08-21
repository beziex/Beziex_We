// @ts-ignore: Unreachable code error
import * as pako from "../../node_modules/pako/dist/pako.js";

import { BxRdRoot, BxDataName } from './bxRdRoot';

enum ReadFileType {
    KType_BeziexData,
    KType_VertexShader,
    KType_FragmentShader,
    KType_FragmentShader_Wire,
    KNum_ReadFileType
}

class FileInfo {
    public url:  string;
    public isGz: boolean;

    public constructor() {
        this.url = "";
        this.isGz = false;
    }
}

export class BxRdMain {

    private callback_: (beziexDataCode: string, vertexShaderCode: string, fragmentShaderCode: string, fragmentShaderCode_wire: string) => void;

    private fileInfo_: FileInfo[];
    private promises_: Promise<string>[];

    private rdRoot_: BxRdRoot = new BxRdRoot();

    public constructor(localCallback: (beziexDataCode: string, vertexShaderCode: string, fragmentShaderCode: string, fragmentShaderCode_wire: string) => void) {
        const beziexDataUrl          = this.getDefaultDataName();
        const vertexShaderUrl        = "./shader/shader.vert";
        const fragmentShaderUrl      = "./shader/shader.frag";
        const fragmentShaderUrl_Wire = "./shader/shader_wire.frag";

        this.fileInfo_ = new Array<FileInfo>(ReadFileType.KNum_ReadFileType);
        for (let i=0; i<ReadFileType.KNum_ReadFileType; i++)
            this.fileInfo_[i] = new FileInfo();

        this.fileInfo_[ReadFileType.KType_BeziexData].url = beziexDataUrl;
        this.fileInfo_[ReadFileType.KType_VertexShader].url = vertexShaderUrl;
        this.fileInfo_[ReadFileType.KType_FragmentShader].url = fragmentShaderUrl;
        this.fileInfo_[ReadFileType.KType_FragmentShader_Wire].url = fragmentShaderUrl_Wire;

        this.fileInfo_[ReadFileType.KType_BeziexData].isGz = true;
        this.fileInfo_[ReadFileType.KType_VertexShader].isGz = false;
        this.fileInfo_[ReadFileType.KType_FragmentShader].isGz = false;
        this.fileInfo_[ReadFileType.KType_FragmentShader_Wire].isGz = false;

        this.promises_ = new Array(this.fileInfo_.length);
        this.callback_ = localCallback;
    }

    public exec(): void {
        for (let i=0; i<this.promises_.length; i++)
            this.promises_[i] = BxRdMain.getPromise(this.fileInfo_[i]);

        Promise.all(this.promises_).then((responseText) => {
            const beziexDataJson          = responseText[ReadFileType.KType_BeziexData];
            const vertexShaderCode        = responseText[ReadFileType.KType_VertexShader];
            const fragmentShaderCode      = responseText[ReadFileType.KType_FragmentShader];
            const fragmentShaderCode_wire = responseText[ReadFileType.KType_FragmentShader_Wire];

            this.callback_(beziexDataJson, vertexShaderCode, fragmentShaderCode, fragmentShaderCode_wire);
        });
    }

    private getDefaultDataName(): string {
        return "./data/" + this.rdRoot_.dataName[BxDataName.KData_n_MascuteAzur001] + ".gzjson";
    }

    private static getPromise(fileInfo: FileInfo): Promise<string> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();xhr.responseType = "arraybuffer";
            xhr.open('GET', fileInfo.url);

            (xhr as any).isGz = fileInfo.isGz;
            if (fileInfo.isGz)
                xhr.responseType = "arraybuffer";
            else
                xhr.responseType = "text";

            xhr.addEventListener('load', (e) => {
                const isGz: boolean = (xhr as any).isGz;
                if (isGz) {
                    const result: string = pako.ungzip(xhr.response, {to: 'string'});
                    resolve(result);
                }
                else
                    resolve(xhr.responseText);
            });
            xhr.send();
        });
    }
}
