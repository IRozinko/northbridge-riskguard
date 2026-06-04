export function calculatePlayerRisk(player, playerEvents = []) {
  const flags = [];
  let score = 0;

  if (player.totalDeposits >= 3000) {
    score += 20;
    flags.push('deposit spike');
  }

  if (player.netLoss >= 800) {
    score += 20;
    flags.push('loss chasing');
  }

  if (player.sessionMinutes >= 180) {
    score += 15;
    flags.push('long session');
  }

  if (player.lateNightSessions >= 2) {
    score += 15;
    flags.push('late night activity');
  }

  if (player.depositFrequency24h >= 5) {
    score += 15;
    flags.push('high deposit frequency');
  }

  if (player.failedWithdrawals >= 2) {
    score += 10;
    flags.push('failed withdrawals');
  }

  if (player.bonusClaims >= 5) {
    score += 10;
    flags.push('bonus abuse pattern');
  }

  const eventTypes = playerEvents.map((event) => event.type);
  if (eventTypes.includes('failed_withdrawal')) {
    score += 5;
  }

  const riskScore = Math.min(score, 100);
  const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';
  const recommendedAction = getRecommendedAction(riskLevel, flags);

  return {
    ...player,
    flags,
    riskScore,
    riskLevel,
    recommendedAction,
  };
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

export function summarizePortfolio(players, reviews) {
  const highRiskPlayers = players.filter((player) => player.riskLevel === 'High').length;
  const mediumRiskPlayers = players.filter((player) => player.riskLevel === 'Medium').length;
  const averageRiskScore = Math.round(players.reduce((sum, player) => sum + player.riskScore, 0) / players.length);
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
