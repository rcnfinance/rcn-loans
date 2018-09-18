import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
      this.civicSip.signup({scopeRequest: this.civicSip.ScopeRequests.BASIC_SIGNUP });
      this.civicSip.on('auth-code-received', function (event) {
        const jwtToken = event.response;
        resolve(jwtToken);
      });
      this.civicSip.on('user-cancelled', function (event) {
        resolve(undefined);
       });
       // Error events.
       this.civicSip.on('civic-sip-error', function (error) {
          // handle error display if necessary.
          console.log('   Error type = ' + error.type);
          console.log('   Error message = ' + error.message);
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

      this.http.post(environment.identity + 'register/', body).subscribe((response: any) => {
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
