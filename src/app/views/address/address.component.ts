import { Component, OnInit } from '@angular/core';
import { HttpModule, Response } from '@angular/http';
import { FormControl } from '@angular/forms';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { BrandingService } from './../../services/branding.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';
// App Utils
import { Utils } from './../../utils/utils';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  address: string;
  loans = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    private txService: TxService,
    private brandingService: BrandingService,
    private spinner: NgxSpinnerService,
  ) {}
  loadLoans() {
    this.contractsService.getLoansOfLender(this.address).then((result: Loan[]) => {
      this.loans = result;
      this.spinner.hide();
    });
  }
  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.route.params.subscribe(params => {
      this.address = params['address'];
      this.loadLoans();
    });
  }
  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
}
