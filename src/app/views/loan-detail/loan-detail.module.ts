import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
// App Modules
import { SharedModule } from '../../shared/shared.module';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { CosignerService } from './../../services/cosigner.service';
import { CommitsService } from './../../services/commits.service';
// App Component
import { LoanDetailComponent } from './loan-detail.component';
import { DetailTableComponent } from './detail-table/detail-table.component';
import { DetailIdentityComponent } from './detail-identity/detail-identity.component';
import { DetailCosignerComponent } from './detail-cosigner/detail-cosigner.component';
import { GobackButtonComponent } from '../../shared/goback-button/goback-button.component';
import { DecentralandMapComponent } from './detail-cosigner/decentraland-cosigner/decentraland-map/decentraland-map.component';
import { DecentralandCosignerComponent } from './detail-cosigner/decentraland-cosigner/decentraland-cosigner.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { TransferButtonComponent } from './../../shared/transfer-button/transfer-button.component';
import { DialogLoanPayComponent } from '../../dialogs/dialog-loan-pay/dialog-loan-pay.component';
import { DialogLoanTransferComponent } from './../../dialogs/dialog-loan-transfer/dialog-loan-transfer.component';
import { DialogInsufficientfundsComponent } from './../../dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
import { ItemFeatureComponent } from './item-feature/item-feature.component';

const routes: Routes = [
  { path: '', component: LoanDetailComponent }
];

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ContractsService,
    CosignerService,
    CommitsService
  ],
  declarations: [
    LoanDetailComponent,
    DetailTableComponent,
    DetailIdentityComponent,
    DetailCosignerComponent,
    DecentralandMapComponent,
    DecentralandCosignerComponent,
    TransactionHistoryComponent,
    GobackButtonComponent,
    TransferButtonComponent,
    DialogLoanTransferComponent,
    DialogLoanPayComponent,
    ItemFeatureComponent
  ],
  entryComponents: [
    DialogLoanTransferComponent,
    DialogInsufficientfundsComponent,
    DialogLoanPayComponent
  ],
  exports: [
    DialogLoanPayComponent
  ]
})
export class LoanDetailModule { }
