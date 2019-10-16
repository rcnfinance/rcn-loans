import { Loan, Network, Oracle, Descriptor, Debt, Status, Model } from '../models/loan.model';
import { Utils } from './utils';
import { environment } from './../../environments/environment';

interface LoanApiBasalt {
  index: number;
  created: number;
  approved: boolean;
  status: Status;
  oracle: string;
  borrower: string;
  lender?: string;
  creator: string;
  cosigner: string;
  amount: number;
  interest: number;
  punitory_interest: number;
  interest_timestamp: number;
  paid: number;
  interest_rate: number;
  interest_rate_punitory: number;
  due_time: number;
  dues_in: number;
  currency?: string;
  cancelable_at?: number;
  lender_balance: number;
  expiration_requests: number;
  approved_transfer: number;
}

interface LoanApiDiaspore {
  id: string;
  open: boolean;
  approved: boolean;
  position: number;
  expiration: number;
  amount: number;
  cosigner: string;
  model: string;
  creator: string;
  oracle: string;
  borrower: string;
  callback: string;
  salt: number;
  loanData: string;
  created: number;
  descriptor: {
    first_obligation: number;
    total_obligation: number;
    duration: number;
    interest_rate: number;
    punitive_interest_rate: number;
    frequency: number;
    installments: number;
  };
  currency: string;
  lender: string;
  status: number;
  canceled: boolean;
}

interface ModelDebtInfo {
  paid: number;
  due_time: number;
  estimated_obligation: number;
  next_obligation: number;
  current_obligation: number;
  debt_balance: number;
  owner: string;
}

export class LoanUtils {
  static decodeInterest(raw: number): number {
    return 311040000000000 / raw;
  }
  static calculateInterest(_timeDelta: number, _interestRate: number, _amount: number): number {
    return (_amount * 100000 * _timeDelta) / _interestRate;
  }
  static parseBasaltLoan(engine: string, loanBytes: any): Loan {
    // Read raw bytes
    const owner = Utils.formatAddress(loanBytes[0]);
    const oracleAddress = Utils.formatAddress(loanBytes[1]);
    const borrower = Utils.formatAddress(loanBytes[2]);
    const cosigner = Utils.formatAddress(loanBytes[3]);
    const creator = Utils.formatAddress(loanBytes[4]);
    const amount = parseInt(loanBytes[5], 16);
    const punitiveInterest = parseInt(loanBytes[6], 16);
    const interestTimestamp = parseInt(loanBytes[7], 16);
    const paid = parseInt(loanBytes[8], 16);
    const interestRate = parseInt(loanBytes[9], 16);
    const interestRatePunitive = parseInt(loanBytes[10], 16);
    const dueTime = parseInt(loanBytes[11], 16);
    const duesIn = parseInt(loanBytes[12], 16);
    const firstPayment = parseInt(loanBytes[13], 16);
    const status = parseInt(loanBytes[14], 16);
    const lenderBalance = parseInt(loanBytes[15], 16);
    const currency = loanBytes[16];
    const expirationRequest = parseInt(loanBytes[17], 16);
    const interest = parseInt(loanBytes[18], 16);
    const id = parseInt(loanBytes[19], 16);

    // Build Oracle if exist
    const loanCurrencyWith0x = '0x';

    let oracle: Oracle;
    if (oracleAddress !== Utils.address0x) {
      oracle = new Oracle(
        Network.Basalt,
        oracleAddress,
        Utils.hexToAscii(currency.replace(/^[0x]+|[0]+$/g, '')),
        currency
      );
    } else {
      oracle = new Oracle(
        Network.Diaspore,
        oracleAddress,
        'RCN',
        loanCurrencyWith0x.concat(currency)
      );
    }

    // Build debt if not a request
    let debt: Debt;
    if (status !== Status.Request) {
      // Run "Basalt" model, emulate Diaspore model
      let pending;
      let deltaTime;
      let newInterest = interest;
      let newPunitoryInterest = punitiveInterest;
      const timestamp = new Date().getTime() / 1000;
      const endNonPunitory = Math.min(timestamp, dueTime);
      if (endNonPunitory > interestTimestamp) {
        deltaTime = endNonPunitory - interestTimestamp;

        if (paid < amount) {
          pending = amount - paid;
        } else {
          pending = 0;
        }

        newInterest += this.calculateInterest(deltaTime, interestRate, pending);
      }

      if (timestamp > dueTime) {
        const startPunitory = Math.max(dueTime, interestTimestamp);
        deltaTime = timestamp - startPunitory;
        const debtAmount = amount + newInterest;
        const pendingAmount = Math.min(debtAmount, (debtAmount + newPunitoryInterest) - paid);
        newPunitoryInterest += this.calculateInterest(deltaTime, interestRatePunitive, pendingAmount);
      }
      const totalAmount = amount + newInterest + newPunitoryInterest;

      // Create debt
      debt = new Debt(
        Network.Diaspore,
        id.toString(),
        new Model(
          Network.Basalt,
          engine,
          paid,
          totalAmount,
          totalAmount,
          totalAmount,
          dueTime
        ),
        lenderBalance,
        engine,
        owner,
        oracle
      );
    }

    // Crete loan
    return new Loan(
      Network.Basalt,
      id.toString(),
      engine,
      amount,
      oracle,
      new Descriptor(
        Network.Basalt,
        ((amount * 100000 * firstPayment) / interestRate) + amount,
        ((amount * 100000 * duesIn) / interestRate) + amount,
        duesIn,
        this.decodeInterest(interestRate),
        this.decodeInterest(interestRatePunitive),
        1,
        1
      ),
      borrower,
      creator,
      status,
      expirationRequest,
      '',
      cosigner !== Utils.address0x ? cosigner : undefined,
      debt
    );
  }
  static parseLoan(engine: string, bytes: any): Loan {
    // Read raw bytes
    // Loan
    const id = bytes[0];
    const borrower = Utils.formatAddress(bytes[1]);
    const creator = Utils.formatAddress(bytes[2]);
    const amount = parseInt(bytes[3], 16);
    const currency = Utils.hexToAscii(bytes[4].replace(/^[0x]+|[0]+$/g, ''));
    const oracleAddress = Utils.formatAddress(bytes[5]);
    // const approved = parseInt(bytes[6], 16) === 1;
    const expiration = parseInt(bytes[7], 16);
    const model = Utils.formatAddress(bytes[8]);
    const status = parseInt(bytes[9], 16);
    // Descriptor
    const firstObligationAmount = parseInt(bytes[10], 16);
    // const firstObligationTime = parseInt(bytes[11], 16);
    const totalObligation = parseInt(bytes[12], 16);
    const duration = parseInt(bytes[13], 16);
    const punitiveInterestRate = this.decodeInterest(parseInt(bytes[14], 16));
    const frequency = parseInt(bytes[15], 16);
    const installments = parseInt(bytes[16], 16);

    let oracle: Oracle;
    if (oracleAddress !== Utils.address0x) {
      oracle = new Oracle(
        Network.Diaspore,
        oracleAddress,
        currency,
        bytes[4]
      );
    }

    let debt: Debt;
    let cosigner: string;
    if (status !== Status.Request) {
      cosigner = Utils.formatAddress(bytes[17]);
      const paid = parseInt(bytes[18], 16);
      const dueTime = parseInt(bytes[19], 16);
      const estimatedObligation = parseInt(bytes[20], 16);
      const nextObligation = parseInt(bytes[21], 16);
      const currentObligation = parseInt(bytes[22], 16);
      const debtBalance = parseInt(bytes[23], 16);
      const owner = Utils.formatAddress(bytes[24]);
      debt = new Debt(
        Network.Diaspore,
        id,
        new Model(
          Network.Diaspore,
          model,
          paid,
          nextObligation,
          currentObligation,
          estimatedObligation,
          dueTime
        ),
        debtBalance,
        engine,
        owner,
        oracle
      );
    }

    // Calculate interest rate
    const durationPercentage = ((totalObligation / amount) - 1) * 100;
    const interestRate = (durationPercentage * 360 * 86000) / duration;

    // const yearAccrued = (totalObligation * 86400 * 360) / duration;
    // const interestRate = ((yearAccrued / amount) - 1) * 100;

    return new Loan(
      Network.Diaspore,
      id,
      engine,
      amount,
      oracle,
      new Descriptor(
        Network.Diaspore,
        firstObligationAmount,
        totalObligation,
        duration,
        interestRate,
        punitiveInterestRate,
        frequency,
        installments
      ),
      borrower,
      creator,
      status,
      expiration,
      model,
      cosigner,
      debt
    );
  }

  /**
   * Create basalt loan model from the api response
   * @param loanData Loan data obtained from API
   * @return Loan
   */
  static createBasaltLoan(loanData: LoanApiBasalt): Loan {
    const loanCurrencyWith0x = '0x';
    const engine: string = environment.contracts.basaltEngine;
    const firstPayment: number = loanData.cancelable_at;

    loanData.amount = Number(loanData.amount);
    loanData.punitory_interest = Number(loanData.punitory_interest);
    loanData.interest_timestamp = Number(loanData.interest_timestamp);
    loanData.paid = Number(loanData.paid);
    loanData.interest_rate = Number(loanData.interest_rate);
    loanData.interest_rate_punitory = Number(loanData.interest_rate_punitory);
    loanData.due_time = Number(loanData.due_time);
    loanData.dues_in = Number(loanData.dues_in);

    let oracle: Oracle;
    if (loanData.oracle !== Utils.address0x) {
      oracle = new Oracle(
        Network.Basalt,
        loanData.oracle,
        Utils.hexToAscii(loanData.currency.replace(/^[0x]+|[0]+$/g, '')),
        loanData.currency
      );
    } else {
      oracle = new Oracle(
        Network.Diaspore,
        loanData.oracle,
        'RCN',
        loanCurrencyWith0x.concat(loanData.currency)
      );
    }

    // build debt if not a request
    let debt: Debt;

    if (loanData.status !== Status.Request) {
      // run "basalt" model, emulate Diaspore model
      let pending;
      let deltaTime;
      let newInterest = loanData.interest;
      let newPunitoryInterest = loanData.punitory_interest;
      const timestamp = new Date().getTime() / 1000;
      const endNonPunitory = Math.min(timestamp, loanData.due_time);
      if (endNonPunitory > loanData.interest_timestamp) {
        deltaTime = endNonPunitory - loanData.interest_timestamp;

        if (loanData.paid < loanData.amount) {
          pending = loanData.amount - loanData.paid;
        } else {
          pending = 0;
        }

        newInterest += this.calculateInterest(deltaTime, loanData.interest_rate, pending);
      }

      if (timestamp > loanData.due_time) {
        const startPunitory = Math.max(loanData.due_time, loanData.interest_timestamp);
        deltaTime = timestamp - startPunitory;
        const debtAmount = loanData.amount + newInterest;
        const pendingAmount = Math.min(debtAmount, (debtAmount + newPunitoryInterest) - loanData.paid);
        newPunitoryInterest += this.calculateInterest(deltaTime, loanData.interest_rate_punitory, pendingAmount);
      }
      const totalAmount = loanData.amount + newInterest + newPunitoryInterest;

      debt = new Debt(
        Network.Basalt,
        loanData.index.toString(),
        new Model(
          Network.Basalt,
          engine,
          loanData.paid,
          totalAmount,
          totalAmount,
          totalAmount,
          loanData.due_time
        ),
        loanData.lender_balance,
        engine,
        loanData.lender,
        oracle
      );
    }

    return new Loan(
      Network.Basalt,
      loanData.index.toString(),
      engine,
      loanData.amount,
      oracle,
      new Descriptor(
        Network.Basalt,
        ((loanData.amount * 100000 * firstPayment) / loanData.interest_rate) + loanData.amount,
        ((loanData.amount * 100000 * loanData.dues_in) / loanData.interest_rate) + loanData.amount,
        loanData.dues_in,
        Utils.formatInterest(loanData.interest_rate),
        Utils.formatInterest(loanData.interest_rate_punitory),
        1,
        1
      ),
      loanData.borrower,
      loanData.creator,
      loanData.status,
      loanData.expiration_requests,
      '',
      loanData.cosigner !== Utils.address0x ? loanData.cosigner : undefined,
      debt
    );
  }

  /**
   * Create diaspore loan model from the api response
   * @param loanData Loan data obtained from API
   * @return Loan
   */
  static createDiasporeLoan(loanData: LoanApiDiaspore, debtInfo: ModelDebtInfo): Loan {
    const engine = environment.contracts.diaspore.loanManager;

    let oracle: Oracle;
    if (loanData.oracle !== Utils.address0x) {
      const currency = loanData.currency ? Utils.hexToAscii(loanData.currency.replace(/^[0x]+|[0]+$/g, '')) : '';
      oracle = new Oracle(
        Network.Diaspore,
        loanData.oracle,
        currency,
        loanData.currency
      );
    } else {
      oracle = new Oracle(
        Network.Diaspore,
        loanData.oracle,
        'RCN',
        loanData.currency
      );
    }

    let descriptor: Descriptor;
    let debt: Debt;

    descriptor = new Descriptor(
      Network.Diaspore,
      Number(loanData.descriptor.first_obligation),
      Number(loanData.descriptor.total_obligation),
      Number(loanData.descriptor.duration),
      Number(loanData.descriptor.interest_rate),
      LoanUtils.decodeInterest(
        Number(loanData.descriptor.punitive_interest_rate)
      ),
      Number(loanData.descriptor.frequency),
      Number(loanData.descriptor.installments)
    );

    // set debt model
    if (debtInfo) {
      const paid = debtInfo.paid;
      const dueTime = debtInfo.due_time;
      const estimatedObligation = debtInfo.estimated_obligation;
      const nextObligation = debtInfo.next_obligation;
      const currentObligation = debtInfo.current_obligation;
      const debtBalance = debtInfo.debt_balance;
      const owner = debtInfo.owner;
      debt = new Debt(
        Network.Diaspore,
        loanData.id,
        new Model(
          Network.Diaspore,
          loanData.model,
          paid,
          nextObligation,
          currentObligation,
          estimatedObligation,
          dueTime
        ),
        debtBalance,
        engine,
        owner,
        oracle
      );
    }
    const status = loanData.canceled ? Status.Destroyed : Number(loanData.status);

    return new Loan(
      Network.Diaspore,
      loanData.id,
      engine,
      Number(loanData.amount),
      oracle,
      descriptor,
      loanData.borrower,
      loanData.creator,
      status,
      Number(loanData.expiration),
      loanData.model,
      loanData.cosigner,
      debt
    );
  }
}
