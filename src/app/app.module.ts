// Angular Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { Router, RouterModule, Routes } from '@angular/router';

// App Services
import { ContractsService } from './services/contracts.service';
import { TxService } from './tx.service';

// App Directives
import { FadeToggleDirective } from './directives/fade-toggle.directive';
import { WindowsHeightDirective } from './directives/windows-height.directive';

// App Component
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material/material.module';
import { HeaderComponent } from './header/header.component';
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';

import { OpenLoansComponent } from './views/open-loans/open-loans.component';
import { LoanDetailComponent } from './views/loan-detail/loan-detail.component';

const appRoutes: Routes = [
  { path: 'loans', component: OpenLoansComponent },
  { path: 'loan/:id', component: LoanDetailComponent },
  { path: '',
    redirectTo: '/loans',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FadeToggleDirective,
    WindowsHeightDirective,
    LoanDetailComponent,
    OpenLoansComponent,
    ContentWrapperComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    MaterialModule,
    HttpModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [ContractsService, TxService],
  bootstrap: [AppComponent]
})
export class AppModule { }

