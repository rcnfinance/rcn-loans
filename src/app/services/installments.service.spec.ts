import { async, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import * as moment from 'moment';
import { InstallmentStatus } from 'app/interfaces/installment';
import { LOAN_EXAMPLE_REQUESTED } from 'app/utils/utils.test';
import { InstallmentsService } from './installments.service';
import { EventsService } from './events.service';

describe('InstallmentsService', () => {
  let service: InstallmentsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [InstallmentsService, EventsService]
    })
    .compileComponents();

    service = TestBed.inject(InstallmentsService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return same loan installments quantity', async () => {
    const installments = await service.getInstallments(LOAN_EXAMPLE_REQUESTED);
    expect(installments.length).toEqual(LOAN_EXAMPLE_REQUESTED.descriptor.installments);
  });

  it('should return the properties of the Installment interface', async () => {
    const installments = await service.getInstallments(LOAN_EXAMPLE_REQUESTED);
    const firstInstallment = installments[0];

    // dynamic data
    firstInstallment.startDate = moment().format();
    firstInstallment.dueDate = moment().format();

    const { descriptor } = LOAN_EXAMPLE_REQUESTED;
    expect(firstInstallment).toEqual(jasmine.objectContaining({
      isCurrent: true,
      isLast: false,
      isPrev: false,
      isNext: false,
      payNumber: 1,
      startDate: moment().format(),
      dueDate: moment().format(),
      currency: 'RCN',
      amount: descriptor.firstObligation / 10 ** 18,
      punitory: descriptor.punitiveInterestRate,
      pendingAmount: descriptor.firstObligation / 10 ** 18,
      totalPaid: 0,
      pays: [],
      status: InstallmentStatus.OnTime
    }));
  });

  it('should not return payments', async () => {
    const installments = await service.getInstallments(LOAN_EXAMPLE_REQUESTED);
    const firstInstallment = installments[0];
    expect(firstInstallment.pays.length).toEqual(0);

    const payments = await service.getPayments(LOAN_EXAMPLE_REQUESTED);
    expect(payments.length).toEqual(0);
  });

  it('should be return the first and current installment', async () => {
    const installment = await service.getCurrentInstallment(LOAN_EXAMPLE_REQUESTED);
    expect(installment.isCurrent).toBeTruthy();
    expect(installment.isLast).toBeFalsy();
    expect(installment.isPrev).toBeFalsy();
    expect(installment.isNext).toBeFalsy();
    expect(installment.payNumber).toEqual(1);
  });
});
