import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan } from './../../../models/loan.model';
// App Services
import { TitleService } from '../../../services/title.service';
import { ContractsService } from './../../../services/contracts.service';
import { AvailableLoansService } from '../../../services/available-loans.service';
import { Web3Service } from '../../../services/web3.service';
import { EventsService } from '../../../services/events.service';

@Component({
  selector: 'app-borrowed-loans',
  templateUrl: './borrowed-loans.component.html',
  styleUrls: ['./borrowed-loans.component.scss']
})
export class BorrowedLoansComponent implements OnInit, OnDestroy {
  pageId = 'address';
  address: string;
  shortAddress: string;
  available: any;
  loans = [];
  availableLoans = true;
  myLoans: boolean;
  pageTitle: string;
  pageDescription: string;

  // subscriptions
  subscriptionAvailable: Subscription;
  subscriptionAccount: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private titleService: TitleService,
    private contractsService: ContractsService,
    private availableLoansService: AvailableLoansService,
    private web3Service: Web3Service,
    private eventsService: EventsService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Activity explorer');
    this.spinner.show(this.pageId);
    this.handleLoginEvents();

    this.route.params.subscribe(async params => {
      const web3 = this.web3Service.web3;
      const address: string = web3.utils.toChecksumAddress(params.address);
      if (!web3.utils.isAddress(address)) {
        return this.router.navigate(['/']);
      }

      this.address = address;
      this.loadLoans(this.address);

      await this.checkMyLoans();
      this.setPageTitle();
    });

    // Available Loans service
    this.subscriptionAvailable = this.availableLoansService.currentAvailable.subscribe(
      available => this.available = available
    );
  }

  ngOnDestroy() {
    this.spinner.hide(this.pageId);

    try {
      this.subscriptionAvailable.unsubscribe();
    } catch (e) { }
  }

  /**
   * Sort loans
   * @param sort Order by
   */
  async sortLoans(sort: string) {
    this.spinner.show(this.pageId);
    await this.loadLoans(this.address, sort);
  }

  /**
   * Load address loans
   * @param address Borrower address
   * @param sort Order by
   */
  private async loadLoans(address: string, sort?: string) {
    try {
      const loans: Loan[] = await this.contractsService.getLoansOfBorrower(address, sort);
      this.loans = loans;

      this.upgradeAvaiblable();
      this.spinner.hide(this.pageId);

      if (this.loans.length) {
        this.availableLoans = true;
      } else {
        this.availableLoans = false;
      }

    } catch (err) {
      this.spinner.hide(this.pageId);
      this.availableLoans = false;
      this.eventsService.trackError(err);
    }
  }

  /**
   * Check if the URL address is my address
   * @return Boolean if is my loans
   */
  private async checkMyLoans() {
    const web3: any = this.web3Service.web3;
    const urlAddress = this.address;
    const myAddress = await this.web3Service.getAccount();

    this.myLoans = web3.utils.toChecksumAddress(urlAddress) === web3.utils.toChecksumAddress(myAddress);
    return this.myLoans;
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(
      async () => {
        await this.checkMyLoans();
        this.setPageTitle();
      }
    );
  }

  /**
   * Set page title and description
   * @return Page title and description
   */
  private setPageTitle() {
    const myLoans = this.myLoans;

    if (myLoans) {
      this.pageTitle = 'My Loans';
      this.pageDescription = `Check your loans' status, payments schedule, history and more.`;
    } else {
      this.pageTitle = 'Activity explorer';
      this.pageDescription = `Check ${ this.address }'s active loans`;
    }

    this.titleService.changeTitle(this.pageTitle);

    return {
      title: this.pageTitle,
      description: this.pageDescription
    };
  }

  /**
   * Update available loans number
   */
  private upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }
}
