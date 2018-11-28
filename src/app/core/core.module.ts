import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// App Modules
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
// App Component
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BalanceComponent } from './balance/balance.component';

import { SocialContainerComponent } from './social-container/social-container.component'; // TODO move to CORE Module
// App Services
import { Web3Service } from '../services/web3.service';
import { SidebarService } from '../services/sidebar.service';
import { TitleService } from '../services/title.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    RouterModule
  ],
  declarations: [
    ContentWrapperComponent,
    HeaderComponent,
    FooterComponent,
    BalanceComponent,
    SocialContainerComponent
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
