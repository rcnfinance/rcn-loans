import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Utils } from '../../utils/utils';
// App models
import { Loan } from '../../models/loan.model';
import { Collateral } from '../../models/collateral.model';
// App services
import { Web3Service } from '../../services/web3.service';
import { CurrenciesService } from '../../services/currencies.service';

@Component({
  selector: 'app-collateral-add-form',
  templateUrl: './collateral-add-form.component.html',
  styleUrls: ['./collateral-add-form.component.scss']
})
export class CollateralAddFormComponent implements OnInit {
  @Input() loan: Loan;
  @Input() collateral: Collateral;
  @Output() submitAdd = new EventEmitter<number>();

  form: FormGroup;
  collateralAmount: string;
  collateralAsset: string;
  liquidationRatio: number;
  balanceRatio: number;
  shortAccount: string;
  collateralRatio: number;

  estimatedCollateralAmount: string;
  estimatedCollateralRatio: number;

  constructor(
    private web3Service: Web3Service,
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit() {
    this.createFormControls();
    this.getCollateralDetails();
    this.getAccount();
  }

  /**
   * Create form controls and define values
   */
  createFormControls() {
    this.form = new FormGroup({
      amount: new FormControl(null, [
        Validators.required,
        Validators.min(0)
      ])
    });
  }

  /**
   * Get collateral parsed data
   */
  getCollateralDetails() {
    const web3: any = this.web3Service.web3;
    const collateral: Collateral = this.collateral;
    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    const amount = Number(web3.fromWei(collateral.amount));
    this.collateralAmount = Utils.formatAmount(amount);
    this.collateralAsset = collateralCurrency.symbol;
    this.balanceRatio = collateral.balanceRatio / 100;
    this.liquidationRatio = collateral.liquidationRatio / 100;
    this.collateralRatio = this.calculateCollateralRatio(this.form);
  }

  /**
   * Get short account address
   */
  async getAccount() {
    const web3: any = this.web3Service.web3;
    let account = await this.web3Service.getAccount();
    account = web3.toChecksumAddress(account);

    this.shortAccount = Utils.shortAddress(account);
  }

  /**
   * Update collateral values when currency is updated
   */
  onAmountChange() {
    const form: FormGroup = this.form;

    if (!form.valid) {
      this.estimatedCollateralAmount = null;
      return;
    }

    const estimatedAmount = this.calculateAmount(form);
    this.estimatedCollateralAmount = Utils.formatAmount(estimatedAmount);

    const newCollateralRatio = this.calculateCollateralRatio(form);
    this.estimatedCollateralRatio = newCollateralRatio;
  }

  /**
   * Emitted when form is submitted
   * @fires submitAdd
   */
  onSubmit(form: FormGroup) {
    const amount = form.value.amount;
    this.submitAdd.emit(amount);
  }

  /**
   * Calculate the new collateral amount
   * @param form Form group
   * @return Collateral amount
   */
  private calculateAmount(form: FormGroup) {
    const web3: any = this.web3Service.web3;
    const amountToAdd: number = form.value.amount;
    const collateralAmount = new web3.BigNumber(this.collateralAmount);

    try {
      const estimated: number = collateralAmount.add(amountToAdd);
      return estimated;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * Calculate the new collateral ratio
   * @param form Form group
   * @return Collateral ratio
   */
  private calculateCollateralRatio(form: FormGroup) {
    console.info(form);
    // TODO: calculate new collateral ratio
    return null;
  }
}
