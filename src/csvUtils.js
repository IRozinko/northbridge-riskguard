export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? '';
      return row;
    }, {});
  });
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

export function mapRowsToPlayers(rows) {
  const grouped = new Map();

  for (const row of rows) {
    const id = row.player_id || row.playerId || row.id;
    if (!id) continue;

    const current = grouped.get(id) || {
      id,
      country: row.country || '—',
      segment: row.segment || 'Unknown',
      totalDeposits: 0,
      netLoss: 0,
      sessionMinutes: 0,
      failedWithdrawals: 0,
      bonusClaims: 0,
      lateNightSessions: 0,
      depositFrequency24h: 0,
      lastActivity: row.timestamp || '',
    };

    const type = row.event_type || row.type || '';
    const amount = Number(row.amount || 0);
    const sessionMinutes = Number(row.session_minutes || row.sessionMinutes || 0);

    if (type === 'deposit') {
      current.totalDeposits += amount;
      current.depositFrequency24h += 1;
    }

    if (type === 'loss') current.netLoss += amount;
    if (type === 'session_end' || type === 'session') current.sessionMinutes += sessionMinutes;
    if (type === 'failed_withdrawal') current.failedWithdrawals += 1;
    if (type === 'bonus_claim') current.bonusClaims += 1;

    if (isLateNight(row.timestamp)) current.lateNightSessions += 1;
    if (row.timestamp) current.lastActivity = row.timestamp;

    grouped.set(id, current);
  }

  return [...grouped.values()];
}

export function mapRowsToEvents(rows) {
  return rows.map((row, index) => ({
    id: row.event_id || row.id || `CSV-${index + 1}`,
    playerId: row.player_id || row.playerId || row.id || 'unknown',
    timestamp: row.timestamp || '',
    type: row.event_type || row.type || '',
    amount: row.amount ? Number(row.amount) : null,
    meta: row.meta || row.description || 'Imported CSV event',
  }));
}

function isLateNight(timestamp = '') {
  const hourMatch = timestamp.match(/\s(\d{2}):/);
  if (!hourMatch) return false;
  const hour = Number(hourMatch[1]);
  return hour >= 0 && hour <= 5;
}

export const sampleCsv = `player_id,timestamp,event_type,amount,session_minutes,country,segment,meta
P-2001,2026-06-01 00:15,deposit,500,0,UA,Casino,Card deposit
P-2001,2026-06-01 00:45,loss,420,0,UA,Casino,Fast loss after deposit
P-2001,2026-06-01 02:40,session_end,0,240,UA,Casino,Long late night session
P-2002,2026-06-01 14:05,deposit,80,0,PL,Sportsbook,Normal deposit
P-2002,2026-06-01 14:50,session_end,0,45,PL,Sportsbook,Normal session
P-2003,2026-06-01 03:20,bonus_claim,10,0,RO,Casino,Bonus claim
P-2003,2026-06-01 03:55,failed_withdrawal,120,0,RO,Casino,Rejected payout
P-2003,2026-06-01 04:05,bonus_claim,15,0,RO,Casino,Repeated bonus claim`;
