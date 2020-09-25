import { Injectable } from '@angular/core';
import * as BN from 'bn.js';
import { ContractsService } from './contracts.service';
import { Tx, Type } from '../services/tx.service';
import { Loan } from './../models/loan.model';
import { Collateral } from './../models/collateral.model';
import { Utils } from './../utils/utils';
import { Currency } from './../utils/currencies';
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
    const loanOracle: string = await this.contractsService.symbolToOracle(loan.currency.toString());
    const loanRate: BN | string = await this.contractsService.getRate(loanOracle, loan.currency.decimals);
    const loanAmount: number =
      loan.debt ? loan.debt.model.estimatedObligation : loan.descriptor.totalObligation;
    const loanAmountInRcn: BN = Utils.bn(loanAmount)
        .mul(Utils.bn(loanRate))
        .div(Utils.pow(10, loan.currency.decimals));

    const collateralOracle: string = await this.contractsService.symbolToOracle(currency.symbol);
    const collateralDecimals: number = new Currency(currency.symbol).decimals;
    const collateralRate: BN | string = await this.contractsService.getRate(collateralOracle, collateralDecimals);
    const collateralAmountInRcn: BN = Utils.bn(collateralRate)
        .mul(Utils.bn(amount))
        .div(Utils.pow(10, collateralDecimals));

    const collateralPercentage: number =
      Number(collateralAmountInRcn.toString()) * 100 / Number(loanAmountInRcn.toString());

    const DECIMALS_TO_SHOW = 2;
    const WITH_COMMAS = false;
    const collateralRatio: string =
      Utils.formatAmount(collateralPercentage, DECIMALS_TO_SHOW, WITH_COMMAS);

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
    const currency: CurrencyItem =
      this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    const liquidationPercentage: string =
      this.rawToPercentage(liquidationRatio).toString();

    const loanDebt =
      loan.debt ? loan.debt.model.estimatedObligation : loan.descriptor.totalObligation;
    const collateralAmount = new Currency(currency.symbol).fromUnit(amount);
    const liquidationPrice = (Number(liquidationPercentage) / 100 * loanDebt) / collateralAmount;
    const formattedLiquidationPrice: number =
      (liquidationPrice as any / 10 ** loan.currency.decimals);

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
    const collateralAmount = new Currency(currency.symbol).fromUnit(amount);
    const currentPrice = (Number(collateralPercentage) / 100 * loanDebt) / collateralAmount;
    const formattedCurrentPrice: number =
      (currentPrice as any / 10 ** loan.currency.decimals);

    return formattedCurrentPrice;
  }

  /**
   * Get rate loan currency / collateral currency
   * @return Exchange rate
   */
  async getCollateralRate(loan: Loan, collateral: Collateral): Promise<string> {
    const loanRate: BN | string =
      await this.contractsService.getRate(loan.oracle.address, loan.currency.decimals);

    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    const collateralDecimals: number = new Currency(collateralCurrency.symbol).decimals;
    const collateralRate: BN | string = await this.contractsService.getRate(collateral.oracle, collateralDecimals);

    const rate = Utils.formatAmount((loanRate as any) / (collateralRate as any));
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
