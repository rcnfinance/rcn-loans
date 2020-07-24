import { Component, OnInit } from '@angular/core';
interface Faq {
  id: number;
  question: string;
  answer: string;
}
interface FaqGroup {
  title: string;
  faqs: Faq[];
}

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
  faqs: Faq[];
  faqGroups: FaqGroup[];
  panelOpenState: {[id: number]: boolean} = {};

  constructor() { }

  ngOnInit() {
  }

}
