import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
// App Modules
import { SharedModule } from '../../shared/shared.module';
// App Services
import { ContractsService } from '../../services/contracts.service';
// App Component
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  imports: [
    CommonModule,
    VirtualScrollerModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    DashboardComponent
  ],
  providers: [
    ContractsService
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
