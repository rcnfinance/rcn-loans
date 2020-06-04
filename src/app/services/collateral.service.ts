import { Injectable } from '@angular/core';
import * as BN from 'bn.js';
import { ContractsService } from './contracts.service';
import { Tx, Type } from '../services/tx.service';
import { Loan } from './../models/loan.model';
import { Utils } from './../utils/utils';
import { Currency } from './../utils/currencies';
import { CurrencyItem } from './../services/currencies.service';

@Injectable()
export class CollateralService {

  constructor(
    private contractsService: ContractsService
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
    const loanAmount: number = loan.debt ? loan.debt.model.estimatedObligation : loan.amount;
    const loanAmountInRcn: BN = Utils.bn(loanAmount)
        .mul(Utils.bn(loanRate))
        .div(Utils.pow(10, loan.currency.decimals));

    const collateralOracle: string = await this.contractsService.symbolToOracle(currency.symbol);
    const collateralDecimals: number = new Currency(currency.symbol).decimals;
    const collateralRate: BN | string = await this.contractsService.getRate(collateralOracle, collateralDecimals);
    const collateralAmountInRcn: BN = Utils.bn(collateralRate)
        .mul(Utils.bn(amount))
        .div(Utils.pow(10, 18));

    const collateralPercentage: BN = Utils.bn(collateralAmountInRcn)
        .mul(Utils.bn(100))
        .div(Utils.bn(loanAmountInRcn));

    const collateralRatio: string = Utils.formatAmount(collateralPercentage);

    return collateralRatio;
  }

  /**
   * Calculate collateral liquidation price
   * @param loanId Loan ID
   * @param collateralRate Collateral rate
   * @param liquidationRatio Liquidation ratio
   * @param loanAmountInRcn Loan amount in rcn
   * @return Liquidation price in collateral amount
   */
  async calculateLiquidationPrice(
    loanId: string,
    collateralRate,
    liquidationRatio,
    loanAmountInRcn
  ) {
    collateralRate = Utils.bn(collateralRate);
    liquidationRatio = Utils.bn(liquidationRatio);

    let amountInRcn: BN | string;

    try {
      const debt = await this.contractsService.getClosingObligation(loanId);
      amountInRcn = Utils.bn(debt || 0);
    } catch (e) {
      amountInRcn = Utils.bn(loanAmountInRcn);
    }

    try {
      let liquidationPrice = Utils.bn(liquidationRatio).mul(amountInRcn).div(Utils.bn(100));
      liquidationPrice = liquidationPrice.div(collateralRate);

      return liquidationPrice;
    } catch (e) {
      return null;
    }
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
