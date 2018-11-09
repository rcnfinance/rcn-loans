import { Loan, Network, Oracle, Descriptor, Debt, Status, Model } from '../models/loan.model';
import { Utils } from './utils';

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
    let oracle: Oracle;
    if (oracleAddress !== Utils.address0x) {
      oracle = new Oracle(
        Network.Basalt,
        oracleAddress,
        Utils.hexToAscii(currency.replace(/^[0x]+|[0]+$/g, ''))
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
    const currency = bytes[4];
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
        currency
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
    const yearAccrued = (totalObligation * 86400 * 360) / duration;
    const interestRate = ((yearAccrued / amount) - 1) * 100;

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
      cosigner,
      debt
    );
  }
}
