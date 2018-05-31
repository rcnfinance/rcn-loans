
export class Identity {
    constructor(
        public short: string
    ) {}
}

export class CompanyIdentity extends Identity {
    constructor(
        public name: string,
        public description: string,
        public logo: string,
        public foundation: Date
    ) {
        super(name);
    }
}
