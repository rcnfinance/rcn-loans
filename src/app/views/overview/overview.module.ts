import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
// App Modules
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material/material.module';
// App Services
import { LendingService } from '../../services/lending.service';
// App Component
import { OverviewComponent } from './overview.component';
import { OverviewCardComponent } from './overview-card/overview-card.component';
import { OverviewStepperComponent } from './overview-stepper/overview-stepper.component';
import { LoanPropertiesComponent } from './loan-properties/loan-properties.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    LayoutModule
  ],
  declarations: [
    OverviewComponent,
    OverviewCardComponent,
    OverviewStepperComponent,
    LoanPropertiesComponent
  ],
  providers: [
    LendingService
  ],
  exports: [
    OverviewComponent
  ]
})
export class OverviewModule { }
