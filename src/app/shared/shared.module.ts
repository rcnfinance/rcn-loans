// Angular Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlockiesModule } from 'angular-blockies';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
// App Modules
import { MaterialModule } from './../material.module';
// App Component
import { FooterComponent } from './footer/footer.component';
import { CreatorContainerComponent } from './creator-container/creator-container.component';
import { LoanAvatarComponent } from './loan-avatar/loan-avatar.component';
import { FilterLoansComponent } from './filter-loans/filter-loans.component';
import { InfiniteProgressBarComponent } from './infinite-progress-bar/infinite-progress-bar.component';
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
import { BorrowFabButtonComponent } from './borrow-fab-button/borrow-fab-button.component';
import { CollateralFormComponent } from './../dialogs/dialog-collateral/collateral-form/collateral-form.component';
import { CollateralSliderDebtComponent } from './../dialogs/dialog-collateral/collateral-slider-debt/collateral-slider-debt.component';
import { ErrorDetailsComponent } from './error-details/error-details.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { ButtonGroupComponent } from './button-group/button-group.component';
import { CurrencyLogoComponent } from './currency-logo/currency-logo.component';
import { LoanListComponent } from './loan-list/loan-list.component';
import { LoanListHeaderComponent } from './loan-list-header/loan-list-header.component';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { WalletAvatarComponent } from './wallet-avatar/wallet-avatar.component';
import { WalletBalancesComponent } from './wallet-balances/wallet-balances.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { SocialContainerComponent } from './social-container/social-container.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { LoanListSkeletonComponent } from './loan-list-skeleton/loan-list-skeleton.component';
// App Buttons
import { LendButtonComponent } from './lend-button/lend-button.component';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { PayButtonComponent } from './pay-button/pay-button.component';
import { CloseButtonComponent } from './close-button/close-button.component';
import { FixedApplicationAdComponent } from './fixed-application-ad/fixed-application-ad.component';
import { RedeemButtonComponent } from './redeem-button/redeem-button.component';
// App Dialogs
import { DialogInsufficientfundsComponent } from '../dialogs/dialog-insufficient-funds/dialog-insufficient-funds.component';
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogGenericErrorComponent } from '../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
import { DialogWalletSelectComponent } from '../dialogs/dialog-wallet-select/dialog-wallet-select.component';
import { DialogWrongCountryComponent } from '../dialogs/dialog-wrong-country/dialog-wrong-country.component';
import { DialogLoanLendComponent } from '../dialogs/dialog-loan-lend/dialog-loan-lend.component';
import { DialogApiSyncComponent } from '../dialogs/dialog-api-sync/dialog-api-sync.component';
import { DialogFrontRunningComponent } from '../dialogs/dialog-front-running/dialog-front-running.component';
import { DialogCollateralComponent } from '../dialogs/dialog-collateral/dialog-collateral.component';
import { DialogNeedWithdrawComponent } from '../dialogs/dialog-need-withdraw/dialog-need-withdraw.component';
import { DialogPohComponent } from '../dialogs/dialog-poh/dialog-poh.component';
// Pipes
import { VisualUrlPipe } from './../pipes/visual-url.pipe';
import { FormatAmountPipe } from './../pipes/format-amount.pipe';
import { FormatAddressPipe } from './../pipes/format-address.pipe';
// App Services
import { ContractsService } from './../services/contracts.service';
import { BrandingService } from './../services/branding.service';
import { IdentityService } from './../services/identity.service';
import { CountriesService } from './../services/countries.service';
import { CollateralService } from './../services/collateral.service';
import { EventsService } from './../services/events.service';
import { DashboardListComponent } from './dashboard-list/dashboard-list.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { DashboardListItemComponent } from './dashboard-list-item/dashboard-list-item.component';
import { DashboardListSkeletonComponent } from './dashboard-list-skeleton/dashboard-list-skeleton.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    BlockiesModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxSkeletonLoaderModule
  ],
  declarations: [
    FooterComponent,
    CreatorContainerComponent,
    LoanAvatarComponent,
    DialogHeaderComponent,
    ButtonGroupComponent,
    FilterLoansComponent,
    InfiniteProgressBarComponent,
    CurrencyLogoComponent,
    ErrorDetailsComponent,
    BorrowFabButtonComponent,
    CollateralFormComponent,
    CollateralSliderDebtComponent,
    PageHeaderComponent,
    FixedApplicationAdComponent,
    LoanListComponent,
    LoanListHeaderComponent,
    EmptyStateComponent,
    WalletAvatarComponent,
    WalletBalancesComponent,
    ApprovalsComponent,
    SocialContainerComponent,
    LoanListSkeletonComponent,
    SkeletonComponent,

    LendButtonComponent,
    DetailButtonComponent,
    PayButtonComponent,
    CloseButtonComponent,
    RedeemButtonComponent,

    DialogInsufficientfundsComponent,
    DialogApproveContractComponent,
    DialogClientAccountComponent,
    DialogWalletSelectComponent,
    DialogGenericErrorComponent,
    DialogWrongCountryComponent,
    DialogLoanLendComponent,
    DialogApiSyncComponent,
    DialogFrontRunningComponent,
    DialogCollateralComponent,
    DialogNeedWithdrawComponent,
    DialogPohComponent,

    VisualUrlPipe,
    FormatAmountPipe,
    FormatAddressPipe,
    DashboardListComponent,
    ProgressBarComponent,
    DashboardListItemComponent,
    DashboardListSkeletonComponent
  ],
  entryComponents: [
    DialogInsufficientfundsComponent,
    DialogApproveContractComponent,
    DialogClientAccountComponent,
    DialogWalletSelectComponent,
    DialogGenericErrorComponent,
    DialogWrongCountryComponent,
    DialogLoanLendComponent,
    DialogApiSyncComponent,
    DialogFrontRunningComponent,
    DialogCollateralComponent,
    DialogNeedWithdrawComponent,
    DialogPohComponent
  ],
  providers: [
    ContractsService,
    BrandingService,
    IdentityService,
    CountriesService,
    CollateralService,
    EventsService
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FooterComponent,
    CreatorContainerComponent,
    LoanAvatarComponent,
    DialogHeaderComponent,
    LendButtonComponent,
    DetailButtonComponent,
    DashboardListComponent,
    ProgressBarComponent,
    PayButtonComponent,
    CloseButtonComponent,
    RedeemButtonComponent,
    ButtonGroupComponent,
    FilterLoansComponent,
    InfiniteProgressBarComponent,
    CurrencyLogoComponent,
    ErrorDetailsComponent,
    PageHeaderComponent,
    FixedApplicationAdComponent,
    LoanListComponent,
    LoanListHeaderComponent,
    EmptyStateComponent,
    WalletAvatarComponent,
    WalletBalancesComponent,
    ApprovalsComponent,
    SocialContainerComponent,
    DialogWrongCountryComponent,
    BorrowFabButtonComponent,
    CollateralFormComponent,
    CollateralSliderDebtComponent,
    VisualUrlPipe,
    FormatAmountPipe,
    FormatAddressPipe,
    SkeletonComponent,
    LoanListSkeletonComponent
  ]
})
export class SharedModule { }
