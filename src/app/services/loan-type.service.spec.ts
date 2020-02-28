import { async, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './../shared/shared.module';
import { environment } from './../../environments/environment';
import { Utils } from './../utils/utils';
// App models
import { Loan, Network, Status, LoanType } from './../models/loan.model';
// App services
import { CosignerService } from './cosigner.service';
import { LoanTypeService } from './loan-type.service';

describe('LoanTypeService', () => {
  let service: LoanTypeService;
  const LOAN_NETWORK = Network.Diaspore;
  const LOAN_ID = '0x';
  const LOAN_ADDRESS = Utils.address0x;
  const LOAN_AMOUNT = 10000000000000000;
  const LOAN_STATUS = Status.Ongoing;
  const LOAN_EXPIRATION = 1687856143;
  const LOAN_MODEL = '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, SharedModule],
      providers: [LoanTypeService, CosignerService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(LoanTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return fintech originator type', () => {
    const creator: string = Object.keys(environment.dir)[0];
    const loan = new Loan(
      LOAN_NETWORK,
      LOAN_ID,
      LOAN_ADDRESS,
      LOAN_AMOUNT,
      null,
      null,
      creator,
      creator,
      LOAN_STATUS,
      LOAN_EXPIRATION,
      LOAN_MODEL
    );

    const result = service.getLoanType(loan);
    expect(result).toEqual(LoanType.FintechOriginator);
  });

  it('should return unknown type', () => {
    const creator: string = Utils.address0x;
    const loan = new Loan(
      LOAN_NETWORK,
      LOAN_ID,
      LOAN_ADDRESS,
      LOAN_AMOUNT,
      null,
      null,
      creator,
      creator,
      LOAN_STATUS,
      LOAN_EXPIRATION,
      LOAN_MODEL
    );

    const result = service.getLoanType(loan);
    expect(result).toEqual(LoanType.Unknown);
  });

  it('should return NFT collateral type', () => {
    const creator: string = environment.contracts.decentraland.mortgageCreator;
    const cosigner: string = environment.contracts.decentraland.mortgageManager;
    const loan = new Loan(
      LOAN_NETWORK,
      LOAN_ID,
      LOAN_ADDRESS,
      LOAN_AMOUNT,
      null,
      null,
      creator,
      creator,
      LOAN_STATUS,
      LOAN_EXPIRATION,
      LOAN_MODEL,
      cosigner
    );

    const result = service.getLoanType(loan);
    expect(result).toEqual(LoanType.NftCollateral);
  });
});
