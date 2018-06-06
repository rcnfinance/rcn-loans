import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  winHeight: any = window.innerHeight - 121;
  events: string[] = [];
  opened: boolean;
  
  constructor() {}
  ngOnInit() {
    console.log(this.winHeight);
    console.log(this.events);
  }

}
