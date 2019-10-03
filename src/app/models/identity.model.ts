
export class Identity {
  constructor(
    public short: string
  ) {}
}

export class Feature {
  constructor(
    public icon: string,
    public title: string,
    public description: string,
    public url?: string
  ) {}
}

export class CompanyIdentity extends Identity {
  constructor(
      public name: string,
      public slogan: string,
      public description: string,
      public logo: string,
      public brand: string,
      public disclaimer: string,
      public features: Feature[]
    ) {
    super(name);
  }
}
