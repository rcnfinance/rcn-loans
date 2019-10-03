// tslint:disable:max-line-length

import { Agent } from '../../environments/environment';
import { CompanyIdentity } from './../models/identity.model';

export const companyIdentities = {
  [Agent.RipioCreator]: new CompanyIdentity(
    'Ripio',
    '--',
    'Ripio is now one of the main Blockchain companies in Latin America. Ripio main product is their mobile wallet that operates on Bitcoin, Ether and local currency: users can receive, store, buy / sell and send cryptocurrency, and also make digital payments from their mobile phones, and also request micro-loans to finance their purchases.',
    './assets/logos/ripio.png',
    './assets/logos/logo-ripio-white.svg',
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
    'Ripio and Wenance are doing exciting things together! Wenance is Argentina’s leading fintech lending company. Founded in 2014 by building on 20 years of experience in the traditional finance ecosystem, the firm reinvented itself as a digital organization to provide simple, secure and efficient lending solutions to its more than 80,000 users. Since 2017, the company has expanded its operations to Uruguay and Spain, with Brazil, Mexico and Peru as its next target markets.',
    './assets/logos/wenance.svg',
    './assets/logos/wenance-brand.svg',
    [
      {
        icon: 'fas fa-link',
        title: 'Website',
        description: null,
        url: 'www.wenance.com'
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
