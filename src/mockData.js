export const players = [
  { id: 'P-1001', country: 'UA', segment: 'Sportsbook + Casino', totalDeposits: 4200, netLoss: 3100, sessionMinutes: 410, failedWithdrawals: 2, bonusClaims: 1, lateNightSessions: 4, depositFrequency24h: 8, lastActivity: '2026-06-01 02:42' },
  { id: 'P-1002', country: 'PL', segment: 'Casino', totalDeposits: 780, netLoss: 120, sessionMinutes: 68, failedWithdrawals: 0, bonusClaims: 5, lateNightSessions: 0, depositFrequency24h: 2, lastActivity: '2026-06-01 14:18' },
  { id: 'P-1003', country: 'RO', segment: 'Sportsbook', totalDeposits: 1400, netLoss: 910, sessionMinutes: 190, failedWithdrawals: 1, bonusClaims: 0, lateNightSessions: 2, depositFrequency24h: 5, lastActivity: '2026-06-01 01:14' },
  { id: 'P-1004', country: 'DE', segment: 'Casino VIP', totalDeposits: 9600, netLoss: 700, sessionMinutes: 82, failedWithdrawals: 0, bonusClaims: 0, lateNightSessions: 1, depositFrequency24h: 1, lastActivity: '2026-05-31 21:08' },
  { id: 'P-1005', country: 'UA', segment: 'Casino', totalDeposits: 350, netLoss: 320, sessionMinutes: 260, failedWithdrawals: 3, bonusClaims: 8, lateNightSessions: 3, depositFrequency24h: 6, lastActivity: '2026-06-01 03:22' },
  { id: 'P-1006', country: 'CZ', segment: 'Sportsbook', totalDeposits: 220, netLoss: 40, sessionMinutes: 35, failedWithdrawals: 0, bonusClaims: 1, lateNightSessions: 0, depositFrequency24h: 1, lastActivity: '2026-06-01 18:03' }
];

export const events = [
  { id: 'E-1', playerId: 'P-1001', timestamp: '2026-06-01 00:20', type: 'deposit', amount: 500, meta: 'Card deposit' },
  { id: 'E-2', playerId: 'P-1001', timestamp: '2026-06-01 00:46', type: 'loss', amount: 430, meta: 'Casino session' },
  { id: 'E-3', playerId: 'P-1001', timestamp: '2026-06-01 01:05', type: 'deposit', amount: 700, meta: 'Deposit spike' },
  { id: 'E-4', playerId: 'P-1001', timestamp: '2026-06-01 02:42', type: 'session_end', amount: null, meta: 'Long late-night session' },
  { id: 'E-5', playerId: 'P-1002', timestamp: '2026-06-01 14:18', type: 'bonus_claim', amount: 20, meta: 'Welcome bonus claim' },
  { id: 'E-6', playerId: 'P-1003', timestamp: '2026-06-01 01:14', type: 'deposit', amount: 300, meta: 'Repeated deposit after losses' },
  { id: 'E-7', playerId: 'P-1005', timestamp: '2026-06-01 02:11', type: 'failed_withdrawal', amount: 120, meta: 'Payment rejected' },
  { id: 'E-8', playerId: 'P-1005', timestamp: '2026-06-01 03:22', type: 'bonus_claim', amount: 15, meta: 'Multiple bonus claims pattern' }
];

export const reviews = [
  { id: 'R-1', playerId: 'P-1001', title: 'Responsible gaming review', owner: 'Risk team', status: 'Open', dueDate: '2026-06-02', summary: 'High loss, deposit spike, long late-night sessions and repeated deposits detected.' },
  { id: 'R-2', playerId: 'P-1005', title: 'Bonus abuse / withdrawal friction review', owner: 'Fraud analyst', status: 'Open', dueDate: '2026-06-02', summary: 'Multiple bonus claims and failed withdrawals detected. Review account and payment history.' },
  { id: 'R-3', playerId: 'P-1003', title: 'Loss chasing review', owner: 'Compliance', status: 'In progress', dueDate: '2026-06-03', summary: 'Repeated deposits after losses and late-night activity indicate possible loss chasing.' }
];
