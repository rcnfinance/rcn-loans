import { Component, OnInit, HostBinding } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  winHeight: any = window.innerHeight - 121;
  events: string[] = [];
  opened: boolean;

  @HostBinding('class.is-open')
  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }

  constructor() {}
  ngOnInit() {}

}
