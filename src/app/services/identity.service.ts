import { Injectable } from '@angular/core';
import { Agent } from 'environments/environment';
import { Loan } from 'app/models/loan.model';
import { Identity } from 'app/models/identity.model';
import { CompanyIdentity } from 'app/models/identity.model';
import { ChainService } from 'app/services/chain.service';

@Injectable()
export class IdentityService {

  companyIdentities = {
    [Agent.RipioArsCreator]: new CompanyIdentity(
      'Ripio',
      '--',
      `Ripio is one of Latin America's leading Blockchain service providers. Founded in 2013 with the mission of developing and
      strengthening the new digital economy in the region, Ripio offers storage, brokerage, exchange and OTC products to more
      than 950,000 users across Argentina, Brazil and Mexico, with current expansion plans in Colombia, Chile, Uruguay, Paraguay and Peru.
      As an industry pioneer, Ripio has been included in selective startup accelerator programs by Google and Visa, and recognized among the
      most innovative startups of 2018 by KPMG’s Fintech100 list.`,
      './assets/logos/ripio.png',
      './assets/logos/logo-ripio-white.svg',
      `Legal Disclaimer: by funding this loan request, you accept and agree to all of the following: this loan has been requested by an entity
      within the Ripio Group. Digital assets received by the entity will be used for its own business purposes and will not be provided as credit
      to third parties. The loan agreement entered into as a consequence of funding this loan request: (i) is unique, (ii) is neither negotiable
      in any markets nor assignable to third parties by either lender or borrower and, for the avoidance of doubt, (iii) is not a security or any
      equivalent instrument. You will not fund this loan request if the action of funding, or the agreement derived therefrom, would either (i)
      violate any law applicable in your jurisdiction or (ii) would require any kind of regulatory license from your or our part in accordance with
      any law applicable in your jurisdiction.`,
      [
        {
          icon: 'fas fa-link',
          title: 'Website',
          description: null,
          url: 'https://www.ripio.com'
        },
        {
          icon: 'fas fa-calendar-alt',
          title: 'Founding date',
          description: '2013'
        },
        {
          icon: 'fas fa-map-marker-alt',
          title: 'Region',
          description: 'Latin America'
        },
        {
          icon: 'fas fa-user-circle',
          title: 'Total Users',
          description: '950,000'
        },
        {
          icon: 'fas fa-users',
          title: 'Employees',
          description: '130'
        },
        {
          icon: 'fas fa-coins',
          title: 'Currency',
          description: 'ARS & USDC'
        }
      ]
    ),
    [Agent.RipioUsdCreator]: new CompanyIdentity(
      'Ripio',
      '--',
      `Ripio is one of Latin America's leading Blockchain service providers. Founded in 2013 with the mission of developing and
      strengthening the new digital economy in the region, Ripio offers storage, brokerage, exchange and OTC products to more
      than 950,000 users across Argentina, Brazil and Mexico, with current expansion plans in Colombia, Chile, Uruguay, Paraguay and Peru.
      As an industry pioneer, Ripio has been included in selective startup accelerator programs by Google and Visa, and recognized among the
      most innovative startups of 2018 by KPMG’s Fintech100 list.`,
      './assets/logos/ripio.png',
      './assets/logos/logo-ripio-white.svg',
      `Legal Disclaimer: by funding this loan request, you accept and agree to all of the following: this loan has been requested by an entity
      within the Ripio Group. Digital assets received by the entity will be used for its own business purposes and will not be provided as credit
      to the public. The loan agreement entered into as a consequence of funding this loan request: (i) is unique, (ii) is neither negotiable
      in any markets nor assignable to third parties by either lender or borrower and, for the avoidance of doubt, (iii) is not a security or any
      equivalent instrument. You will not fund this loan request if the action of funding, or the agreement derived therefrom, would either (i)
      violate any law applicable in your jurisdiction or (ii) would require any kind of regulatory license from your or our part in accordance with
      any law applicable in your jurisdiction.`,
      [
        {
          icon: 'fas fa-link',
          title: 'Website',
          description: null,
          url: 'https://www.ripio.com'
        },
        {
          icon: 'fas fa-calendar-alt',
          title: 'Founding date',
          description: '2013'
        },
        {
          icon: 'fas fa-map-marker-alt',
          title: 'Region',
          description: 'Latin America'
        },
        {
          icon: 'fas fa-user-circle',
          title: 'Total Users',
          description: '950,000'
        },
        {
          icon: 'fas fa-users',
          title: 'Employees',
          description: '130'
        },
        {
          icon: 'fas fa-coins',
          title: 'Currency',
          description: 'ARS & USDC'
        }
      ]
    )
  };

  constructor(
    private chainService: ChainService
  ) { }

  getIdentity(loan: Loan): Promise<Identity> {
    const { config } = this.chainService;
    return new Promise(async (resolve) => {
      resolve(this.companyIdentities[config.dir[loan.borrower.toLowerCase()]]);
    }) as Promise<Identity>;
  }
}
