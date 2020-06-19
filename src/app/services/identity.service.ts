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
    [Agent.WenanceCreator]: new CompanyIdentity(
      'Wenance',
      'fintech people',
      `Ripio and Wenance are doing exciting things together! Wenance is Argentina’s leading fintech lending company. Founded in 2014 by
      building on 20 years of experience in the traditional finance ecosystem, the firm reinvented itself as a digital organization to
      provide simple, secure and efficient lending solutions to its more than 80,000 users. Since 2017, the company has expanded its
      operations to Uruguay and Spain, with Brazil, Mexico and Peru as its next target markets.`,
      './assets/logos/wenance.svg',
      './assets/logos/wenance-brand.svg',
      `Legal Disclaimer: this is a loan requested solely by Lending Solutions S.A., a Ripio company. Lender will be entitled to the
      interest rate specified in the loan request as published, which will be paid for by Lending Solutions S.A. The published interest
      rate is net of any taxes and costs that Lending Solutions S.A. may be required by law to levy on interest, but it is not net of
      Ethereum Network’s transaction costs, Uniswap costs, fees and slippage. Gross interest rate is XXXX%. Wenance S.A. is not a company
      of the Ripio Group, will not be receiving any money from the loan hereunder and will not pay any interests whatsoever to the lender.
      The inclusion of the Wenance brand has the sole and exclusive purpose of indicating that Lending Solutions S.A. has made an
      investment of its own money in one of Wenance’s investment vehicles. Wenance is a registered trademark of Wenance S.A. Lender
      acknowledges that funding this loan gives it no rights whatsoever against Wenance S.A. or any of its affiliates.`,
      [
        {
          icon: 'fas fa-link',
          title: 'Website',
          description: null,
          url: 'https://www.wenance.com'
        },
        {
          icon: 'fas fa-calendar-alt',
          title: 'Founding date',
          description: '2014'
        },
        {
          icon: 'fas fa-map-marker-alt',
          title: 'Country',
          description: 'Argentina, Uruguay & Spain'
        },
        {
          icon: 'fas fa-users',
          title: 'Employees',
          description: '400'
        },
        {
          icon: 'fas fa-coins',
          title: 'Currency',
          description: 'USD & ARS'
        },
        {
          icon: 'fas fa-money-bill-wave',
          title: 'Loans originated',
          description: 'ARS 3,200 MM'
        },
        {
          icon: 'fas fa-suitcase',
          title: 'Current portfolio',
          description: 'ARS 1,600 MM'
        },
        {
          icon: '../../../../assets/rcn-logo.png',
          title: 'Total debt on RCN',
          description: 'USD 50,000'
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
