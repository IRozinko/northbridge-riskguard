import { defaultRiskRules } from './riskRules.js';

export function calculatePlayerRisk(player, playerEvents = [], rules = defaultRiskRules) {
  const triggeredRules = [];
  let score = 0;

  for (const rule of rules) {
    if (matchesRule(player, rule)) {
      score += Number(rule.points || 0);
      triggeredRules.push(rule);
    }
  }

  const eventTypes = playerEvents.map((event) => event.type);
  if (eventTypes.includes('failed_withdrawal') && !triggeredRules.some((rule) => rule.id === 'failed-withdrawals')) {
    score += 5;
  }

  const riskScore = Math.min(score, 100);
  const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';
  const flags = triggeredRules.map((rule) => rule.label);
  const recommendedAction = getRecommendedAction(riskLevel, flags);

  return {
    ...player,
    flags,
    triggeredRules,
    riskScore,
    riskLevel,
    recommendedAction,
  };
}

function matchesRule(player, rule) {
  const value = Number(player[rule.field] || 0);
  const threshold = Number(rule.threshold || 0);

  if (rule.operator === '>=') return value >= threshold;
  if (rule.operator === '>') return value > threshold;
  if (rule.operator === '<=') return value <= threshold;
  if (rule.operator === '<') return value < threshold;
  if (rule.operator === '=') return value === threshold;

  return false;
}

function getRecommendedAction(riskLevel, flags) {
  if (riskLevel === 'High') {
    if (flags.includes('loss chasing') || flags.includes('long session')) {
      return 'Manual RG review; consider responsible gaming message, limit tools or cooling-off review.';
    }
    return 'Manual risk review and account activity analysis.';
  }

  if (riskLevel === 'Medium') {
    return 'Monitor activity and add to review queue if behavior escalates.';
  }

  return 'No immediate action. Continue passive monitoring.';
}

export function buildReviewsFromPlayers(players) {
  return players
    .filter((player) => player.riskLevel !== 'Low')
    .map((player) => ({
      id: `AUTO-${player.id}`,
      playerId: player.id,
      title: player.riskLevel === 'High' ? 'High-risk player review' : 'Medium-risk monitoring review',
      owner: player.riskLevel === 'High' ? 'Risk / Compliance' : 'Risk team',
      status: 'Open',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      summary: `${player.riskLevel} risk detected: ${player.flags.join(', ') || 'no specific flags'}.`,
    }));
}

export function summarizePortfolio(players, reviews) {
  const highRiskPlayers = players.filter((player) => player.riskLevel === 'High').length;
  const mediumRiskPlayers = players.filter((player) => player.riskLevel === 'Medium').length;
  const averageRiskScore = players.length
    ? Math.round(players.reduce((sum, player) => sum + player.riskScore, 0) / players.length)
    : 0;
  const openReviews = reviews.filter((review) => review.status !== 'Closed').length;
  const responsibleActions = players.filter((player) => player.recommendedAction.toLowerCase().includes('responsible')).length;

  return {
    totalPlayers: players.length,
    highRiskPlayers,
    mediumRiskPlayers,
    averageRiskScore,
    openReviews,
    responsibleActions,
  };
}
