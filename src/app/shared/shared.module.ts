// Angular Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockiesModule } from 'angular-blockies';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// App Modules
import { MaterialModule } from '../material/material.module';
// App Component
import { LoanCardComponent } from './loan-card/loan-card.component';
import { CreatorContainerComponent } from './creator-container/creator-container.component';
import { AvatarTitleComponent } from './avatar-title/avatar-title.component';
import { AvatarComponent } from './avatar/avatar.component';
import { IconAvatarComponent } from './avatar-title/icon-avatar/icon-avatar.component';
import { LoanAvatarComponent } from './loan-avatar/loan-avatar.component';
import { CosignerSelectorComponent } from './cosigner-selector/cosigner-selector.component';

import { ConversionGraphicComponent } from './conversion-graphic/conversion-graphic.component';
import { HeaderListComponent } from './conversion-graphic/header-list/header-list.component';
import { BodyListComponent } from './conversion-graphic/body-list/body-list.component';
// App Buttons
import { LendButtonComponent } from './lend-button/lend-button.component';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { PayButtonComponent } from './pay-button/pay-button.component';
import { CloseButtonComponent } from './close-button/close-button.component';
import { ClaimButtonComponent } from './claim-button/claim-button.component';
import { ButtonGroupComponent } from './button-group/button-group.component';

import { RiskIndicatorComponent } from './risk-indicator/risk-indicator.component';
import { CivicAuthComponent } from './civic-auth/civic-auth.component';
import { PayFormComponent } from './pay-form/pay-form.component';
// App Dialogs
import { DialogInsufficientFoundsComponent } from '../dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogGenericErrorComponent } from '../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
// App Services
import { DecentralandCosignerProvider } from './../providers/cosigners/decentraland-cosigner-provider';
import { ContractsService } from './../services/contracts.service';
import { TxService } from './../tx.service';
import { BrandingService } from './../services/branding.service';
import { CosignerService } from './../services/cosigner.service';
import { Web3Service } from './../services/web3.service';
import { IdentityService } from './../services/identity.service';
import { RiskService } from './../services/risk.service';
import { CivicService } from './../services/civic.service';
import { SidebarService } from './../services/sidebar.service';
import { TitleService } from './../services/title.service';
import { AvailableLoansService } from './../services/available-loans.service';
import { CountriesService } from './../services/countries.service';
import { EventsService } from './../services/events.service';
import { FiltersFormComponent } from './filters-form/filters-form.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    BlockiesModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    LoanCardComponent,
    CreatorContainerComponent,
    AvatarComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    ConversionGraphicComponent,
    HeaderListComponent,
    BodyListComponent,
    AvatarTitleComponent,
    IconAvatarComponent,
    LendButtonComponent,
    DetailButtonComponent,
    PayButtonComponent,
    CloseButtonComponent,
    ClaimButtonComponent,
    ButtonGroupComponent,
    RiskIndicatorComponent,
    CivicAuthComponent,
    PayFormComponent,

    DialogInsufficientFoundsComponent,
    DialogApproveContractComponent,
    DialogClientAccountComponent,
    DialogGenericErrorComponent,
    FiltersFormComponent
  ],
  entryComponents: [
    CivicAuthComponent,
    DialogInsufficientFoundsComponent,
    DialogApproveContractComponent,
    DialogClientAccountComponent,
    DialogGenericErrorComponent
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
    CivicService,
    SidebarService,
    TitleService,
    AvailableLoansService,
    CountriesService,
    EventsService
  ],
  exports: [
    LoanCardComponent,

    CreatorContainerComponent,
    AvatarComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    ConversionGraphicComponent,
    HeaderListComponent,
    BodyListComponent,
    AvatarTitleComponent,
    IconAvatarComponent,
    LendButtonComponent,
    DetailButtonComponent,
    PayButtonComponent,
    CloseButtonComponent,
    ClaimButtonComponent,
    ButtonGroupComponent,
    RiskIndicatorComponent,
    CivicAuthComponent,
    PayFormComponent,
    FiltersFormComponent
  ]
})
export class SharedModule { }
