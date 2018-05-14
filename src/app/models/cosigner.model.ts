import BigNumber from 'bignumber.js';

export class CosignerOption {
    constructor(
        public id: string,
        public name: string,
        public detail: Promise<CosignerDetail>
    ) {}
}

export class CosignerDetail {
    constructor (
        public data: string
    ) {}
}

export class DecentralandCosigner implements CosignerDetail {
    constructor(
        public data: string,
        public landId: string,
        public landPrice: number
        // public landMapSrc: string,
    ) {}

    get coordinates(): string {
        const xy = decodeTokenId(this.landId);
        return xy[0].toString() + ' ' + xy[1].toString()
    }
}

function decodeTokenId(value: string): [number, number] {
    value = value.slice(2);
    const x = value.slice(0, 32);
    const y = value.slice(32);
    return [fixNegative(new BigNumber(x, 16)), fixNegative(new BigNumber(y, 16))];
  }

  function fixNegative(value: BigNumber): number {
    const mid = (new BigNumber(2).pow(new BigNumber(127)));
    const max = (new BigNumber(2).pow(new BigNumber(128)));
    if (value > mid) {
        return value.minus(max);
    } else {
        return value;
    }
}