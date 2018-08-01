
import { CosignerDetail, CosignerLiability } from './../cosigner.model';
import BigNumber from 'bignumber.js';

export class DecentralandCosigner extends CosignerDetail {
    constructor(
        public id: number,
        public landId: string,
        public landPrice: number,
        public financePart: string,
        public parcel: Parcel,
        public status: number,
        public owner: string
    ) {
        super();
    }

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
}

export class Parcel {
   public tags: any;
   public id: string;
   public x: number;
   public y: number;
   public auction_price: number;
   public owner: string;
   public district_id: string;

   constructor(json: any) {
       this.id = json.id;
       this.x = json.x;
       this.y = json.y;
       this.auction_price = json.auction_price;
       this.owner = json.owner;
       this.district_id = json.district_id;
       this.tags = json.tags;
   }
    get highlights(): Tag[] {
        const result = [];
        for (const key in (this.tags.proximity as Object)) {
            if (this.tags.proximity.hasOwnProperty(key)) {
                result.push(this.tags.proximity[key]);
            }
        }
        return result;
    }
}

export class District {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public link: string
    ) {}
}

export class Tag {
    constructor(
        public district_id: string,
        public distance: number
    ) {}
}

export function decodeTokenId(value: string): [number, number] {
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
