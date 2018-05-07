import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { HttpModule, Response } from '@angular/http';

// App Services
import { CardsService } from './cards.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  constructor(private cardsService: CardsService) {}

  ngOnInit() {
  }
  onGet() {
    this.cardsService.getCards()
      .subscribe(
        (response: Response) => {
          const data = response.json();
          console.log(data);
          console.log(data.id);
          console.log(data.title);
        },
        (error) => console.log(error)
      );
  }

}
