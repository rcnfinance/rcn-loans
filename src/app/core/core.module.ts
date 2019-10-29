import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// App Modules
import { SharedModule } from '../shared/shared.module';
// App Component
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';
import { HeaderComponent } from './header/header.component';
import { BalanceComponent } from './balance/balance.component';
import { IconGroupHeaderComponent } from './header/icon-group-header/icon-group-header.component';
import { NotificationsComponent } from './header/notifications/notifications.component';
import { NotificationItemComponent } from './header/notifications/notification-item/notification-item.component';
import { SocialContainerComponent } from './social-container/social-container.component';
// App Directives
import { ClickOutsideDirective } from '../directives/click-outside.directive';
// App Services
import { Web3Service } from '../services/web3.service';
import { TitleService } from '../services/title.service';
import { NotificationsService } from '../services/notifications.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  declarations: [
    ContentWrapperComponent,
    HeaderComponent,
    BalanceComponent,
    IconGroupHeaderComponent,
    ClickOutsideDirective,
    NotificationsComponent,
    NotificationItemComponent,
    SocialContainerComponent
  ],
  providers: [
    Web3Service,
    TitleService,
    NotificationsService
  ],
  exports: [
    ContentWrapperComponent,
    HeaderComponent,
    BalanceComponent,
    SocialContainerComponent
  ]
})
export class CoreModule { }
