// Angular Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { BlockiesModule } from 'angular-blockies';

// App Component
import { MaterialModule } from '../material/material.module';
import { LendButtonComponent } from './lend-button/lend-button.component';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { MainButtonComponent } from './main-button/main-button.component';
import { CreatorContainerComponent } from './creator-container/creator-container.component';
import { AvatarComponent } from './avatar/avatar.component';
import { LoanAvatarComponent } from './loan-avatar/loan-avatar.component';
import { CosignerSelectorComponent } from './cosigner-selector/cosigner-selector.component';
import { CloseButtonComponent } from './close-button/close-button.component';
import { ConversionGraphicComponent } from './conversion-graphic/conversion-graphic.component';
import { HeaderListComponent } from './conversion-graphic/header-list/header-list.component';
import { BodyListComponent } from './conversion-graphic/body-list/body-list.component';

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
    AvatarComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    CloseButtonComponent,
    ConversionGraphicComponent,
    HeaderListComponent,
    BodyListComponent
  ],
  exports: [
    LendButtonComponent,
    DetailButtonComponent,
    FavoriteButtonComponent,
    MainButtonComponent,
    CreatorContainerComponent,
    AvatarComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    CloseButtonComponent,
    BlockiesModule,
    ConversionGraphicComponent,
    HeaderListComponent,
    BodyListComponent
  ]
})
export class SharedModule { }



