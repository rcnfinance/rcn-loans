import { Component, OnInit } from '@angular/core';
import { HeaderPopoverService } from '../../../services/header-popover.service';

@Component({
  selector: 'app-icon-group-header',
  templateUrl: './icon-group-header.component.html',
  styleUrls: ['./icon-group-header.component.scss']
})

export class IconGroupHeaderComponent implements OnInit {
  viewDetail: string;
  selection: string;
  previousSelection: string;

  notificationsCounter: number;

  constructor(
    public headerPopoverService: HeaderPopoverService
  ) {}

  isDetail(view: string): Boolean { // Check viewDetail state to open/close notifications Component
    return view === this.viewDetail;
  }
  openDetail(selection: 'clickOutside' | 'notifications' | 'balance') { // Change viewDetail state to open/close notifications Component
    this.previousSelection = this.selection;
    this.selection = selection;
    switch (selection) {
      case 'notifications':
      case 'balance':
        if (selection !== this.previousSelection || this.viewDetail === undefined) {
          this.headerPopoverService.changeDetail(selection); // Change value of viewDetail from Notifications Service
        } else {
          this.headerPopoverService.changeDetail(undefined); // Force to close notifications Component by ClickOutside Directive event
        }
        break;
      default:
        this.headerPopoverService.changeDetail(undefined); // Force to close notifications Component by ClickOutside Directive event
        break;
    }
  }

  updateCounter(counter: number) {
    this.notificationsCounter = counter;
  }

  ngOnInit() {
    // Subscribe to detail from Notifications Service
    this.headerPopoverService.currentDetail.subscribe(detail => this.viewDetail = detail);
  }

}
