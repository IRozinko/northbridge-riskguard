export const defaultRiskRules = [
  {
    id: 'deposit-spike',
    label: 'deposit spike',
    field: 'totalDeposits',
    operator: '>=',
    threshold: 3000,
    points: 20,
    category: 'Payments / RG',
    description: 'Large total deposit volume may indicate financial risk or sudden escalation.'
  },
  {
    id: 'loss-chasing',
    label: 'loss chasing',
    field: 'netLoss',
    operator: '>=',
    threshold: 800,
    points: 20,
    category: 'Responsible Gaming',
    description: 'High net losses can indicate potential loss-chasing behavior.'
  },
  {
    id: 'long-session',
    label: 'long session',
    field: 'sessionMinutes',
    operator: '>=',
    threshold: 180,
    points: 15,
    category: 'Responsible Gaming',
    description: 'Long uninterrupted sessions should be reviewed for RG intervention.'
  },
  {
    id: 'late-night-activity',
    label: 'late night activity',
    field: 'lateNightSessions',
    operator: '>=',
    threshold: 2,
    points: 15,
    category: 'Responsible Gaming',
    description: 'Repeated late-night sessions can indicate risky behavioral patterns.'
  },
  {
    id: 'high-deposit-frequency',
    label: 'high deposit frequency',
    field: 'depositFrequency24h',
    operator: '>=',
    threshold: 5,
    points: 15,
    category: 'Payments / RG',
    description: 'Many deposits in 24 hours can indicate escalation or loss chasing.'
  },
  {
    id: 'failed-withdrawals',
    label: 'failed withdrawals',
    field: 'failedWithdrawals',
    operator: '>=',
    threshold: 2,
    points: 10,
    category: 'Payments / Fraud',
    description: 'Failed withdrawals may signal payment friction, fraud risk, or user frustration.'
  },
  {
    id: 'bonus-abuse-pattern',
    label: 'bonus abuse pattern',
    field: 'bonusClaims',
    operator: '>=',
    threshold: 5,
    points: 10,
    category: 'Fraud / Bonus Abuse',
    description: 'Frequent bonus claims may require bonus abuse review.'
  }
];
