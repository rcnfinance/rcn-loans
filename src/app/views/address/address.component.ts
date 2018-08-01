import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { Utils } from './../../utils/utils';
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  address: string;
  available: any;
  lentLoans = [];
  requestedLoans = [];

  constructor(
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
    private availableLoansService: AvailableLoansService,
  ) {}

  // Available Loans service
  upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.lentLoans.length);
  }

  async loadLoans() {
    const pLoansOfLender = this.contractsService.getLoansOfLender(this.address);
    const pLoansOfBorrower = this.contractsService.getLoansOfBorrower(this.address);
    this.lentLoans = await pLoansOfLender;
    this.requestedLoans = await pLoansOfBorrower;
    this.upgradeAvaiblable();
    this.spinner.hide();
  }

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.route.params.subscribe(params => {
      this.address = params['address'];
      this.loadLoans();
    });

    // Available Loans service
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }
}
