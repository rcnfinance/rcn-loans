import { Component, OnInit } from '@angular/core';
import { PreviousRouteService } from '../../services/previousRoute.service';

@Component({
  selector: 'app-goback-button',
  templateUrl: './goback-button.component.html',
  styleUrls: ['./goback-button.component.scss']
})

export class GobackButtonComponent implements OnInit {
  constructor(
    private previousRouteService: PreviousRouteService
  ) {}

  handleGoback() {
    this.previousRouteService.redirectHandler();
  }

  ngOnInit() {}

}
