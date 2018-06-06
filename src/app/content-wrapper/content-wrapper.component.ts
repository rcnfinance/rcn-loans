import { Component, OnInit, Input } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {SidebarService} from '../services/sidebar.service';
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
  isOpen$: BehaviorSubject<boolean>;

  constructor(
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.isOpen$ = this.sidebarService.isOpen$;
  }

}
