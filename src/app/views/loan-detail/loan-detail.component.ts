import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { CosignerService } from './../../services/cosigner.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';
// App Utils
import { Utils } from './../../utils/utils';
import { Route } from '@angular/compiler/src/core';
import { CosignerOption } from '../../models/cosigner.model';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Loan;
  viewDetail: string;
  cosigner: CosignerOption;

  constructor(
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    private cosignerService: CosignerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        this.cosigner = this.cosignerOptions[0];
        console.log(this.loan);
      });
      // In a real app: dispatch action to load the details here.
   });
  }
  onCosignerSelected(cosigner: CosignerOption) {
    this.cosigner = cosigner;
    console.log('Selected cosigner', this.cosigner);
  }
  goHome() {
    this.router.navigate(['/loans']);
  }
  openDetail(view: string) {
    this.viewDetail = view;
  }
  get getCosinger(): CosignerOption {
    console.log('Get cosigner!')
    if (this.cosigner !== undefined) {
      return this.cosigner;
    } else {
      return this.cosignerOptions[0];
    }
  }
  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }
  get cosignerOptions(): CosignerOption[] {
    return this.cosignerService.getCosignerOptions(this.loan);
  }
  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
}