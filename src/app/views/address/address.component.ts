import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
import { Web3Service } from '../../services/web3.service';

enum Tab {
  Borrowed = 'borrowed',
  Lended = 'lent'
}

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {

  address: string;
  available: any;
  availableLoans = true;
  tab: Tab;
  loans = [];

  // subscriptions
  subscriptionAvailable: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private titleService: TitleService,
    private contractsService: ContractsService,
    private availableLoansService: AvailableLoansService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const web3 = this.web3Service.web3;
      const {
        address,
        tab
      } = params;

      // TODO: validate address
      this.address = web3.toChecksumAddress(address);
      this.tab = tab;

      switch (tab) {
        case Tab.Borrowed:
          this.titleService.changeTitle('Borrowed loans');
          this.tab = Tab.Borrowed;
          break;

        case Tab.Lended:
          this.titleService.changeTitle('Lent loans');
          this.tab = Tab.Lended;
          break;

        default:
          this.router.navigate(['/404/'], { skipLocationChange: true });
          break;
      }

      this.loadLoans(this.address, this.tab);
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

  /**
   * Load loans
   */
  private async loadLoans(address: string, tab: Tab) {
    this.availableLoans = true;

    try {
      await this.spinner.show();

      const loans: Loan[] = tab === Tab.Borrowed ?
        await this.contractsService.getLoansOfBorrower(address) :
        await this.contractsService.getLoansOfLender(address);

      this.loans = loans;
      this.upgradeAvaiblable();

      if (loans.length) {
        this.availableLoans = true;
      } else {
        this.availableLoans = false;
      }

    } catch (err) {
      this.availableLoans = false;
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Update available loans number
   */
  private upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }
}
