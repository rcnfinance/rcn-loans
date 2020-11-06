import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-my-loans-tabs',
  templateUrl: './my-loans-tabs.component.html',
  styleUrls: ['./my-loans-tabs.component.scss']
})
export class MyLoansTabsComponent implements OnInit {
  isMobile: boolean;

  constructor(
    private location: Location
  ) { }

  ngOnInit() {
    this.checkIfIsMobile();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(e) {
    this.checkIfIsMobile(e);
  }

  get activeTab() {
    const path = this.location.path();
    if (path.includes('borrowed')) return 'borrowed';
    if (path.includes('lent')) return 'lent';
  }

  private checkIfIsMobile(e?) {
    const MOBILE_WIDTH_PX = 992;
    const currentDeviceWidth = e ? e.target.innerWidth : window.innerWidth;
    this.isMobile = currentDeviceWidth <= MOBILE_WIDTH_PX;
  }
}
