import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material';
import { PreviousRouteService } from '../../../services/previousRoute.service';

@Component({
  selector: 'app-overview-stepper',
  templateUrl: './overview-stepper.component.html',
  styleUrls: ['./overview-stepper.component.scss']
})
export class OverviewStepperComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private previousRouteService: PreviousRouteService
  ) { }

  handleGoback() {
    this.previousRouteService.redirectHandler();
  }

  ngOnInit() {
    this.stepper.selectedIndex = 1;
  }

}
