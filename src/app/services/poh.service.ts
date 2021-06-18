import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { PohProfile } from 'app/interfaces/poh-profile';
import { ApiService } from 'app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PohService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  /**
   * Get PoH profile
   * @param registrationUri Registration URI
   */
  getProfile(address: string) {
    const { hapi: apiBase } = environment.api.poh;
    return this.http.get<PohProfile>(apiBase.concat(`get_data/${address}`));
  }

  /**
   * Check if the user has PoH
   * @param address Address
   * @return Boolean
   */
  async checkIfHasPoh(address: string): Promise<boolean> {
    try {
      const hasPoh = await this.apiService.getAddressPoh(address).toPromise();
      return hasPoh.registered;
    } catch {
      return false;
    }
  }
}
