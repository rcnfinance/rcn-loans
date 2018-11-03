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
      this.http.get('https://api.ipify.org/', { responseType: 'text' }).subscribe((response: any) => {
        const ip = response;
        this.http.get('https://ipinfo.io/' + ip + '/json').subscribe((resposneIp: any) => {
          const country = resposneIp.country;
          resolve(country);
        });
      });
    });
  }

  async lendEnabled(): Promise<Boolean> {
    const country = await this.country;
    return country.toUpperCase() !== 'US';
  }
}
