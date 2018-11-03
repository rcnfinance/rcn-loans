import * as Raven from 'raven-js';

// Angular Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
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
import { RequestedLoanModule } from './views/requested-loan/requested-loan.module';

// App Services
import { environment } from '../environments/environment';
import { NgxSpinnerModule } from 'ngx-spinner';
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
import { CountriesService } from './services/countries.service';
import { EventsService } from './services/events.service';

// App Component
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';

import { AddressComponent } from './views/address/address.component';

import { ActiveLoansComponent } from './active-loans/active-loans.component';
import { DialogInsufficientFoundsComponent } from './dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';

import { DialogGenericErrorComponent } from './dialogs/dialog-generic-error/dialog-generic-error.component';

import { ProfileComponent } from './views/profile/profile.component';
import { DialogApproveContractComponent } from './dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from './dialogs/dialog-client-account/dialog-client-account.component';

Raven
  .config(environment.sentry, {
    release: environment.version_verbose
  })
  .install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,

    NgxSpinnerModule,
    MaterialModule,
    SharedModule,
    CoreModule,

    NotFoundModule,
    LoanDetailModule,
    RequestedLoanModule
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    ContentWrapperComponent,
    ProfileComponent,
    AddressComponent,
    ActiveLoansComponent,
    DialogApproveContractComponent,
    DialogClientAccountComponent,
    DialogInsufficientFoundsComponent,
    DialogGenericErrorComponent
  ],
  entryComponents: [
    DialogApproveContractComponent,
    DialogClientAccountComponent,
    DialogInsufficientFoundsComponent,
    DialogGenericErrorComponent,
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
    CountriesService,
    EventsService
  ],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
