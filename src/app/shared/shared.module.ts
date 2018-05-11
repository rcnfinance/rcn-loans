// Angular Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

// App Component
import { MaterialModule } from '../material/material.module';
import {  } from './header/header.component';
import { LendButtonComponent } from './lend-button/lend-button.component';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { MainButtonComponent } from './main-button/main-button.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    HttpModule,
    MaterialModule
  ],
  declarations: [
    LendButtonComponent,
    DetailButtonComponent,
    FavoriteButtonComponent,
    MainButtonComponent
  ],
  exports: [
    LendButtonComponent,
    DetailButtonComponent,
    FavoriteButtonComponent,
    MainButtonComponent
  ]
})
export class SharedModule { }



