// Angular Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

// App Component
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material/material.module';
import { HeaderComponent } from './header/header.component';
import { CardsComponent } from './cards/cards.component';
import { CardListComponent } from './cards/card-list/card-list.component';
import { CardItemComponent } from './cards/card-list/card-item/card-item.component';
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';

// App Services
import { CardsService } from './cards/cards.service';
import { DataStorageService } from './shared/data-storage.service';
import { ContractsService } from './contracts.service';

// App Directives
import { FadeToggleDirective } from './directives/fade-toggle.directive';
import { WindowsHeightDirective } from './directives/windows-height.directive';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CardsComponent,
    CardListComponent,
    CardItemComponent,
    FadeToggleDirective,
    ContentWrapperComponent,
    WindowsHeightDirective
  ],
  imports: [
    BrowserModule,
    SharedModule,
    MaterialModule,
    HttpModule
  ],
  exports: [
    CardListComponent
  ],
  providers: [CardsService, DataStorageService, ContractsService],
  bootstrap: [AppComponent]
})
export class AppModule { }

