
import { Utils } from './../utils/utils';
import { Currency } from '../utils/currencies';

 export enum Status { 
    Request,
    Ongoing,
    Paid,
    Destroyed,
    Indebt
}

export interface Descriptor {
    getInterestRate(amount: number): string;
    getPunitiveInterestRate(): string;
    getEstimatedReturn(): number;
    getDuration(): number;
}

export class Request {
    constructor(
        public engine: string,
        public id: string,
        public borrower: string,
        public creator: string,
        public amount: number,
        public currency: string,
        public oracle: string,
        public expiration: number,
        public model: string,
        public descriptor: Descriptor
    ) { }

    get isRequest() { return true; }

    public decimals(): number {
        return Currency.getDecimals(this.readCurrency());
    }

    public readCurrency(): string {
        const targetCurrency = Utils.hexToAscii(this.currency.replace(/^[0x]+|[0]+$/g, ''));
        return targetCurrency === '' ? 'RCN' : targetCurrency;
    }

    public readAmount(): number {
        return this.amount / 10 ** this.decimals();
    }
}

export class Loan extends Request {
    constructor(
        public engine: string,
        public id: string,
        public borrower: string,
        public owner: string,
        public creator: string,
        public amount: number,
        public currency: string,
        public oracle: string,
        public expiration: number,
        public model: string,
        public status: Status,
        public lentTime: number,
        public lenderBalance: number,
        // To review
        public cosigner: string,
        // Model
        public dueTime: number,
        public paid: number,
        public estimated: number,
        public interestRate: number,
        public punitiveInterestRate: number
    ) {
        super(
            engine,
            id,
            borrower,
            creator,
            amount,
            currency,
            oracle,
            expiration,
            model,
            undefined
        )
    }

    get isRequest() { return false; }

    get remainingTime() { return this.dueTime - (new Date().getTime() / 1000); }
}

export class BasaltLoan extends Loan {
    constructor(
        public engine: string,
        public idNumber: number,
        public oracle: string,
        public statusFlag: number,
        public borrower: string,
        public creator: string,
        public rawAmount: number,
        public duration: number,
        public rawAnnualInterest: number,
        public rawAnnualPunitoryInterest: number,
        public currencyRaw: string,
        public rawPaid: number,
        public cumulatedInterest: number,
        public cumulatedPunnitoryInterest: number,
        public interestTimestamp: number,
        public dueTimestamp: number,
        public lenderBalance: number,
        public owner: string,
        public cosigner: string
    ) {
        super(
            engine,
            idNumber.toString(),
            borrower,
            owner,
            creator,
            rawAmount,
            currencyRaw,
            oracle,
            0,
            Utils.address_0,
            statusFlag === Status.Ongoing && (new Date().getTime() / 1000) > dueTimestamp ? Status.Indebt : statusFlag,
            dueTimestamp - duration,
            lenderBalance,
            cosigner,
            dueTimestamp,
            rawPaid,
            0,
            rawAnnualInterest,
            rawAnnualPunitoryInterest
        );
        this.descriptor = new BasaltDescriptor(
            rawAnnualInterest,
            rawAnnualPunitoryInterest,
            rawAmount,
            duration
        );
        this.estimated = this.total - this.paid;
    }

    get isRequest() { return this.statusFlag === Status.Request; }

    get annualInterest(): number {
        return Utils.formatInterest(this.rawAnnualInterest);
    }

    get annualPunitoryInterest(): number {
        return Utils.formatInterest(this.rawAnnualPunitoryInterest);
    }

    get total(): number {
        function timestamp() { return (new Date().getTime() / 1000); }
        function calculateInterest(timeDelta: number, interestRate: number, amount: number): number {
            return (amount * 100000 * timeDelta) / interestRate;
        }
        let newInterest = this.cumulatedInterest;
        let newPunitoryInterest = this.cumulatedPunnitoryInterest;
        let pending;
        let deltaTime;
        const endNonPunitory = Math.min(timestamp(), this.dueTimestamp);
        if (endNonPunitory > this.interestTimestamp) {
          deltaTime = endNonPunitory - this.interestTimestamp;

          if (this.rawPaid < this.rawAmount) {
            pending = this.rawAmount - this.rawPaid;
          } else {
            pending = 0;
          }

          newInterest += calculateInterest(deltaTime, this.rawAnnualInterest, pending);
        }

        if (timestamp() > this.dueTimestamp) {
          const startPunitory = Math.max(this.dueTimestamp, this.interestTimestamp);
          deltaTime = timestamp() - startPunitory;
          const debt = this.rawAmount + newInterest;
          pending = Math.min(debt, (debt + newPunitoryInterest) - this.rawPaid);
          newPunitoryInterest += calculateInterest(deltaTime, this.rawAnnualPunitoryInterest, pending);
        }

        return this.rawAmount + newInterest + newPunitoryInterest;
    }
}

export class BasaltDescriptor implements Descriptor {
    constructor(
        private interestRate: number,
        private punitiveInterestRate: number,
        private amount: number,
        private duration: number
    ) { }
    getPunitiveInterestRate(): string {
        return Utils.formatInterest(this.interestRate).toPrecision(2)
    }
    getInterestRate(_amount: number): string {
        return Utils.formatInterest(this.punitiveInterestRate).toPrecision(2)
    }
    getEstimatedReturn(): number {
        return ((this.amount * 100000 * this.duration) / this.interestRate) + this.amount;
    }
    getDuration(): number {
        return this.duration;
    }
}
