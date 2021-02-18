import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// App Modules
import { SharedModule } from '../shared/shared.module';
// App Component
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';
import { HeaderComponent } from './header/header.component';
import { NavrailComponent } from './navrail/navrail.component';
import { BalanceComponent } from './balance/balance.component';
import { IconGroupHeaderComponent } from './header/icon-group-header/icon-group-header.component';
import { NotificationsComponent } from './header/notifications/notifications.component';
import { NotificationItemComponent } from './header/notifications/notification-item/notification-item.component';
import { WalletBalancesComponent } from './header/wallet-balances/wallet-balances.component';
import { WalletAvatarComponent } from './header/wallet-avatar/wallet-avatar.component';
import { WalletWithdrawComponent } from './header/wallet-withdraw/wallet-withdraw.component';
import { WalletSettingsComponent } from './header/wallet-settings/wallet-settings.component';
import { SocialContainerComponent } from './social-container/social-container.component';
// App Directives
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { OpenEtherscanDirective } from '../directives/open-etherscan.directive';

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
    BalanceComponent,
    IconGroupHeaderComponent,
    ClickOutsideDirective,
    OpenEtherscanDirective,
    NotificationsComponent,
    NotificationItemComponent,
    WalletBalancesComponent,
    WalletAvatarComponent,
    WalletWithdrawComponent,
    WalletSettingsComponent,
    SocialContainerComponent
  ],
  exports: [
    ContentWrapperComponent,
    HeaderComponent,
    BalanceComponent,
    SocialContainerComponent
  ]
})
export class CoreModule { }
