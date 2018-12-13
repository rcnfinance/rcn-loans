import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: Http) {}

  async getRequests(): Promise<any[]> {
    const response = await this.http.get(environment.rcn_node_api.url.concat('requests')).toPromise();
    console.log(response);
    const data = response.json();
    console.log(data);
    return data;
  }
}
