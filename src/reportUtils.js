import { getTemplateByDecision } from './interventionTemplates.js';

export function buildRiskReport({ summary, players, reviews, events }) {
  const generatedAt = new Date().toISOString();
  const openCases = reviews.filter((review) => review.status !== 'Closed');
  const closedCases = reviews.filter((review) => review.status === 'Closed');
  const highRiskPlayers = players.filter((player) => player.riskLevel === 'High');
  const mediumRiskPlayers = players.filter((player) => player.riskLevel === 'Medium');

  return [
    '# Northbridge RiskGuard — Compliance / Risk Report',
    '',
    `Generated at: ${generatedAt}`,
    '',
    '## Executive summary',
    '',
    `- Players monitored: ${summary.totalPlayers}`,
    `- High-risk players: ${summary.highRiskPlayers}`,
    `- Medium-risk players: ${summary.mediumRiskPlayers}`,
    `- Average risk score: ${summary.averageRiskScore}`,
    `- Open review cases: ${openCases.length}`,
    `- Closed review cases: ${closedCases.length}`,
    `- Responsible actions suggested: ${summary.responsibleActions}`,
    '',
    '## Risk distribution',
    '',
    `- High risk: ${highRiskPlayers.map((player) => `${player.id} (${player.riskScore})`).join(', ') || 'None'}`,
    `- Medium risk: ${mediumRiskPlayers.map((player) => `${player.id} (${player.riskScore})`).join(', ') || 'None'}`,
    '',
    '## High and medium risk players',
    '',
    ...players
      .filter((player) => player.riskLevel !== 'Low')
      .flatMap((player) => [
        `### ${player.id} — ${player.riskLevel} risk`,
        '',
        `- Country: ${player.country}`,
        `- Segment: ${player.segment}`,
        `- Risk score: ${player.riskScore}`,
        `- Flags: ${player.flags.join(', ') || 'None'}`,
        `- Total deposits: $${player.totalDeposits}`,
        `- Net loss: $${player.netLoss}`,
        `- Session time: ${player.sessionMinutes} min`,
        `- Recommended action: ${player.recommendedAction}`,
        '',
      ]),
    '## Review cases',
    '',
    ...reviews.flatMap((review) => {
      const template = getTemplateByDecision(review.decision);
      return [
        `### ${review.id} — ${review.title}`,
        '',
        `- Player: ${review.playerId}`,
        `- Status: ${review.status}`,
        `- Owner: ${review.owner}`,
        `- Due date: ${review.dueDate}`,
        `- Decision: ${review.decision || 'No decision yet'}`,
        `- Suggested intervention: ${template.title}`,
        `- Summary: ${review.summary}`,
        `- Notes: ${review.notes || 'No notes'}`,
        '',
        'Audit trail:',
        ...((review.auditTrail || []).map((item) => `- ${item.at} — ${item.action} (${item.by})`)),
        '',
      ];
    }),
    '## Event sample',
    '',
    ...events.slice(0, 25).map((event) => `- ${event.timestamp} — ${event.playerId} — ${event.type}${event.amount ? ` — $${event.amount}` : ''} — ${event.meta}`),
    '',
    '## Important note',
    '',
    'This report was generated from mock or imported sample data inside the Northbridge RiskGuard validation demo. It does not provide gambling functionality and should not be treated as a legal compliance opinion.',
    '',
  ].join('\n');
}

export function downloadMarkdownReport(markdown, filename = 'northbridge-riskguard-report.md') {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
