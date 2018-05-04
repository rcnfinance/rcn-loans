// Angular Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// App Component
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material/material.module';
import { HeaderComponent } from './header/header.component';
import { CardsComponent } from './cards/cards.component';
import { CardListComponent } from './cards/card-list/card-list.component';
import { CardItemComponent } from './cards/card-list/card-item/card-item.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CardsComponent,
    CardListComponent,
    CardItemComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    MaterialModule
  ],
  exports: [
    CardListComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

