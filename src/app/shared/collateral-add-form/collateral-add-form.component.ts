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
  shortAccount: string;

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
    this.collateralAmount = Utils.formatAmount(web3.fromWei(collateral.amount));
    this.collateralAsset = collateralCurrency.symbol;
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

  onSubmit(form: FormGroup) {
    const amount = form.value.amount;
    this.submitAdd.emit(amount);
  }
}
