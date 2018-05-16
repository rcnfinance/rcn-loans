
import { CosignerDetail } from './../cosigner.model';
import BigNumber from 'bignumber.js';

export class DecentralandCosigner implements CosignerDetail {
    constructor(
        public id: number,
        public landId: string,
        public landPrice: number,
        public financePart: string,
        public parcel: Parcel
    ) { }

    get x(): number {
        const xy = decodeTokenId(this.landId);
        return parseInt(xy[0].toString(), 10);
    }

    get y(): number {
        const xy = decodeTokenId(this.landId);
        return parseInt(xy[1].toString(), 10);
    }

    get coordinates(): string {
        const xy = decodeTokenId(this.landId);
        return xy[0].toString() + ' ' + xy[1].toString();
    }

    get displayPrice(): string {
        return (this.landPrice / 10 ** 18).toString();
    }

    get data(): string {
        return formatData(this.id);
    }
}

export class Parcel {
    constructor(
        public id: string,
        public x: number,
        public y: number,
        public auction_price: number,
        public owner: string,
        public district_id: string,
        public tags: Object
    ) {}
}

export class District {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public link: string
    ) {}
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

function formatData(id: number): string {
    let hex = id.toString(16);
    if (hex.length < 65) {
      hex = Array(65 - hex.length).join('0') + hex;
    }
    return '0x' + hex;
}
