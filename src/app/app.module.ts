import { NgModule, Injectable, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import * as Sentry from '@sentry/browser';
import { environment } from '../environments/environment';
// App Modules
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
// App Component
import { AppComponent } from './app.component';

Sentry.init({
  dsn: environment.sentry,
  release: environment.versionVerbose,
  environment: environment.envName
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error: any) {
    // handle chunk-error reloading the page
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    if (chunkFailedMessage.test(error.message)) {
      try {
        window.location.reload();
      } catch { }
      return;
    }

    Sentry.captureException(error.originalError || error);
    console.error(error);
  }
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }],
  bootstrap: [AppComponent]
})
export class AppModule { }
