// tslint:disable:max-line-length

import { Agent } from '../../environments/environment';
import { CompanyIdentity } from './../models/identity.model';

export const companyIdentities = {
  [Agent.RipioCreator]: new CompanyIdentity(
    'Ripio',
    '--',
    'Ripio is now one of the main Blockchain companies in Latin America. Ripio main product is their mobile wallet that operates on Bitcoin, Ether and local currency: users can receive, store, buy / sell and send cryptocurrency, and also make digital payments from their mobile phones, and also request micro-loans to finance their purchases.',
    'https://ripio-cms-us.s3.amazonaws.com/filer_public/80/d7/80d76109-a560-446c-9385-d6d911168dbe/logo-ripio-white.svg',
    null,
    [
      {
        icon: 'calendar',
        title: 'Founding date',
        description: '2013'
      }
    ]
  ),
  [Agent.WenanceCreator]: new CompanyIdentity(
    'Wenance',
    'fintech people',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    './assets/logos/wenance.png',
    './assets/logos/wenance-brand.png',
    [
      {
        icon: 'url',
        title: 'Website',
        description: null,
        url: 'www.wenance.com'
      },
      {
        icon: 'calendar',
        title: 'Founding date',
        description: '2014'
      },
      {
        icon: 'pin',
        title: 'Country',
        description: 'Argentina, Uruguay & Spain'
      },
      {
        icon: 'person',
        title: 'Employees',
        description: '400'
      },
      {
        icon: 'currency',
        title: 'Currency',
        description: 'USD & ARS'
      },
      {
        icon: 'calendar',
        title: 'Loans originated',
        description: 'ARS 3,200 MM'
      },
      {
        icon: 'calendar',
        title: 'Current portfolio',
        description: 'ARS 1,600 MM'
      },
      {
        icon: 'calendar',
        title: 'Total debt on RCN',
        description: 'USD 50,000'
      }
    ]
  )
};
