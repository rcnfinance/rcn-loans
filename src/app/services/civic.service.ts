import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Web3Service } from './web3.service';

declare let civic: any;

@Injectable()
export class CivicService {
  private civicSip = new civic.sip({ appId: 'r1cCFTGxm' });
  constructor(
    private web3Service: Web3Service,
    private http: HttpClient
  ) { }

  signupCivic(): Promise<string> {
    return new Promise((resolve) => {
      this.civicSip.signup({ scopeRequest: this.civicSip.ScopeRequests.BASIC_SIGNUP });
      this.civicSip.on('auth-code-received', function (event) {
        const jwtToken = event.response;
        resolve(jwtToken);
      });
      this.civicSip.on('user-cancelled', function () {
        resolve(undefined);
      });
       // Error events.
      this.civicSip.on('civic-sip-error', function (error) {
          // handle error display if necessary.
        console.error('   Error type = ' + error.type);
        console.error('   Error message = ' + error.message);
        resolve(undefined);
      });
    }) as Promise<string>;
  }

  register(identity: string, signature: string): Promise<boolean> {
    return new Promise((resolve) => {
      const body = {
        'identity': identity,
        'signature': signature
      };

      this.http.post(environment.identity + 'register/', body).subscribe((_response: any) => {
        resolve(true);
      });
    }) as Promise<boolean>;
  }

  status(): Promise<boolean> {
    return new Promise((resolve) => {
      this.web3Service.getAccount().then((account) => {
        this.http.get(environment.identity + 'validate/' + account.toLowerCase()).subscribe((response: any) => {
          resolve(response.i_type !== '');
        });
      });
    });
  }
}
