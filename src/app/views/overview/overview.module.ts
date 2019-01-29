import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Modules
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material/material.module';
// App Services
import { LendingService } from '../../services/lending.service';
// App Component
import { OverviewComponent } from './overview.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule
  ],
  declarations: [
    OverviewComponent
  ],
  providers: [
    LendingService
  ],
  exports: [
    OverviewComponent
  ]
})
export class OverviewModule { }
