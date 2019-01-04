import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { RiskService, Level } from '../../services/risk.service';

@Component({
  selector: 'app-risk-indicator',
  templateUrl: './risk-indicator.component.html',
  styleUrls: ['./risk-indicator.component.scss']
})
export class RiskIndicatorComponent implements OnInit {
  @Input() loan: Loan;
  @Input() color = 'gray3';

  icon: string;
  tooltip: string;
  visible: boolean;

  constructor(
    private riskService: RiskService
  ) { }

  ngOnInit() {
    this.riskService.estimateRisk(this.loan).then((risk: Level) => {
      this.visible = risk === Level.high || risk === Level.low;
      this.icon = risk === Level.high ? 'warning' : risk === Level.low ? 'check' : '';
      switch (risk) {
        case Level.high:
          this.icon = 'warning';
          this.tooltip = 'Warning! This may be a high risk loan';
          this.visible = true;
          break;
        case Level.low:
          this.icon = 'check';
          this.tooltip = 'This is a low risk loan';
          this.visible = true;
          break;
        default:
        case Level.normal:
          this.icon = '';
          this.tooltip = '';
          this.visible = false;
          break;
      }
    });
  }
}
