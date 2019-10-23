import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import * as Raven from 'raven-js';
import { environment } from '../environments/environment';
// App Modules
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
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
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule
  ],
  declarations: [
    AppComponent
  ],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
