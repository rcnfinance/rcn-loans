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

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Loan;
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
        console.log(this.loan);
      });
      // In a real app: dispatch action to load the details here.
   });
  }
  goHome() {
    this.router.navigate(['/loans']);
  }
  openCosigner() {
    this.router.navigate(['./cosigner'], {relativeTo: this.route});
  }
  openIdentity() {
    this.router.navigate(['./identity'], {relativeTo: this.route});
  }
  componentAdded(event: any) {
    console.log(event);
  }
  cosignerOption(): string {
    let options = this.cosignerService.getCosignerOptions(this.loan)
    if (options.length == 0) {
      return "Not available";
    } else {
      return options[0].name;
    }
  }
  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
}
