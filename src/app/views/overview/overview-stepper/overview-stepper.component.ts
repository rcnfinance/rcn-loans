import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
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
    private previousRouteService: PreviousRouteService,
    public breakpointObserver: BreakpointObserver
  ) { }

  get isDesktop() {
    return this.breakpointObserver.isMatched('(min-width: 992px)');
  }

  handleGoback() {
    this.previousRouteService.redirectHandler();
  }

  ngOnInit() {
    this.stepper.selectedIndex = 1;
  }

}
