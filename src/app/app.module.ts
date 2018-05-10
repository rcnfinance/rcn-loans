// Angular Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { Router } from '@angular/router';

// App Component
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material/material.module';
import { HeaderComponent } from './header/header.component';
import { LoanDetailComponent } from './views/loan-detail/loan-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { LendButtonComponent } from './shared/lend-button/lend-button.component';
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';

// App Services
// import { from './shared/data-storage.service';
import { ContractsService } from './services/contracts.service';
import { TxService } from './tx.service';

// App Directives
import { FadeToggleDirective } from './directives/fade-toggle.directive';
import { WindowsHeightDirective } from './directives/windows-height.directive';
import { OpenLoansComponent } from './views/open-loans/open-loans.component';

const appRoutes: Routes = [
  { path: 'open', component: OpenLoansComponent },
  { path: 'loan/:id', component: LoanDetailComponent },
  { path: '',
    redirectTo: '/open',
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
    LendButtonComponent,
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

