import {} from 'jasmine';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { BalanceComponent } from './balance.component';
import { readComponent } from '../../utils/utils.test';

import { Web3Service } from '../../../app/services/web3.service';
import { ContractsService } from '../../../app/services/contracts.service';
import { TxService } from '../../../app/tx.service';
import { environment } from '../../../environments/environment';

class MockWeb3Service {
  loginEvent = {
    subscribe() {}
  };

  getAccount(): string {
    return '0x33332025ad35a821eec5f1e10459222c8e4c62c3';
  }
}

class MockTxService {
  getLastWithdraw() {}
  registerWithdrawTx() {}
}

class MockContractService {
  getUserBalanceRCN() {}
  getPendingWithdraws() {}
  withdrawFunds() {}
}

describe('BalanceComponent', () => {
  let fixture: ComponentFixture<BalanceComponent>;

  let contractService: MockContractService;
  let txService: MockTxService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BalanceComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
          { provide: Web3Service, useClass: MockWeb3Service },
          { provide: ContractsService, useClass: MockContractService },
          { provide: TxService, useClass: MockTxService }
      ]
    })
    .compileComponents();
    contractService = TestBed.get(ContractsService);
    txService = TestBed.get(TxService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceComponent);
  });

  it('should display current balance', fakeAsync(() => {
    spyOn(contractService, 'getUserBalanceRCN').and.returnValue({ toNumber() { return 1000; } });
    spyOn(contractService, 'getPendingWithdraws').and.returnValue(0);
    fixture.detectChanges();
    tick(50);
    fixture.detectChanges();

    expect(
      readComponent(fixture, '.main > div:nth-child(1)').innerText
    ).toBe('1000');

    expect(
      readComponent(fixture, '.pending')
    ).toBeFalsy();
  }));

  it('should display current balance and pending withdraw', fakeAsync(() => {
    spyOn(contractService, 'getUserBalanceRCN').and.returnValue({ toNumber() { return 1000; } });
    spyOn(contractService, 'getPendingWithdraws').and.returnValue([2000 * 10 ** 18, [2, 4, 3]]);
    fixture.detectChanges();
    tick(50);
    fixture.detectChanges();

    expect(
      readComponent(fixture, '.pending').innerText
    ).toContain('2000');
  }));

  it('should request withdraw', fakeAsync(() => {
    spyOn(contractService, 'getUserBalanceRCN').and.returnValue({ toNumber() { return 1000; } });
    spyOn(contractService, 'getPendingWithdraws').and.returnValue([2000 * 10 ** 18, [2, 4, 3]]);
    fixture.detectChanges();
    tick(50);
    fixture.detectChanges();

    const mocktx = '0xd6bd3796ba8c4c52a7a324b3036ac4c58e80fe8cf2df9a1756a4cb432cbff601';
    spyOn(contractService, 'withdrawFunds').and.returnValue(mocktx);
    spyOn(txService, 'registerWithdrawTx');
    spyOn(txService, 'getLastWithdraw').and.returnValue(mocktx);
    readComponent(fixture, '.pending').click();
    tick(50);
    fixture.detectChanges();

    expect(contractService.withdrawFunds).toHaveBeenCalledWith([2, 4, 3]);
    expect(txService.registerWithdrawTx).toHaveBeenCalledWith(
      mocktx,
      environment.contracts.basaltEngine,
      [2, 4, 3]
    );

    expect(
      readComponent(fixture, '.pending')
    ).toBeFalsy();

    expect(
      readComponent(fixture, '.main > div:nth-child(1)').innerText
    ).toBe('3000');
  }));

  it('should sum ammounts if pending tx', fakeAsync(() => {
    spyOn(contractService, 'getUserBalanceRCN').and.returnValue({ toNumber() { return 1000; } });
    spyOn(contractService, 'getPendingWithdraws').and.returnValue([2000 * 10 ** 18, [2, 4, 3]]);
    const mocktx = '0xd6bd3796ba8c4c52a7a324b3036ac4c58e80fe8cf2df9a1756a4cb432cbff601';
    spyOn(txService, 'getLastWithdraw').and.returnValue(mocktx);
    fixture.detectChanges();
    tick(50);
    fixture.detectChanges();

    expect(
      readComponent(fixture, '.pending')
    ).toBeFalsy();

    expect(
      readComponent(fixture, '.main > div:nth-child(1)').innerText
    ).toBe('3000');
  }));
});
