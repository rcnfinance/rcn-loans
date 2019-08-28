import { Injectable } from '@angular/core';
// import { Loan, Oracle, Network } from '../models/loan.model';
import { ContractsService } from './contracts.service';
import { Web3Service } from './web3.service';

@Injectable()
export class CollateralService {

  constructor(
    private web3Service: Web3Service,
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
    const web3: any = this.web3Service.web3;
    const collateralInRcn = new web3.BigNumber(collateralRate).mul(collateralAmount);
    const loanInRcn = new web3.BigNumber(loanAmount);

    try {
      const collateralRatio = collateralInRcn.mul(100).div(loanInRcn);
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
    const web3: any = this.web3Service.web3;
    collateralRate = new web3.BigNumber(collateralRate);
    liquidationRatio = new web3.BigNumber(liquidationRatio);

    let amountInRcn: number;

    try {
      const debt = await this.contractsService.getClosingObligation(loanId);
      amountInRcn = new web3.BigNumber(debt || 0);
    } catch (e) {
      amountInRcn = new web3.BigNumber(loanAmountInRcn);
    }

    try {
      let liquidationPrice = new web3.BigNumber(liquidationRatio).mul(amountInRcn).div(100);
      liquidationPrice = liquidationPrice.div(collateralRate);

      return liquidationPrice;
    } catch (e) {
      return null;
    }
  }

}
