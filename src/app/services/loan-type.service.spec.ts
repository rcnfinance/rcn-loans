import { async, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'app/shared/shared.module';
import { Utils } from 'app/utils/utils';
import { Loan, Engine, Status, LoanType } from 'app/models/loan.model';
import { LoanTypeService } from 'app/services/loan-type.service';

describe('LoanTypeService', () => {
  let service: LoanTypeService;
  const LOAN_ENGINE = Engine.RcnEngine;
  const LOAN_ID = '0x';
  const LOAN_ADDRESS = Utils.address0x;
  const LOAN_AMOUNT = 10000000000000000;
  const LOAN_STATUS = Status.Ongoing;
  const LOAN_EXPIRATION = 1687856143;
  const LOAN_MODEL = '0x97d0300281C55DC6BE27Cf57343184Ab5C8dcdFF';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, SharedModule],
      providers: [LoanTypeService]
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
    const creator = '0xfbd5e54062619ef2b0323ad9ff874b39fd5a8d2c';
    const loan = new Loan(
      LOAN_ENGINE,
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
      LOAN_ENGINE,
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
});
