import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Module
import { SharedModule } from './../../shared/shared.module';
import { NotFoundRoutingModule } from './not-found-routing.module';
// App Component
import { NotFoundComponent } from './not-found.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NotFoundRoutingModule
  ],
  declarations: [NotFoundComponent]
})
export class NotFoundModule { }
