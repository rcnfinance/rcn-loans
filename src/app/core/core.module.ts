import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// App Modules
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
// App Component
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BalanceComponent } from './balance/balance.component';
import { SocialContainerComponent } from './social-container/social-container.component';
// App Directives
import { ClickOutsideDirective } from '../directives/click-outside.directive';
// App Services
import { Web3Service } from '../services/web3.service';
import { SidebarService } from '../services/sidebar.service';
import { TitleService } from '../services/title.service';
import { IconGroupHeaderComponent } from './header/icon-group-header/icon-group-header.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    SharedModule,
    MaterialModule,
    RouterModule
  ],
  declarations: [
    ContentWrapperComponent,
    HeaderComponent,
    FooterComponent,
    BalanceComponent,
    SocialContainerComponent,
    IconGroupHeaderComponent,
    ClickOutsideDirective
  ],
  providers: [
    Web3Service,
    SidebarService,
    TitleService
  ],
  exports: [
    ContentWrapperComponent,
    HeaderComponent,
    FooterComponent,
    BalanceComponent,
    SocialContainerComponent
  ]
})
export class CoreModule { }
