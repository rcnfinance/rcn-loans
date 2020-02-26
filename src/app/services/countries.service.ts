import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable()
export class CountriesService {
  country: Promise<string>;
  lockedCountries: string[];

  constructor(
    private http: HttpClient
  ) {
    this.country = this.buildCountry();
    this.lockedCountries = ['IR', 'KP', 'BS', 'BW', 'KH', 'GH', 'IS', 'MN', 'PK', 'PA', 'SY', 'TT', 'YE', 'ZW', 'US'];
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
    const lockedCountries = this.lockedCountries;

    return country && !lockedCountries.includes(country.toUpperCase());
  }
}
