import { Injectable } from '@angular/core';
import { Loan } from '../models/loan.model';
import { Identity } from '../models/identity.model';
import { environment, Agent } from '../../environments/environment';
import { CompanyIdentity } from './../models/identity.model';

@Injectable()
export class IdentityService {

  companyIdentities = {
    [Agent.RipioCreator]: new CompanyIdentity(
      'Ripio',
      '--',
      `Ripio is now one of the main Blockchain companies in Latin America. Ripio main product is their mobile wallet that operates on
      Bitcoin, Ether and local currency: users can receive, store, buy / sell and send cryptocurrency, and also make digital payments
      from their mobile phones, and also request micro-loans to finance their purchases.`,
      './assets/logos/ripio.png',
      './assets/logos/logo-ripio-white.svg',
      'Legal disclaimer: This is a loan requested solely by Lending Solutions S.A., a Ripio company.',
      [
        {
          icon: 'fas fa-calendar-alt',
          title: 'Founding date',
          description: '2013'
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
      `Legal disclaimer: This is a loan requested solely by Lending Solutions S.A., a Ripio company. Lender will be entitled to the
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
    )
  };

  constructor() { }

  getIdentity(loan: Loan): Promise<Identity> {
    return new Promise((resolve) => {
      resolve(this.companyIdentities[environment.dir[loan.borrower.toLowerCase()]]);
    }) as Promise<Identity>;
  }
}
