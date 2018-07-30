// Angular Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// App Modules
import { MaterialModule } from './material/material.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { CoreModule } from './core/core.module';
import { NotFoundModule } from './not-found/not-found.module';
import { LoanDetailModule } from './views/loan-detail/loan-detail.module';

// App Services
import { ContractsService } from './services/contracts.service';
import { TxService } from './tx.service';
import { BrandingService } from './services/branding.service';
import { CosignerService } from './services/cosigner.service';
import { Web3Service } from './services/web3.service';
import { IdentityService } from './services/identity.service';
import { RiskService } from './services/risk.service';
import { CivicService } from './services/civic.service';
import { SidebarService } from './services/sidebar.service';
import { TitleService } from './services/title.service';
import { AvailableLoansService } from './services/available-loans.service';

// App Directives
import { FadeToggleDirective } from './directives/fade-toggle.directive';
import { WindowsHeightDirective } from './directives/windows-height.directive';

// App Component
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';

import { OpenLoansComponent } from './views/open-loans/open-loans.component';

import { AddressComponent } from './views/address/address.component';

import { ActiveLoansComponent } from './active-loans/active-loans.component';
import { DialogInsufficientFoundsComponent } from './dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';

import { DialogLoanTransferComponent } from './dialogs/dialog-loan-transfer/dialog-loan-transfer.component';

import { ProfileComponent } from './views/profile/profile.component';
import { DialogApproveContractComponent } from './dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from './dialogs/dialog-client-account/dialog-client-account.component';

// App Plugins
import { NgxSpinnerModule } from 'ngx-spinner'; 

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FadeToggleDirective,
    WindowsHeightDirective,
    OpenLoansComponent,
    ContentWrapperComponent,
    DialogApproveContractComponent,
    DialogLoanTransferComponent,
    ProfileComponent,
    AddressComponent,
    ActiveLoansComponent,
    DialogClientAccountComponent,
    DialogInsufficientFoundsComponent,
    DialogInsufficientFoundsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    MaterialModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    NgxSpinnerModule,
    NotFoundModule,
    LoanDetailModule,
  ],
  exports: [],
  entryComponents: [
    DialogApproveContractComponent,
    DialogLoanTransferComponent,
    DialogClientAccountComponent,
    DialogInsufficientFoundsComponent,
  ],
  providers: [
    ContractsService,
    TxService,
    BrandingService,
    CosignerService,
    Web3Service,
    IdentityService,
    RiskService,
    CivicService,
    SidebarService,
    TitleService,
    AvailableLoansService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
