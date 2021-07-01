import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navrail-skeleton',
  templateUrl: './navrail-skeleton.component.html',
  styleUrls: ['./navrail-skeleton.component.scss']
})
export class NavrailSkeletonComponent implements OnInit {

  visible = true;

  constructor() {
    if (window.location.pathname === '/') this.visible = false;
  }

  ngOnInit() {
  }

}
