import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import {BehaviorSubject} from 'rxjs';
// App Component
// App Service
import { Web3Service, Type } from '../services/web3.service';
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
  account: string;

  // Toggle Sidebar Service
  callSidebarService() {
    this.sidebarService.isOpen$.next(
      !this.sidebarService.isOpen$.value
    )
  }
  // Toggle Sidebar Class
  onClose(){
    this.navToggle = false;
  }
  onOpen(){
    this.navToggle = true;
  }

  constructor(
    private sidebarService: SidebarService,
    private router: Router,
    private web3Service: Web3Service,
  ) {}

  ngOnInit(): void {
    this.navToggle = this.sidebarService.navToggle;
    this.isOpen$ = this.sidebarService.isOpen$;
    
    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
  }

}
