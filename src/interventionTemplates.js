export const interventionTemplates = [
  {
    id: 'monitor',
    decision: 'Monitor',
    title: 'Continue monitoring',
    severity: 'Low / Medium',
    goal: 'Keep the player under observation without direct intervention yet.',
    internalChecklist: [
      'Confirm whether risk signals are isolated or recurring.',
      'Check if the player has previous RG or fraud reviews.',
      'Set a next review date if behavior continues.'
    ],
    operatorMessage: 'No player-facing message recommended at this stage. Continue passive monitoring and review if risk signals escalate.'
  },
  {
    id: 'responsible-gaming-message',
    decision: 'Responsible gaming message',
    title: 'Send responsible gaming reminder',
    severity: 'Medium / High',
    goal: 'Remind the player about available responsible gaming tools without promotional language.',
    internalChecklist: [
      'Confirm that the message is neutral and non-promotional.',
      'Do not offer bonuses, cashback, free spins, or retention incentives.',
      'Log the intervention in the audit trail.'
    ],
    operatorMessage: 'We noticed activity patterns that may be worth reviewing. Please remember that tools such as deposit limits, session reminders, cooling-off periods, and self-exclusion are available in your account settings. If you feel gambling is no longer enjoyable or under control, consider taking a break or contacting support for responsible gaming options.'
  },
  {
    id: 'suggest-limits',
    decision: 'Suggest limits',
    title: 'Suggest limit-setting tools',
    severity: 'Medium / High',
    goal: 'Encourage the player to use deposit, loss, wager, or session limits.',
    internalChecklist: [
      'Check which limit tools are available in the operator jurisdiction.',
      'Avoid language that pressures continued play.',
      'Record whether the player accepts, ignores, or rejects the suggestion.'
    ],
    operatorMessage: 'You can set personal limits to help manage your play, including deposit limits, loss limits, wager limits, and session time reminders. These tools are available to help you stay in control of your activity.'
  },
  {
    id: 'cooling-off-review',
    decision: 'Cooling-off review',
    title: 'Review cooling-off option',
    severity: 'High',
    goal: 'Assess whether a cooling-off period should be suggested or applied according to operator policy.',
    internalChecklist: [
      'Review recent losses, deposit frequency, session length, and support interactions.',
      'Check jurisdictional and operator policy requirements.',
      'Escalate to responsible gaming owner if required.'
    ],
    operatorMessage: 'Based on your recent activity, taking a short break may be helpful. Cooling-off options are available and can temporarily restrict access to play. You can contact support or use account settings to learn more about available options.'
  },
  {
    id: 'fraud-review',
    decision: 'Fraud review',
    title: 'Escalate to fraud review',
    severity: 'Medium / High',
    goal: 'Escalate suspicious payment, bonus, or account behavior to fraud operations.',
    internalChecklist: [
      'Check payment history and withdrawal failures.',
      'Review bonus usage and linked account indicators.',
      'Do not send RG messaging until fraud/RG ownership is clarified.'
    ],
    operatorMessage: 'No player-facing message recommended before fraud review is completed.'
  },
  {
    id: 'close-as-false-positive',
    decision: 'Close as false positive',
    title: 'Close case as false positive',
    severity: 'Low',
    goal: 'Document why the case does not require action.',
    internalChecklist: [
      'Add a short decision rationale.',
      'Confirm no mandatory RG or compliance action is required.',
      'Close the case and keep audit trail.'
    ],
    operatorMessage: 'No player-facing message recommended.'
  }
];

export function getTemplateByDecision(decision) {
  return interventionTemplates.find((template) => template.decision === decision) || interventionTemplates[0];
}
