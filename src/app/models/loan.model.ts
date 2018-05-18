
import { Utils } from './../utils/utils';
import { Currency } from '../utils/currencies';

export class Loan {
    public id: number;
    public status: number;
    public borrower: string;
    public creator: string;
    public rawAmount: number;
    public duration: number;
    public rawAnnualInterest: number;
    public rawAnnualPunitoryInterest: number;
    public currencyRaw: string;
    public engine: string;
    public lenderBalance: number;

    constructor(
      id: number,
      status: number,
      borrower: string,
      creator: string,
      rawAmount: number,
      duration: number,
      rawAnnualInterest: number,
      rawAnnualPunitoryInterest: number,
      currencyRaw: string,
      engine: string,
      lenderBalance: number) {
        this.id = id;
        this.status = status;
        this.borrower = Utils.formatAddress(borrower);
        this.creator = Utils.formatAddress(creator);
        this.rawAmount = rawAmount;
        this.duration = duration;
        this.rawAnnualInterest = rawAnnualInterest;
        this.rawAnnualPunitoryInterest = rawAnnualPunitoryInterest;
        this.currencyRaw = currencyRaw;
        this.engine = engine;
        this.lenderBalance = lenderBalance;
      }

    get uid(): string {
        return this.engine + this.id;
    }

    get currency(): string {
        const targetCurrency = Utils.hexToAscii(this.currencyRaw.replace(/^[0x]+|[0]+$/g, ''));

        if (targetCurrency === '') {
            return 'RCN';
        } else {
            return targetCurrency;
        }
    }

    get decimals(): number {
        // TODO: Detect fiat currency
        return Currency.getDecimals(this.currency);
    }

    get amount(): number {
        return this.rawAmount / 10 ** this.decimals;
    }

    get annualInterest(): number {
        return Utils.formatInterest(this.rawAnnualInterest);
    }

    get annualPunitoryInterest(): number {
        return Utils.formatInterest(this.rawAnnualPunitoryInterest);
    }

    get verboseDuration(): string {
        return Utils.formatDelta(this.duration);
    }

    get expectedReturn(): number {
        return ((this.amount * 100000 * this.duration) / this.rawAnnualInterest) + this.amount;
    }

    get borrowerShort(): string {
        return Utils.shortAddress(this.borrower);
    }
  }
