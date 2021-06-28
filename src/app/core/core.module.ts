import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// App Modules
import { SharedModule } from '../shared/shared.module';
// App Component
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';
import { HeaderComponent } from './header/header.component';
import { NavrailComponent } from './navrail/navrail.component';
import { OnboardingTooltipComponent } from './onboarding-tooltip/onboarding-tooltip.component';
import { IconGroupHeaderComponent } from './header/icon-group-header/icon-group-header.component';
import { NotificationsComponent } from './header/notifications/notifications.component';
import { NotificationItemComponent } from './header/notifications/notification-item/notification-item.component';
import { WalletWithdrawComponent } from './header/wallet-withdraw/wallet-withdraw.component';
import { WalletSettingsComponent } from './header/wallet-settings/wallet-settings.component';
import { NotificationWalletBalancesComponent } from './header/notification-wallet-balances/notification-wallet-balances.component';
// App Directives
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { OracleRatesComponent } from './header/oracle-rates/oracle-rates.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  declarations: [
    ContentWrapperComponent,
    HeaderComponent,
    NavrailComponent,
    IconGroupHeaderComponent,
    ClickOutsideDirective,
    NotificationsComponent,
    NotificationItemComponent,
    WalletWithdrawComponent,
    WalletSettingsComponent,
    NotificationWalletBalancesComponent,
    OracleRatesComponent,
    OnboardingTooltipComponent
  ],
  exports: [
    ContentWrapperComponent,
    HeaderComponent
  ]
})
export class CoreModule { }
