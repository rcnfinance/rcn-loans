import { Injectable } from '@angular/core';
import * as civic from 'civic-sip-api';

@Injectable()
export class CivicService {
  private civicSip = new civic.sip({ appId: 'r1cCFTGxm' });

  constructor() { }

  signup(): Promise<string> {
    return new Promise((resolve) => {
      this.civicSip.signup({ style: 'popup', scopeRequest: this.civicSip.ScopeRequests.BASIC_SIGNUP });
      this.civicSip.on('auth-code-received', function (event) {
        const jwtToken = event.response;
        resolve(jwtToken);
      });
    }) as Promise<string>;
  }
}
