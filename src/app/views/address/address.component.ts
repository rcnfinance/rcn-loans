import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {
  pageId = 'address';
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
    private web3Service: Web3Service,
    private eventsService: EventsService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Address');
    this.spinner.show(this.pageId);

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
    this.spinner.hide(this.pageId);

    try {
      this.subscriptionAvailable.unsubscribe();
    } catch (e) { }
  }

  private async loadLoans(address: string) {
    try {
      const loans: Loan[] = await this.contractsService.getLoansOfLender(address);
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
   * Update available loans number
   */
  private upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }
}
