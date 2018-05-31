
export class CosignerOption {
    constructor(
        public id: string,
        public name: string,
        public detail: Promise<CosignerDetail>
    ) {}
}

export class CosignerDetail {
    constructor (
        public contract: string,
        public data: string
    ) {}
}

export class UnknownCosigner extends CosignerDetail {
    constructor (
        public contract: string
    ) {
        super(contract, '0x0');
    }
}
