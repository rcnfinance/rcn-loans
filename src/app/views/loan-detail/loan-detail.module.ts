import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { CosignerService } from './../../services/cosigner.service';
// App Component
import { LoanDetailRoutingModule } from './loan-detail-routing.module';
import { LoanDetailComponent } from './loan-detail.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';

@NgModule({
  imports: [
    CommonModule,
    LoanDetailRoutingModule,
  ],
  providers: [
    ContractsService,
    CosignerService,
  ],
  declarations: [],
})
export class LoanDetailModule { }
