import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
// App Utils
import { Utils } from './../../utils/utils';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  address: string;
  loans = [];
  availableLoans: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
  ) {}
  loadLoans() {
    this.contractsService.getLoansOfLender(this.address).then((result: Loan[]) => {
      this.loans = result;
      this.spinner.hide();
      if (this.loans.length <= 0) {
        this.availableLoans = false;
      }
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
