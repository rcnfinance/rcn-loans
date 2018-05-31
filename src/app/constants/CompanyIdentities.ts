import { Agent } from '../../environments/environment';
import { CompanyIdentity } from './../models/identity.model';

export const companyIdentities = {
    [Agent.RipioCreator]: new CompanyIdentity(
            'Ripio',
            'Ripio is one of the leading Bitcoin wallets in Latin America. ... Ripio is offering its services across several Latin American countries.',
            'https://ripio-cms-us.s3.amazonaws.com/filer_public/80/d7/80d76109-a560-446c-9385-d6d911168dbe/logo-ripio-white.svg',
            new Date()
        )
};
