import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FaqsComponent } from './faqs.component';

const routes: Routes = [
  { path: '', component: FaqsComponent }
];

@NgModule({
  declarations: [FaqsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class FaqsModule { }
