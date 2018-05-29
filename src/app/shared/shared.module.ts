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
import { PayButtonComponent } from './pay-button/pay-button.component';
import { ForgiveButtonComponent } from './forgive-button/forgive-button.component';
import { CloseButtonComponent } from './close-button/close-button.component';
import { CreatorContainerComponent } from './creator-container/creator-container.component';
import { AvatarComponent } from './avatar/avatar.component';
import { LoanAvatarComponent } from './loan-avatar/loan-avatar.component';
import { CosignerSelectorComponent } from './cosigner-selector/cosigner-selector.component';
import { ConversionGraphicComponent } from './conversion-graphic/conversion-graphic.component';
import { HeaderListComponent } from './conversion-graphic/header-list/header-list.component';
import { BodyListComponent } from './conversion-graphic/body-list/body-list.component';
import { AvatarTitleComponent } from './avatar-title/avatar-title.component';
import { IconAvatarComponent } from './avatar-title/icon-avatar/icon-avatar.component';
import { ButtonGroupComponent } from './button-group/button-group.component';
import { GobackButtonComponent } from './goback-button/goback-button.component';
import { WithdrawButtonComponent } from './withdraw-button/withdraw-button.component';

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
    PayButtonComponent,
    ForgiveButtonComponent,
    CloseButtonComponent,
    CreatorContainerComponent,
    AvatarComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    ConversionGraphicComponent,
    HeaderListComponent,
    BodyListComponent,
    AvatarTitleComponent,
    IconAvatarComponent,
    ButtonGroupComponent,
    GobackButtonComponent,
    WithdrawButtonComponent,
  ],
  exports: [
    LendButtonComponent,
    DetailButtonComponent,
    FavoriteButtonComponent,
    MainButtonComponent,
    PayButtonComponent,
    ForgiveButtonComponent,
    CloseButtonComponent,
    CreatorContainerComponent,
    AvatarComponent,
    LoanAvatarComponent,
    CosignerSelectorComponent,
    BlockiesModule,
    ConversionGraphicComponent,
    HeaderListComponent,
    BodyListComponent,
    AvatarTitleComponent,
    IconAvatarComponent,
    ButtonGroupComponent,
    GobackButtonComponent,
    WithdrawButtonComponent,
  ]
})
export class SharedModule { }



