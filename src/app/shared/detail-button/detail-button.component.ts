import { Component, OnInit, Input } from '@angular/core';
import { DeviceService } from '../../services/device.service';
import { Loan } from './../../models/loan.model';

@Component({
  selector: 'app-detail-button',
  templateUrl: './detail-button.component.html',
  styleUrls: ['./detail-button.component.scss']
})
export class DetailButtonComponent implements OnInit {
  @Input() loan: Loan;
  isMobile: boolean;

  constructor(
    private deviceService: DeviceService
  ) { }

  ngOnInit() {
    this.isMobile = this.deviceService.isMobile();
  }
}
