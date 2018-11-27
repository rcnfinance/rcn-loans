import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// App Modules
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
// App Component
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { BalanceComponent } from './balance/balance.component';
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
    // HeaderComponent,
    FooterComponent
  ],
  providers: [
    Web3Service,
    SidebarService,
    TitleService
  ],
  exports: [
    // HeaderComponent,
    FooterComponent,
    BalanceComponent
  ],
})
export class CoreModule { }
