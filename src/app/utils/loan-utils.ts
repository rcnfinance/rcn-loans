import { Loan, Engine, Oracle, Descriptor, Debt, Config, Status, Model } from '../models/loan.model';
import { Collateral } from '../models/collateral.model';
import { LoanContentApi } from './../interfaces/loan-api-diaspore';
import { Commit, CommitTypes, CommitProperties } from './../interfaces/commit.interface';
import { RcnApiUtils } from './rcn-api-utils';
import { Utils } from './utils';
import { environment } from './../../environments/environment';

export class LoanUtils {
  static decodeInterest(raw: number): number {
    return 311040000000000 / raw;
  }
  static calculateInterest(_timeDelta: number, _interestRate: number, _amount: number): number {
    return (_amount * 100000 * _timeDelta) / _interestRate;
  }

  /**
   * Build loan model from api response
   * @param loanData Loan data obtained from API
   * @return Loan
   */
  static buildLoan(loanContent: LoanContentApi): Loan {
    const {
      loan: loanData,
      debt: debtData,
      descriptor: descriptorData,
      collateral: collateralData,
      installments: installmentsData,
      engine
    } = loanContent;

    let oracle: Oracle;
    if (loanData.oracle !== Utils.address0x) {
      const currency = loanData.currency ?
        Utils.hexToAscii(loanData.currency.replace(/^[0x]+|[0]+$/g, '')) :
        '';
      oracle = new Oracle(loanData.oracle, currency, loanData.currency);
    } else {
      const DEFAULT_CURRENCY = engine === Engine.RcnEngine ? 'RCN' : 'USDC';
      oracle = new Oracle(loanData.oracle, DEFAULT_CURRENCY, loanData.currency);
    }

    const engineAddress = environment.contracts[engine].diaspore.loanManager;

    let descriptor: Descriptor;
    let debt: Debt;
    let config: Config;

    descriptor = new Descriptor(
      Number(descriptorData.first_obligation),
      descriptorData.total_obligation,
      Number(descriptorData.duration),
      Number(descriptorData.interest_rate),
      LoanUtils.decodeInterest(
        Number(descriptorData.punitive_interest_rate)
      ),
      Number(descriptorData.frequency),
      Number(descriptorData.installments)
    );

    // set debt model
    if (debtData) {
      const paid = installmentsData.paid;
      const now = new Date().getTime() / 1000;
      const dueTime = RcnApiUtils.getDueTime(loanContent);
      const estimatedObligation = RcnApiUtils.getEstimateObligation(loanContent);
      const { obligation: nextObligation } = RcnApiUtils.getObligation(loanContent, dueTime);
      const { obligation: currentObligation } = RcnApiUtils.getObligation(loanContent, now);
      const debtBalance = debtData.balance;
      const owner = debtData.owner;
      debt = new Debt(
        loanData.loan_id,
        new Model(
          loanData.model,
          Number(paid),
          nextObligation,
          currentObligation,
          estimatedObligation,
          dueTime
        ),
        Number(debtBalance),
        engineAddress,
        owner,
        oracle
      );
    }
    const status = loanData.canceled ? Status.Destroyed : loanData.status;

    if (installmentsData) {
      config = new Config(
        Number(installmentsData.installments),
        Number(installmentsData.time_unit),
        Number(installmentsData.duration),
        Number(installmentsData.lent_time),
        Number(installmentsData.cuota),
        Number(installmentsData.interest_rate)
      );
    }

    let collateral: Collateral;
    if (collateralData) {
      const {
        id,
        debt_id,
        oracle: collateralOracle,
        token,
        amount,
        liquidation_ratio,
        balance_ratio,
        status: collateralStatus
      } = collateralData;

      collateral = new Collateral(
        Number(id),
        debt_id,
        collateralOracle,
        token,
        Utils.scientificToDecimal(amount),
        Utils.scientificToDecimal(liquidation_ratio),
        Utils.scientificToDecimal(balance_ratio),
        collateralStatus
      );
    }

    return new Loan(
      engine,
      loanData.loan_id,
      engineAddress,
      Number(loanData.amount),
      oracle,
      descriptor,
      loanData.borrower,
      loanData.borrower,
      status,
      Number(loanData.expiration),
      loanData.model,
      loanData.cosigner,
      debt,
      config,
      collateral
    );
  }

  /**
   * Get paid amount
   * @param commits Loan commits
   * @param paidNonce Nonce of Paid event
   * @return Paid amount
   */
  static getCommitPaidAmount(commits: Commit[], paidTimestamp: string): number {
    const { data } = commits
        .filter(({ timestamp }) => timestamp < paidTimestamp)
        .reverse()
        .find(({ opcode }) => opcode === CommitTypes.PaidBase);

    return data[CommitProperties.PaidBase] - data[CommitProperties.Paid];
  }
}
