import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';
// App Utils
import { Utils } from './../../utils/utils';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Loan;
  constructor(
    private route: ActivatedRoute,
    private contractsService: ContractsService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        console.log(this.loan);
      });
      // In a real app: dispatch action to load the details here.
   });
  }
  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
}
