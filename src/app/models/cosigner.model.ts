export class CosignerDetail {}

export class Cosigner {
  constructor (
        public contract: string,
        public cosignerDetail: CosignerDetail
    ) {}
}

export class CosignerOffer extends Cosigner {
  constructor (
        public contract: string,
        public cosignerDetail: CosignerDetail,
        public lendData: string
    ) {
    super(contract, cosignerDetail);
  }
}

export class CosignerLiability extends Cosigner {
  constructor (
        public contract: string,
        public cosignerDetail: CosignerDetail,
        public canClaim: Boolean,
        public claim: () => Promise<string>
    ) {
    super(contract, cosignerDetail);
  }
}

export class UnknownCosigner extends CosignerDetail {
  constructor () {
    super();
  }
}
