export enum BxDataName {
    KData_n_MascuteAzur001,
    KData_n_04_Cup1,
    KData_n_18_Ring0,
    KData_n_19_Sphere1,
    KData_n_MascutePav001,
    KData_n_Hippopotamus,
    KData_n_Manatee_01,

    kNum_DataName
}

export class BxRdRoot {
    public dataName:  string[];
 
    public constructor() {
        this.dataName = new Array<string>(BxDataName.kNum_DataName);

        this.dataName[BxDataName.KData_n_MascuteAzur001] = "MascuteAzur001";
        this.dataName[BxDataName.KData_n_04_Cup1]        = "04_Cup1";
        this.dataName[BxDataName.KData_n_18_Ring0]       = "18_Ring0";
        this.dataName[BxDataName.KData_n_19_Sphere1]     = "19_Sphere1";
        this.dataName[BxDataName.KData_n_MascutePav001]  = "MascutePav001";
        this.dataName[BxDataName.KData_n_Hippopotamus]   = "Hippopotamus";
        this.dataName[BxDataName.KData_n_Manatee_01]     = "Manatee_01";
    }
}
