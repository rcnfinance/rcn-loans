import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-goback-button',
  templateUrl: './goback-button.component.html',
  styleUrls: ['./goback-button.component.scss']
})
export class GobackButtonComponent {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  handleGoback() {
    this.location.back();
  }
}
