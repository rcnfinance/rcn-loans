import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
// App Models
import { Loan } from './../../models/loan.model';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
// App Services
import { Utils } from './../../utils/utils';
import { TxService, Tx } from './../../tx.service';
import { ContractsService } from './../../services/contracts.service';
import { BrandingService } from './../../services/branding.service';
import { CivicService } from '../../services/civic.service';
import { Web3Service } from '../../services/web3.service';
import { AvailableLoansService } from '../../services/available-loans.service';

@Component({
  selector: 'app-open-loans',
  templateUrl: './open-loans.component.html',
  styleUrls: ['./open-loans.component.scss']
})
export class OpenLoansComponent implements OnInit{
  public loading: boolean;
  available: any;
  loans = [];
  availableLoans = true;
  pendingLend = [];


  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private brandingService: BrandingService,
    private spinner: NgxSpinnerService,
    private civicService: CivicService,
    private web3Service: Web3Service,
    private availableLoansService: AvailableLoansService,
  ) {}

  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }

  // Available Loans service
  upgradeAvaiblable(){
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;
      this.upgradeAvaiblable();
      this.spinner.hide();
      if (this.loans.length === 0) {
        this.availableLoans = false;
      }
    });
  }

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.loadLoans();

    // Available Loans service
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }
}
