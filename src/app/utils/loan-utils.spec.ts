import { LoanUtils } from './loan-utils';
import { Commit, CommitTypes } from './../interfaces/commit.interface';

describe('Utils', () => {
  it('should return an formatted amount', () => {

    const commits: Commit[] = [
      {
        'nonce': 335,
        'id_loan': '0x0bee952e85946445d50ad18313f26bfe19963cc96387b7334c8a44d3cacbf90c',
        'opcode': CommitTypes.PaidBase,
        'timestamp': '1607024503.647972',
        'tx_hash': '0xfeefa8f0885da33b5fa551f1ad3335379f41c14ca06f57d8b49fd52205b09d26',
        'data': {
          'paid_base': 33527967,
          'paid': 0
        }
      },
      {
        'nonce': 337,
        'id_loan': '0x0bee952e85946445d50ad18313f26bfe19963cc96387b7334c8a44d3cacbf90c',
        'opcode': CommitTypes.PaidBase,
        'timestamp': '1607024503.658258',
        'tx_hash': '0xfeefa8f0885da33b5fa551f1ad3335379f41c14ca06f57d8b49fd52205b09d26',
        'data': {
          'paid_base': 64210771,
          'paid': 0
        }
      },
      {
        'nonce': 340,
        'id_loan': '0x0bee952e85946445d50ad18313f26bfe19963cc96387b7334c8a44d3cacbf90c',
        'opcode': CommitTypes.Paid,
        'timestamp': '1607024503.673138',
        'tx_hash': '0xfeefa8f0885da33b5fa551f1ad3335379f41c14ca06f57d8b49fd52205b09d26',
        'data': {
          'balance': 64210771
        }
      }
    ];

    expect(LoanUtils.getCommitPaidAmount(commits, '340')).toEqual(64210771);
  });
});
