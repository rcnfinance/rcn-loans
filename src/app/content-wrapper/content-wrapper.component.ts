import { Component, OnInit, Input } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
// App Component
// App Service
import {SidebarService} from '../services/sidebar.service';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  winHeight: any = window.innerHeight;
  events: string[] = [];
  isOpen$: BehaviorSubject<boolean>;
  navToggle: boolean;

  onClose(){
    this.navToggle = false;
  }
  onOpen(){
    this.navToggle = true;
  }

  constructor(
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.navToggle = this.sidebarService.navToggle;
    this.isOpen$ = this.sidebarService.isOpen$;
    console.log(this.sidebarService.navToggle);
    console.log(this.sidebarService.isOpen$);
  }

}
