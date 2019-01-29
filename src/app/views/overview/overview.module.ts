import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Modules
import { SharedModule } from '../../shared/shared.module';
// App Services
import { LendingService } from '../../services/lending.service';
// App Component
import { OverviewComponent } from './overview.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
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
