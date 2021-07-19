import { Type } from 'app/interfaces/tx';
import { Engine } from 'app/models/loan.model';
import { AvailableChains } from 'app/interfaces/chain';

export class Tx {
  chain: AvailableChains;
  engine: Engine;
  hash: string;
  from: string;
  to: string;
  confirmed: boolean;
  cancelled: boolean;
  speedup: boolean;
  type: Type;
  data: any;
  timestamp: number;

  constructor(
    chain: AvailableChains,
    engine: Engine,
    hash: string,
    from: string,
    to: string,
    confirmed: boolean,
    cancelled: boolean,
    speedup: boolean,
    type: Type,
    data: any
  ) {
    this.chain = chain;
    this.engine = engine;
    this.hash = hash;
    this.from = from;
    this.to = to;
    this.confirmed = confirmed;
    this.cancelled = cancelled;
    this.speedup = speedup;
    this.type = type;
    this.data = data;
    this.timestamp = new Date().getTime();
  }
}
