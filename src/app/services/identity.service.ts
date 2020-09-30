import { Injectable } from '@angular/core';
import { Loan } from '../models/loan.model';
import { Identity } from '../models/identity.model';
import { environment, Agent } from '../../environments/environment';
import { CompanyIdentity } from './../models/identity.model';
import { DecentralandCosignerProvider } from './../providers/cosigners/decentraland-cosigner-provider';

import { CosignerService } from './../services/cosigner.service';

@Injectable()
export class IdentityService {

  companyIdentities = {
    [Agent.RipioArsCreator]: new CompanyIdentity(
      'Ripio',
      '--',
      `Ripio is one of Latin America's leading Blockchain service providers. Founded in 2013 with the mission of developing and
      strengthening the new digital economy in the region, Ripio offers storage, brokerage, exchange and OTC products to more
      than 400,000 users across Argentina, Brazil and Mexico, with current expansion plans in Colombia, Chile, Uruguay, Paraguay and Peru.
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
          description: '400,000'
        },
        {
          icon: 'fas fa-users',
          title: 'Employees',
          description: '100'
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
      than 400,000 users across Argentina, Brazil and Mexico, with current expansion plans in Colombia, Chile, Uruguay, Paraguay and Peru.
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
          description: '400,000'
        },
        {
          icon: 'fas fa-users',
          title: 'Employees',
          description: '100'
        },
        {
          icon: 'fas fa-coins',
          title: 'Currency',
          description: 'ARS & USDC'
        }
      ]
    ),
    [Agent.MortgageCreator]: new CompanyIdentity(
      'Decentraland MC',
      '--',
      `Decentraland is an Ethereum blockchain-powered virtual world, created and owned by its users, who can create, experience, and
      monetize content and applications. Thanks to RCN, Decentraland's users can now request loans in MANA to buy LAND parcels through
      Decentraland's / the platform's Mortgage Creator (MC).`,
      undefined,
      './assets/logos/decentraland-brand.svg',
      'Legal Disclaimer: this loan was requested by an unknown borrower using the Decentraland Mortgage Creator',
      [
        {
          icon: 'fas fa-link',
          title: 'Website',
          description: null,
          url: 'https://www.decentraland.org'
        },
        {
          icon: 'fas fa-calendar-alt',
          title: 'Founding date',
          description: '2017'
        },
        {
          icon: 'fas fa-map-marker-alt',
          title: 'Country',
          description: 'Cayman Islands'
        },
        {
          icon: 'fas fa-users',
          title: 'Employees',
          description: '40'
        },
        {
          icon: 'fas fa-coins',
          title: 'Currency',
          description: 'MANA'
        }
      ]
    )
  };

  constructor(
    private cosignerService: CosignerService
  ) { }

  getIdentity(loan: Loan): Promise<Identity> {
    return new Promise(async (resolve) => {
      const cosigner = await this.cosignerService.getCosigner(loan);
      if (cosigner instanceof DecentralandCosignerProvider) {
        resolve(this.companyIdentities[Agent.MortgageCreator]);
      }

      resolve(this.companyIdentities[environment.dir[loan.borrower.toLowerCase()]]);
    }) as Promise<Identity>;
  }
}
