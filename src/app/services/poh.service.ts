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
   * Get PoH registration URI using an address
   * @param address Address
   */
  getRegistrationUri(uri: string) {
    const { host: apiBase } = environment.api.poh;
    return this.http.get<{fileURI: string; name: string}>(apiBase.concat(uri));
  }

  /**
   * Get PoH file URI using an registration URI
   * @param registrationUri Registration URI
   */
  getFileUri(registrationUri: string) {
    const { host: apiBase } = environment.api.poh;
    return this.http.get<PohProfile>(apiBase.concat(registrationUri));
  }

  /**
   * Check if the user has PoH
   * @param address Address
   * @return Boolean
   */
  async checkIfHasPoh(address: string): Promise<boolean> {
    try {
      await this.apiService.getAddressPoh(address).toPromise();
      return true;
    } catch {
      return false;
    }
  }
}
