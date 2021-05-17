import { Injectable } from '@angular/core';
import * as BN from 'bn.js';
import { ContractsService } from './contracts.service';
import { Tx, Type } from '../services/tx.service';
import { Loan } from './../models/loan.model';
import { Collateral } from './../models/collateral.model';
import { Utils } from './../utils/utils';
import { CurrenciesService, CurrencyItem } from './../services/currencies.service';

@Injectable()
export class CollateralService {

  constructor(
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService
  ) { }

  /**
   * Calculate the collateralization percentage
   * @param loan Loan
   * @param currency Collateral currency
   * @param amount Collateral amount in wei
   * @return Collateral percentage
   */
  async calculateCollateralPercentage(
    loan: Loan,
    currency: CurrencyItem,
    amount: BN | string
  ) {
    if (!currency || !amount) {
      return;
    }

    const { engine } = loan;
    const loanOracle: string = await this.contractsService.symbolToOracle(engine, loan.currency.toString());
    const decimals = this.currenciesService.getCurrencyDecimals('symbol', loan.currency.symbol);
    const loanRate: BN | string = await this.contractsService.getRate(loanOracle, decimals);
    const loanAmount: number =
      loan.debt ? loan.debt.model.estimatedObligation : loan.descriptor.totalObligation;
    const loanAmountInRcn: BN = Utils.bn(loanAmount)
        .mul(Utils.bn(loanRate))
        .div(Utils.pow(10, decimals));

    const collateralOracle: string = await this.contractsService.symbolToOracle(engine, currency.symbol);
    const collateralDecimals: number = this.currenciesService.getCurrencyDecimals('symbol', currency.symbol);
    const collateralRate: BN | string = await this.contractsService.getRate(collateralOracle, collateralDecimals);
    const collateralAmountInRcn: BN = Utils.bn(collateralRate)
        .mul(Utils.bn(amount))
        .div(Utils.pow(10, collateralDecimals));

    const collateralPercentage: number =
      Number(collateralAmountInRcn.toString()) * 100 / Number(loanAmountInRcn.toString());

    const DECIMALS_TO_SHOW = 2;
    const WITH_COMMAS = false;
    const filteredCollateralPercentage =
      isFinite(collateralPercentage) && !isNaN(collateralPercentage) ? collateralPercentage : 0;
    const collateralRatio: string =
      Utils.formatAmount(filteredCollateralPercentage, DECIMALS_TO_SHOW, WITH_COMMAS);

    return collateralRatio;
  }

  /**
   * Check if the sended transaction is from the current collateral
   * @param tx Tx
   * @param collateralId Collateral ID
   * @return Boolean
   */
  async isCurrentCollateralTx(
    tx: Tx,
    collateralId
  ) {
    switch (tx.type) {
      case Type.withdrawCollateral:
      case Type.addCollateral:
        if (tx.data.collateralId === collateralId) {
          return true;
        }
        break;

      default:
        return false;
    }
  }

  /**
   * Calculate liquidation price
   * @return Liquidation price in collateral amount
   */
  async calculateLiquidationPrice(loan: Loan, collateral: Collateral): Promise<number> {
    const { liquidationRatio, amount, token } = collateral;
    const { symbol }: CurrencyItem =
      this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    const liquidationPercentage: string =
      this.rawToPercentage(liquidationRatio).toString();

    const loanDebt =
      loan.debt ? loan.debt.model.estimatedObligation : loan.descriptor.totalObligation;
    const collateralAmount = this.currenciesService.getAmountFromDecimals(amount, symbol);

    const liquidationPrice = (Number(liquidationPercentage) / 100 * loanDebt) / collateralAmount;
    const loanCurrencyDecimals = this.currenciesService.getCurrencyDecimals('symbol', loan.currency.symbol);
    const formattedLiquidationPrice: number =
      (liquidationPrice as any / 10 ** loanCurrencyDecimals);

    return formattedLiquidationPrice;
  }

  /**
   * Calculate current price
   * @return Current price price in collateral amount
   */
  async calculateCurrentPrice(loan: Loan, collateral: Collateral): Promise<number> {
    const { amount, token } = collateral;
    const currency: CurrencyItem =
      this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    const collateralPercentage: string =
      await this.calculateCollateralPercentage(loan, currency, amount);

    const loanDebt =
      loan.debt ? loan.debt.model.estimatedObligation : loan.descriptor.totalObligation;
    const collateralAmount = this.currenciesService.getAmountFromDecimals(amount, currency.symbol);
    const currentPrice = (Number(collateralPercentage) / 100 * loanDebt) / collateralAmount;
    const loanCurrencyDecimals = this.currenciesService.getCurrencyDecimals('symbol', loan.currency.symbol);
    const formattedCurrentPrice: number =
      (currentPrice as any / 10 ** loanCurrencyDecimals);

    return formattedCurrentPrice;
  }

  /**
   * Get rate loan currency / collateral currency
   * @return Exchange rate
   */
  async getCollateralRate(loan: Loan, collateral: Collateral): Promise<number> {
    const loanCurrencyDecimals = this.currenciesService.getCurrencyDecimals('symbol', loan.currency.symbol);
    const loanRate: BN | string =
      await this.contractsService.getRate(loan.oracle.address, loanCurrencyDecimals);

    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    const collateralDecimals = this.currenciesService.getCurrencyDecimals('symbol', collateralCurrency.symbol);
    const collateralRate: BN | string = await this.contractsService.getRate(collateral.oracle, collateralDecimals);

    const rate = (loanRate as any) / (collateralRate as any);
    return rate;
  }

  /**
   * Return formatted percentage
   * @param ratio Raw ratio
   * @return Formatted percentage
   */
  rawToPercentage (ratio: number | string | BN): BN {
    const secureRatio: BN = Utils.bn(ratio).mul(Utils.bn(2000));
    const securePercentage = Utils.bn(secureRatio)
        .div(Utils.pow(2, 32))
        .mul(Utils.bn(100));

    return securePercentage.div(Utils.bn(2000));
  }

  /**
   * Return raw ratio
   * @param num Formatted percentage
   * @return Raw ratio value
   */
  percentageToRaw (percentage: number | string | BN): BN {
    const securePercentage: BN = Utils.bn(percentage).mul(Utils.bn(2000));
    const secureRatio = Utils.bn(securePercentage)
        .mul(Utils.pow(2, 32))
        .div(Utils.bn(100));

    return secureRatio.div(Utils.bn(2000));
  }
}
