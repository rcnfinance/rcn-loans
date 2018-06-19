import { Loan } from './loan.model';

export class CosignerOption {
    constructor(
        public id: string,
        public name: string,
        public provider: DetailProvider
    ) {}
}

export interface DetailProvider {
    getDetail(loan: Loan): Promise<CosignerDetail>;
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
