import * as BN from 'bn.js';
import { Utils } from './../../utils/utils';
import { CosignerDetail } from './../cosigner.model';

export class DecentralandCosigner extends CosignerDetail {
  constructor(
        public id: number,
        public landId: string,
        public landPrice: number,
        public financePart: string,
        public parcel: Parcel,
        public status: number
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
  tags: any;
  id: string;
  x: number;
  y: number;
  auctionPrice: number;
  owner: string;
  districtId: string;
  status: string;

  constructor(json: any) {
    this.id = json.id;
    this.x = json.x;
    this.y = json.y;
    this.auctionPrice = json.auction_price;
    this.owner = json.owner;
    this.districtId = json.district_id;
    this.tags = json.tags;
    this.status = json.publication != null ? json.publication.status : null;
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
        public districtId: string,
        public distance: number
    ) {}
}

function decodeTokenId(_value: string): [number, number] {
  const value = _value.replace('0x', '');
  const x = value.slice(0, 32);
  const y = value.slice(32);
  return [fixNegative(Utils.bn(x, 16)), fixNegative(Utils.bn(y, 16))];
}

function fixNegative(value: BN): number {
  const mid = Utils.bn(2).pow(Utils.bn(64));

  if (mid.sub(value).toNumber() <= 0) {
    return value.sub(Utils.bn(2).pow(Utils.bn(128))).toNumber();
  }

  return value.toNumber();
}
