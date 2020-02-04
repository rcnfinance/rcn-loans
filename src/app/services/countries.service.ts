import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable()
export class CountriesService {
  country: Promise<string>;

  constructor(
    private http: HttpClient
  ) {
    this.country = this.buildCountry();
  }

  buildCountry(): Promise<string> {
    return new Promise((resolve) => {
      this.http.get(environment.apiCountry)
          .subscribe((response: any) => {
            resolve(response.country);
          }, () => {
            resolve();
          });
    });
  }

  async lendEnabled(): Promise<Boolean> {
    const country = await this.country;
    return country && country.toUpperCase() !== 'US';
  }
}
