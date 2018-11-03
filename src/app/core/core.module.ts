import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// App Component
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    FooterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    RouterModule
  ],
  exports: [
    FooterComponent
  ],
  providers: []
})
export class CoreModule { }
