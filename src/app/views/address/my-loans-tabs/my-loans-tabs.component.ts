import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-my-loans-tabs',
  templateUrl: './my-loans-tabs.component.html',
  styleUrls: ['./my-loans-tabs.component.scss']
})
export class MyLoansTabsComponent {

  constructor(
    private location: Location
  ) { }

  get activeTab() {
    const path = this.location.path();
    if (path.includes('borrowed')) return 'borrowed';
    if (path.includes('lent')) return 'lent';
  }

}
