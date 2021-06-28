import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../../shared/shared.module';
import { NotificationsComponent } from './notifications.component';
import { HeaderPopoverService } from '../../../services/header-popover.service';
import { Tx } from '../../../services/tx-legacy.service';
import { readComponent } from '../../../utils/utils.test';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  const txArray: any = [
    {
      'tx': '0xf9e3dcdad1cc3c54a8d3c1e7d994d212afd2669b8cf70d2cdc06b1aedfe318cb',
      'to': '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf',
      'confirmed': false,
      'type': 'withdraw',
      'data': ['744'],
      'timestamp': 1562960212215
    }, {
      'tx': '0x955c8e72473554d945b7c65dce53bed631f945a61d124d4b921be7d31dd4d16d',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'withdraw',
      'data': [
        '0x212C362e33Abf6E3e6354363E0634aA1300c3045A18C8C5a08F3bB2A17184768',
        '0xC2d44B8761455b119fF8a9e98e431FDbaB17EDcF8e65362eC6401F0AFcE06016'
      ],
      'timestamp': 1562960216309
    }, {
      'tx': '0x9445fa7aba5d4f4def6fc2b6c70b760e5982970e35358b4a1a48c3cab6249007',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'withdraw',
      'data': ['0x212C362e33Abf6E3e6354363E0634aA1300c3045A18C8C5a08F3bB2A17184768'],
      'timestamp': 1562960362974
    }, {
      'tx': '0xe18947d877479bfdae121d160ef2bd67bb970295c86992f4982d1bd660680759',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'withdraw',
      'data': ['0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768'],
      'timestamp': 1562960919620
    }, {
      'tx': '0x22009d5d9e33f35008d6dffdaf24cd90dc276ee39af7c014f71c36809666ebf6',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'withdraw',
      'data': ['0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768'],
      'timestamp': 1562961084754
    }, {
      'tx': '0xa35adff04d540d2ed58869547b8a82321962268be2fa007425bd40280cdaa180',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'pay',
      'data': {
        'engine': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
        'id': '0xc2d44b8761455b119ff8a9e98e431fdbab17edcf8e65362ec6401f0afce06016',
        'amount': 2000000000000000000
      },
      'timestamp': 1562961200492
    }, {
      'tx': '0x1c44fa3169ce7e53dfadd7266b77a293557414ec05f27fa72a070ec85fef8c44',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'withdraw',
      'data': [
        '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
        '0xc2d44b8761455b119ff8a9e98e431fdbab17edcf8e65362ec6401f0afce06016'
      ],
      'timestamp': 1562961271397
    }, {
      'tx': '0x1d0a68797d82a9c4af9f13b1340e8c8b85776f0383c63a1599934cd9accec504',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'pay',
      'data': {
        'engine': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
        'id': '0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768',
        'amount': 1000000000000000000
      },
      'timestamp': 1562961394773
    }, {
      'tx': '0xcf5c1d9d5af57cebbf256eeb30473e23275592561185c42ae89079f4395262a5',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'withdraw',
      'data': ['0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768'],
      'timestamp': 1562961534025
    }, {
      'tx': '0x83bcbd6fc3a6dd7413788c496ea738ad53becc45d0f51c4a1813aa2faf86707d',
      'to': '0x50c544d5d44d603695ed221421b8cb5a78681f15',
      'confirmed': true,
      'type': 'withdraw',
      'data': ['0x212c362e33abf6e3e6354363e0634aa1300c3045a18c8c5a08f3bb2a17184768'],
      'timestamp': 1562962013732
    }, {
      'tx': '0x36b3cd4cae26afb849b764a70e621571635582675decff8d5acce0d65ae2f3c4',
      'to': '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
      'confirmed': false,
      'type': 'lend',
      'data': {
        'engine': '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
        'id': '0x6a360f4f8d247543789c3ca447a5ef7a5a8c7b386a95774da2551e5385bfe131'
      },
      'timestamp': 1562970021337
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule,
        BrowserAnimationsModule,
        SharedModule
      ],
      declarations: [
        NotificationsComponent
      ],
      providers: [
        HeaderPopoverService
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add notification', () => {
    const thisComponent: any = component;
    const tx: Tx = txArray[0];
    const returnUnavailableItem = () => readComponent(fixture, '.notifications-container ul li.unavailable');
    let lastItem;
    let lastItemNotification;

    // check empty state
    expect(component.oNotifications.length).toEqual(0);
    expect(returnUnavailableItem()).toBeDefined();

    // check non-empty state
    thisComponent.addNewNotification(tx);
    fixture.detectChanges();
    lastItem = readComponent(fixture, '.notifications-container ul li', component.oNotifications.length);
    lastItemNotification = lastItem.querySelectorAll('app-notification-item');
    expect(returnUnavailableItem()).toBeUndefined();
    expect(component.oNotifications.length).toBeGreaterThan(0);
    expect(lastItemNotification).toBeDefined();
  });

  it('should get the latest tx', () => {
    const txMemory: Tx[] = component.getLastestTx(txArray);
    expect(txMemory.length).toBe(8);
  });

  it('should make tx as finished', () => {
    const thisComponent: any = component;
    const mockTx: Tx = txArray[0];
    const mockTxConfirmed: Tx = mockTx;
    let mockTxIndex: number;

    // add mock notification
    thisComponent.addNewNotification(mockTx);
    mockTxIndex = thisComponent.oNotifications.findIndex(i => i.hashTx === mockTx.tx);
    expect(thisComponent.oNotifications[mockTxIndex].confirmedTx).toBeFalsy();

    // make mock notification as finished
    mockTxConfirmed.confirmed = true;
    thisComponent.setTxFinished(mockTxConfirmed);
    expect(thisComponent.oNotifications[mockTxIndex].confirmedTx).toBeTruthy();
  });

  it('should render the latest elements', () => {
    const txMemory: Tx[] = component.getLastestTx(txArray);
    component.renderLastestTx(txMemory);

    // check lastest tx
    expect(component.oNotifications.length).toBe(8);

    // check unconfirmed tx
    const unconfirmedTx = component.oNotifications.filter(tx => tx.confirmedTx === false);
    expect(unconfirmedTx.length).toBe(1);
  });

});
