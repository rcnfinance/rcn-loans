import { OverviewModule } from './overview.module';

describe('OverviewModule', () => {
  let OverviewModule: OverviewModule;

  beforeEach(() => {
    OverviewModule = new OverviewModule();
  });

  it('should create an instance', () => {
    expect(OverviewModule).toBeTruthy();
  });
});
