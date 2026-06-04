import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, BarChart3, CheckCircle2, FileText, Gauge, Search, ShieldAlert, Upload, UsersRound } from 'lucide-react';
import { players as seedPlayers, events as seedEvents, reviews as seedReviews } from './mockData.js';
import { calculatePlayerRisk, summarizePortfolio, buildReviewsFromPlayers } from './riskEngine.js';
import { defaultRiskRules } from './riskRules.js';
import { mapRowsToEvents, mapRowsToPlayers, parseCsv, sampleCsv } from './csvUtils.js';
import './styles.css';

const tabs = ['Dashboard', 'Players', 'Review Queue', 'Events', 'Reports', 'Rules', 'Import CSV'];

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [query, setQuery] = useState('');
  const [rawPlayers, setRawPlayers] = useState(seedPlayers);
  const [rawEvents, setRawEvents] = useState(seedEvents);
  const [reviews, setReviews] = useState(seedReviews);
  const [rules, setRules] = useState(defaultRiskRules);

  const enrichedPlayers = useMemo(() => {
    return rawPlayers.map((player) => calculatePlayerRisk(player, rawEvents.filter((event) => event.playerId === player.id), rules));
  }, [rawPlayers, rawEvents, rules]);

  const summary = useMemo(() => summarizePortfolio(enrichedPlayers, reviews), [enrichedPlayers, reviews]);
  const filteredPlayers = enrichedPlayers.filter((player) => {
    const haystack = `${player.id} ${player.country} ${player.segment} ${player.flags.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  function handleCsvImport(text) {
    const rows = parseCsv(text);
    const importedPlayers = mapRowsToPlayers(rows);
    const importedEvents = mapRowsToEvents(rows);
    const enrichedImportedPlayers = importedPlayers.map((player) => calculatePlayerRisk(player, importedEvents.filter((event) => event.playerId === player.id), rules));

    setRawPlayers(importedPlayers);
    setRawEvents(importedEvents);
    setReviews(buildReviewsFromPlayers(enrichedImportedPlayers));
    setActiveTab('Dashboard');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">RG</div>
          <div>
            <h1>Northbridge RiskGuard</h1>
            <p>RG Monitor MVP</p>
          </div>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Validation demo</strong>
          <span>Mock or imported sample data only. No gambling functionality.</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">B2B risk, responsible gaming & compliance console</p>
            <h2>{activeTab}</h2>
          </div>
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player ID, segment, flags..." />
          </div>
        </header>

        {activeTab === 'Dashboard' && <Dashboard summary={summary} players={enrichedPlayers} reviews={reviews} />}
        {activeTab === 'Players' && <PlayersTable players={filteredPlayers} />}
        {activeTab === 'Review Queue' && <ReviewQueue reviews={reviews} players={enrichedPlayers} />}
        {activeTab === 'Events' && <EventsTable events={rawEvents} />}
        {activeTab === 'Reports' && <Reports players={enrichedPlayers} summary={summary} />}
        {activeTab === 'Rules' && <Rules rules={rules} setRules={setRules} />}
        {activeTab === 'Import CSV' && <ImportCsv onImport={handleCsvImport} />}
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value, tone }) {
  return (
    <div className={`metric-card ${tone || ''}`}>
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Dashboard({ summary, players, reviews }) {
  const topRisks = [...players].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  return (
    <section className="stack">
      <div className="metrics-grid">
        <MetricCard icon={<UsersRound />} label="Players monitored" value={summary.totalPlayers} />
        <MetricCard icon={<ShieldAlert />} label="High risk" value={summary.highRiskPlayers} tone="danger" />
        <MetricCard icon={<AlertTriangle />} label="Medium risk" value={summary.mediumRiskPlayers} tone="warning" />
        <MetricCard icon={<Gauge />} label="Avg risk score" value={summary.averageRiskScore} />
        <MetricCard icon={<BarChart3 />} label="Open reviews" value={summary.openReviews} />
        <MetricCard icon={<CheckCircle2 />} label="Responsible actions" value={summary.responsibleActions} />
      </div>

      <div className="two-col">
        <Panel title="Highest risk players" subtitle="Players requiring risk/compliance attention">
          {topRisks.map((player) => <PlayerCard key={player.id} player={player} />)}
        </Panel>
        <Panel title="Open review queue" subtitle="Manual checks suggested by RiskGuard">
          {reviews.filter((review) => review.status !== 'Closed').map((review) => <ReviewCard key={review.id} review={review} player={players.find((player) => player.id === review.playerId)} />)}
        </Panel>
      </div>
    </section>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function RiskBadge({ level }) {
  return <span className={`risk-badge ${level.toLowerCase()}`}>{level}</span>;
}

function PlayerCard({ player }) {
  return (
    <article className="player-card">
      <div className="card-title-line">
        <div>
          <h4>{player.id}</h4>
          <p>{player.country} · {player.segment}</p>
        </div>
        <RiskBadge level={player.riskLevel} />
      </div>
      <div className="score-line"><span>Risk score</span><strong>{player.riskScore}</strong></div>
      <div className="flags">{player.flags.map((flag) => <span key={flag}>{flag}</span>)}</div>
      <div className="recommended-action">{player.recommendedAction}</div>
    </article>
  );
}

function ReviewCard({ review, player }) {
  return (
    <article className="review-card">
      <div className="card-title-line">
        <div>
          <h4>{review.title}</h4>
          <p>{review.owner} · {review.status}</p>
        </div>
        <RiskBadge level={player?.riskLevel || 'Low'} />
      </div>
      <p>{review.summary}</p>
      <small>Player: {review.playerId} · Due: {review.dueDate}</small>
    </article>
  );
}

function PlayersTable({ players }) {
  return (
    <Panel title="Player risk table" subtitle="Risk score, flags, activity and recommended action">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Player</th><th>Risk</th><th>Segment</th><th>Deposits</th><th>Losses</th><th>Session</th><th>Flags</th><th>Recommended action</th></tr></thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id}>
                <td><strong>{player.id}</strong><small>{player.country}</small></td>
                <td><RiskBadge level={player.riskLevel} /><small>{player.riskScore}</small></td>
                <td>{player.segment}</td>
                <td>${player.totalDeposits}</td>
                <td>${player.netLoss}</td>
                <td>{player.sessionMinutes} min</td>
                <td>{player.flags.join(', ')}</td>
                <td>{player.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ReviewQueue({ reviews, players }) {
  return (
    <Panel title="Review queue" subtitle="Manual checks for risk, responsible gaming, fraud and bonus abuse">
      <div className="card-grid">
        {reviews.map((review) => <ReviewCard key={review.id} review={review} player={players.find((player) => player.id === review.playerId)} />)}
      </div>
    </Panel>
  );
}

function EventsTable({ events }) {
  return (
    <Panel title="Events timeline" subtitle="Sample or imported player events used by the MVP risk engine">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Time</th><th>Player</th><th>Type</th><th>Amount</th><th>Metadata</th></tr></thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.timestamp}</td><td>{event.playerId}</td><td>{event.type}</td><td>{event.amount ? `$${event.amount}` : '—'}</td><td>{event.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Reports({ summary }) {
  return (
    <section className="stack">
      <Panel title="Compliance summary" subtitle="Export-ready narrative for validation conversations">
        <div className="report-box">
          <h4>RiskGuard daily summary</h4>
          <p>{summary.highRiskPlayers} high-risk players and {summary.mediumRiskPlayers} medium-risk players were detected in the current portfolio. RiskGuard recommends manual review for high-risk cases and responsible gaming actions where loss-chasing, long sessions or deposit spikes are detected.</p>
          <p>This demo is designed for iGaming risk, compliance and operations teams. It does not provide gambling functionality and uses mock or imported sample data only.</p>
        </div>
      </Panel>
      <Panel title="Suggested next product modules">
        <ul className="clean-list">
          <li>Player profile with risk explanation timeline</li>
          <li>Case notes and audit trail</li>
          <li>Responsible gaming intervention templates</li>
          <li>API data ingestion</li>
          <li>Team roles and review ownership</li>
        </ul>
      </Panel>
    </section>
  );
}

function Rules({ rules, setRules }) {
  function updateRule(id, field, value) {
    setRules((current) => current.map((rule) => rule.id === id ? { ...rule, [field]: field === 'threshold' || field === 'points' ? Number(value) : value } : rule));
  }

  function resetRules() {
    setRules(defaultRiskRules);
  }

  return (
    <Panel title="Configurable risk rules" subtitle="Tune thresholds and points for validation scenarios">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Rule</th><th>Category</th><th>Field</th><th>Threshold</th><th>Points</th><th>Description</th></tr></thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td><strong>{rule.label}</strong></td>
                <td>{rule.category}</td>
                <td>{rule.field}</td>
                <td><input className="inline-input" type="number" value={rule.threshold} onChange={(event) => updateRule(rule.id, 'threshold', event.target.value)} /></td>
                <td><input className="inline-input" type="number" value={rule.points} onChange={(event) => updateRule(rule.id, 'points', event.target.value)} /></td>
                <td>{rule.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="primary-button" onClick={resetRules}>Reset default rules</button>
    </Panel>
  );
}

function ImportCsv({ onImport }) {
  const [csvText, setCsvText] = useState(sampleCsv);

  return (
    <Panel title="Import CSV" subtitle="Paste sample player-event CSV and recalculate portfolio risk">
      <div className="import-layout">
        <div className="import-box compact">
          <Upload size={34} />
          <h3>CSV event import</h3>
          <p>Expected fields: player_id, timestamp, event_type, amount, session_minutes, country, segment, meta.</p>
          <button className="primary-button" onClick={() => onImport(csvText)}>Import and recalculate</button>
        </div>
        <textarea className="csv-textarea" value={csvText} onChange={(event) => setCsvText(event.target.value)} />
      </div>
    </Panel>
  );
}

createRoot(document.getElementById('root')).render(<App />);
