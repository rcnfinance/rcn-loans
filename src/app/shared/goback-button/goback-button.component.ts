import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-goback-button',
  templateUrl: './goback-button.component.html',
  styleUrls: ['./goback-button.component.scss']
})
export class GobackButtonComponent {

  constructor(
    private router: Router,
  ) {}

  handleGoback() {
    this.router.navigate(['/', 'requests']).then(nav => {
      console.log(nav); // true if navigation is successful
    }, err => {
      console.log(err); // when there's an error
    });
  }
}
