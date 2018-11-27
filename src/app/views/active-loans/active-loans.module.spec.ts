import { ActiveLoansModule } from './active-loans.module';

describe('ActiveLoansModule', () => {
  let activeLoansModule: ActiveLoansModule;

  beforeEach(() => {
    activeLoansModule = new ActiveLoansModule();
  });

  it('should create an instance', () => {
    expect(activeLoansModule).toBeTruthy();
  });
});
