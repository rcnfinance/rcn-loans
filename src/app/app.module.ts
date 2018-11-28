import * as Raven from 'raven-js';
// Angular Core
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
// App Modules
import { AppRoutingModule } from './app-routing/app-routing.module';
import { CoreModule } from './core/core.module';
import { RequestedLoanModule } from './views/requested-loan/requested-loan.module';
import { ActiveLoansModule } from './views/active-loans/active-loans.module';
import { AddressModule } from './views/address/address.module';
import { LoanDetailModule } from './views/loan-detail/loan-detail.module';
// App Component
import { AppComponent } from './app.component';

Raven
  .config(environment.sentry, {
    release: environment.version_verbose
  })
  .install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}

@NgModule({
  imports: [
    HttpClientModule,
    AppRoutingModule,

    CoreModule,
    RequestedLoanModule,
    ActiveLoansModule,
    AddressModule,
    LoanDetailModule
  ],
  declarations: [
    AppComponent
  ],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
