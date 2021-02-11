import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { MyAccountComponent } from './my-account.component';
import { BalanceComponent } from './balance/balance.component';

const routes: Routes = [
  { path: '', component: MyAccountComponent }
];

@NgModule({
  declarations: [MyAccountComponent, BalanceComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class MyAccountModule { }
