import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan } from './../../../models/loan.model';
// App Services
import { TitleService } from '../../../services/title.service';
import { ContractsService } from './../../../services/contracts.service';
import { AvailableLoansService } from '../../../services/available-loans.service';
import { Web3Service } from '../../../services/web3.service';

@Component({
  selector: 'app-lent-loans',
  templateUrl: './lent-loans.component.html',
  styleUrls: ['./lent-loans.component.scss']
})
export class LentLoansComponent implements OnInit, OnDestroy {

  address: string;
  available: any;
  loans = [];
  availableLoans = true;

  // subscriptions
  subscriptionAvailable: Subscription;

  constructor(
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private titleService: TitleService,
    private contractsService: ContractsService,
    private availableLoansService: AvailableLoansService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Lent loans');
    this.spinner.show();

    this.route.params.subscribe(params => {
      const web3 = this.web3Service.web3;
      this.address = web3.toChecksumAddress(params['address']);
      this.loadLoans(this.address);
    });

    // Available Loans service
    this.subscriptionAvailable = this.availableLoansService.currentAvailable.subscribe(
      available => this.available = available
    );
  }

  ngOnDestroy() {
    try {
      this.subscriptionAvailable.unsubscribe();
    } catch (e) { }
  }

  private async loadLoans(address: string) {
    try {
      const loans: Loan[] = await this.contractsService.getLoansOfLender(address);
      this.loans = loans;

      this.upgradeAvaiblable();
      this.spinner.hide();

      if (this.loans.length) {
        this.availableLoans = true;
      } else {
        this.availableLoans = false;
      }

    } catch (err) {
      this.spinner.hide();
      this.availableLoans = false;
    }
  }

  /**
   * Update available loans number
   */
  private upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }
}
