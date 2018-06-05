import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';

// App Component
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [
    FooterComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
  ],
  exports: [
    FooterComponent,
  ],
  providers: [],
})
export class CoreModule { }
