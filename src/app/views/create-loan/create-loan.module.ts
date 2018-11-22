import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// App Services
import { NgCircleProgressModule } from 'ng-circle-progress';
// App Modules
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from '../../material/material.module';
import { CreateLoanRoutingModule } from './create-loan-routing/create-loan-routing.module';
// App Component
import { CreateLoanComponent } from './create-loan.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule,
    MaterialModule,
    SharedModule,
    CreateLoanRoutingModule,
    NgCircleProgressModule.forRoot({
      'radius': 10,
      'space': -5,
      'responsive': false,
      'outerStrokeLinecap': 'square',
      'outerStrokeWidth': 5,
      'outerStrokeColor': '#4155ff',
      'innerStrokeColor': '#ffffff',
      'innerStrokeWidth': -5,
      'animationDuration': 600,
      'showBackground': false,
      'clockwise': false,
      'startFromZero': true,
      'showTitle': true,
      'titleColor': '#ffffff',
      'animateTitle': false,
      'titleFontSize': '32',
      'showUnits': true,
      'unitsColor': '#ffffff',
      'unitsFontSize': '32',
      'showSubtitle': false,
      'subtitleFontSize': '32'
    })
  ],
  declarations: [
    CreateLoanComponent
  ]
})
export class CreateLoanModule { }
