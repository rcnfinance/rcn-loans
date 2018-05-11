import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss']
})
export class FavoriteButtonComponent implements OnInit {
  handleFavorite() {
    console.log('You have clicked Favorite Button!');
  }
  constructor() { }

  ngOnInit() {
  }

}
