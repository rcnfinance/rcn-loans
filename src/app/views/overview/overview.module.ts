import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Modules
// App Services
// App Component
import { OverviewComponent } from './overview.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OverviewComponent
  ],
  providers: [],
  exports: [
    OverviewComponent
  ]
})
export class OverviewModule { }
