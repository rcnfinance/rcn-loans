import { Injectable } from '@angular/core';
import * as BN from 'bn.js';
import { ContractsService } from './contracts.service';
import { Tx, Type } from '../services/tx.service';
import { Utils } from './../utils/utils';

@Injectable()
export class CollateralService {

  constructor(
    private contractsService: ContractsService
  ) { }

  /**
   * Calculate the collateral ratio
   * @param loanAmount Loan amount in rcn
   * @param collateralAmount Collateral amount in rcn
   * @param collateralRate Collateral rate
   * @return Collateral ratio
   */
  calculateCollateralRatio(
    loanAmount,
    collateralAmount,
    collateralRate
  ) {
    const collateralInRcn: BN = Utils.bn(collateralRate).mul(Utils.bn(collateralAmount));
    const loanInRcn: BN = Utils.bn(loanAmount);

    try {
      const collateralRatio = collateralInRcn.mul(Utils.bn(100)).div(loanInRcn);
      return collateralRatio;
    } catch (e) {
      return null;
    }
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
