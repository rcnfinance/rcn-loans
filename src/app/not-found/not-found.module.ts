import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Module
import { NotFoundRoutingModule } from './not-found-routing.module';
// App Component
import { NotFoundComponent } from './not-found.component';

@NgModule({
  imports: [
    CommonModule,
    NotFoundRoutingModule
  ],
  declarations: [NotFoundComponent]
})
export class NotFoundModule { }
