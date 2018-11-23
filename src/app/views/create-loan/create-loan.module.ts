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
import { CircleProgressComponent } from './circle-progress/circle-progress.component';

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
      'showBackground': false,
      'clockwise': false,
      'startFromZero': false,
      'renderOnClick': false,
      'animation': true,
      'animateTitle': true,
      'animationDuration': 300,
      'showTitle': true,
      'titleColor': '#ffffff',
      'titleFontSize': '28',
      'showUnits': true,
      'unitsColor': '#ffffff',
      'unitsFontSize': '28',
      'showSubtitle': false,
      'subtitleFontSize': '28'
    })
  ],
  declarations: [
    CreateLoanComponent,
    CircleProgressComponent
  ]
})
export class CreateLoanModule { }
