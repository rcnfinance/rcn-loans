// Angular Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { ImgFluidComponent } from './img-fluid/img-fluid.component';
// import { LendButtonComponent } from './lend-button/lend-button.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    HttpModule
  ],
  declarations: [ImgFluidComponent],
  exports: [ImgFluidComponent]
})
export class SharedModule { }



