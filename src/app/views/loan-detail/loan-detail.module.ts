import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ContractsService } from './../../services/contracts.service';
import { CosignerService } from './../../services/cosigner.service';
import { CommitsService } from './../../services/commits.service';
import { PreviousRouteService } from './../../services/previousRoute.service';
// App Modules
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material/material.module';
import { LoanDetailRoutingModule } from './loan-detail-routing.module';
// App Component
import { LoanDetailComponent } from './loan-detail.component';
import { DetailTableComponent } from './detail-table/detail-table.component';
import { DetailInstallmentsComponent } from './detail-installments/detail-installments.component';
import { DetailCollateralComponent } from './detail-collateral/detail-collateral.component';
import { DetailIdentityComponent } from './detail-identity/detail-identity.component';
import { DetailCosignerComponent } from './detail-cosigner/detail-cosigner.component';
import { GobackButtonComponent } from '../../shared/goback-button/goback-button.component';

import { DecentralandMapComponent } from './detail-cosigner/decentraland-cosigner/decentraland-map/decentraland-map.component';
import { DecentralandCosignerComponent } from './detail-cosigner/decentraland-cosigner/decentraland-cosigner.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { TransferButtonComponent } from './../../shared/transfer-button/transfer-button.component';
import { TransferFormComponent } from './../../shared/transfer-form/transfer-form.component';

import { DialogLoanPayComponent } from '../../dialogs/dialog-loan-pay/dialog-loan-pay.component';
import { DialogLoanTransferComponent } from './../../dialogs/dialog-loan-transfer/dialog-loan-transfer.component';
import { DialogInsufficientfundsComponent } from './../../dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    SharedModule,
    LoanDetailRoutingModule,
    MaterialModule
  ],
  providers: [
    ContractsService,
    CosignerService,
    NgxSpinnerService,
    CommitsService,
    PreviousRouteService
  ],
  declarations: [
    LoanDetailComponent,
    DetailTableComponent,
    DetailInstallmentsComponent,
    DetailCollateralComponent,
    DetailIdentityComponent,
    DetailCosignerComponent,
    DecentralandMapComponent,
    DecentralandCosignerComponent,
    TransactionHistoryComponent,
    GobackButtonComponent,
    TransferButtonComponent,
    TransferFormComponent,

    DialogLoanTransferComponent,
    DialogLoanPayComponent
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
