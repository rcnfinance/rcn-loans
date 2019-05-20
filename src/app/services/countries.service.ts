import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CountriesService {
  country: Promise<string>;

  constructor(
    private http: HttpClient
  ) {
    this.country = this.buildCountry();
  }

  buildCountry(): Promise<string> {
    // TODO: Replace with custom API
    return new Promise((resolve) => {
      this.http.get('https://api.ipdata.co/?api-key=3a5c90300b23f1d3880abf05ff24c226db274a4fbfc574e66c280acf'
      , { responseType: 'json' }).subscribe((response: any) => {
        resolve(response.country_code);
      });
    });
  }

  async lendEnabled(): Promise<Boolean> {
    const country = await this.country;
    return country.toUpperCase() !== 'US';
  }
}
