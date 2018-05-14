// Angular Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { BlockiesModule } from 'angular-blockies';

// App Component
import { MaterialModule } from '../material/material.module';
import {  } from './header/header.component';
import { LendButtonComponent } from './lend-button/lend-button.component';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { MainButtonComponent } from './main-button/main-button.component';
import { CreatorContainerComponent } from './creator-container/creator-container.component';
import { LoanAvatarComponent } from './loan-avatar/loan-avatar.component';
import { CosignerSelectorComponent } from './cosigner-selector/cosigner-selector.component';
import { CloseButtonComponent } from './close-button/close-button.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    HttpModule,
    MaterialModule,
    BlockiesModule
  ],
  declarations: [
    LendButtonComponent,
    DetailButtonComponent,
    FavoriteButtonComponent,
    MainButtonComponent,
    CreatorContainerComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    CloseButtonComponent
  ],
  exports: [
    LendButtonComponent,
    DetailButtonComponent,
    FavoriteButtonComponent,
    MainButtonComponent,
    CreatorContainerComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    CloseButtonComponent
  ]
})
export class SharedModule { }



