// Angular Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlockiesModule } from 'angular-blockies';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// App Modules
import { MaterialModule } from './../material.module';
// App Component
import { FooterComponent } from './footer/footer.component';
import { LoanCardComponent } from './loan-card/loan-card.component';
import { CreatorContainerComponent } from './creator-container/creator-container.component';
import { AvatarTitleComponent } from './avatar-title/avatar-title.component';
import { AvatarComponent } from './avatar/avatar.component';
import { IconAvatarComponent } from './avatar-title/icon-avatar/icon-avatar.component';
import { LoanAvatarComponent } from './loan-avatar/loan-avatar.component';
import { CosignerSelectorComponent } from './cosigner-selector/cosigner-selector.component';
import { FilterLoansComponent } from './filter-loans/filter-loans.component';
import { InfiniteProgressBarComponent } from './infinite-progress-bar/infinite-progress-bar.component';
import { ConversionGraphicComponent } from './conversion-graphic/conversion-graphic.component';
import { HeaderListComponent } from './conversion-graphic/header-list/header-list.component';
import { BodyListComponent } from './conversion-graphic/body-list/body-list.component';
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
// App Buttons
import { LendButtonComponent } from './lend-button/lend-button.component';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { PayButtonComponent } from './pay-button/pay-button.component';
import { CloseButtonComponent } from './close-button/close-button.component';
import { ClaimButtonComponent } from './claim-button/claim-button.component';
import { ButtonGroupComponent } from './button-group/button-group.component';
import { RiskIndicatorComponent } from './risk-indicator/risk-indicator.component';
import { CurrencyLogoComponent } from './currency-logo/currency-logo.component';
// App Dialogs
import { DialogInsufficientfundsComponent } from '../dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogGenericErrorComponent } from '../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
import { DialogWrongCountryComponent } from '../dialogs/dialog-wrong-country/dialog-wrong-country.component';
import { DialogLoanLendComponent } from '../dialogs/dialog-loan-lend/dialog-loan-lend.component';
// Pipes
import { VisualUrlPipe } from './../pipes/visual-url.pipe';
// App Services
import { DecentralandCosignerProvider } from './../providers/cosigners/decentraland-cosigner-provider';
import { ContractsService } from './../services/contracts.service';
import { TxService } from './../services/tx.service';
import { BrandingService } from './../services/branding.service';
import { CosignerService } from './../services/cosigner.service';
import { Web3Service } from './../services/web3.service';
import { IdentityService } from './../services/identity.service';
import { RiskService } from './../services/risk.service';
import { TitleService } from './../services/title.service';
import { AvailableLoansService } from './../services/available-loans.service';
import { CountriesService } from './../services/countries.service';
import { EventsService } from './../services/events.service';
import { CurrenciesService } from './../services/currencies.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    BlockiesModule,
    FormsModule,
    ReactiveFormsModule,
    BlockiesModule
  ],
  declarations: [
    FooterComponent,
    LoanCardComponent,
    CreatorContainerComponent,
    AvatarComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    ConversionGraphicComponent,
    HeaderListComponent,
    BodyListComponent,
    DialogHeaderComponent,
    AvatarTitleComponent,
    IconAvatarComponent,
    LendButtonComponent,
    DetailButtonComponent,
    PayButtonComponent,
    CloseButtonComponent,
    ClaimButtonComponent,
    ButtonGroupComponent,
    RiskIndicatorComponent,
    FilterLoansComponent,
    InfiniteProgressBarComponent,
    CurrencyLogoComponent,

    DialogInsufficientfundsComponent,
    DialogApproveContractComponent,
    DialogClientAccountComponent,
    DialogGenericErrorComponent,
    DialogWrongCountryComponent,
    DialogLoanLendComponent,

    VisualUrlPipe
  ],
  entryComponents: [
    DialogInsufficientfundsComponent,
    DialogApproveContractComponent,
    DialogClientAccountComponent,
    DialogGenericErrorComponent,
    DialogWrongCountryComponent,
    DialogLoanLendComponent
  ],
  providers: [
    DecentralandCosignerProvider,
    ContractsService,
    TxService,
    BrandingService,
    CosignerService,
    Web3Service,
    IdentityService,
    RiskService,
    TitleService,
    AvailableLoansService,
    CountriesService,
    EventsService,
    CurrenciesService
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FooterComponent,
    LoanCardComponent,
    CreatorContainerComponent,
    AvatarComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    ConversionGraphicComponent,
    HeaderListComponent,
    BodyListComponent,
    DialogHeaderComponent,
    AvatarTitleComponent,
    IconAvatarComponent,
    LendButtonComponent,
    DetailButtonComponent,
    PayButtonComponent,
    CloseButtonComponent,
    ClaimButtonComponent,
    ButtonGroupComponent,
    RiskIndicatorComponent,
    FilterLoansComponent,
    InfiniteProgressBarComponent,
    CurrencyLogoComponent,
    DialogWrongCountryComponent,
    VisualUrlPipe
  ]
})
export class SharedModule { }
