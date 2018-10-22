import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';
import { ContractsService } from './../../services/contracts.service';
import { CosignerService } from './../../services/cosigner.service';
import { CommitsService } from './../../services/commits.service';
import { PreviousRouteService } from './../../services/previousRoute.service';
// App Utils
import { Utils } from './../../utils/utils';
// App Modules
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material/material.module';
import { LoanDetailRoutingModule } from './loan-detail-routing.module';
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

import { DialogLoanTransferComponent } from './../../dialogs/dialog-loan-transfer/dialog-loan-transfer.component';

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
    DetailIdentityComponent,
    DetailCosignerComponent,
    DecentralandMapComponent,
    DecentralandCosignerComponent,
    TransactionHistoryComponent,
    GobackButtonComponent,
    TransferButtonComponent,

    DialogLoanTransferComponent
  ],
  entryComponents: [
    DialogLoanTransferComponent
  ],
  exports: []
})
export class LoanDetailModule { }
