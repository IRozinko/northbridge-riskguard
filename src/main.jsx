import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, BarChart3, CheckCircle2, FileText, Gauge, Search, ShieldAlert, Upload, UsersRound } from 'lucide-react';
import { players, events, reviews } from './mockData.js';
import { calculatePlayerRisk, summarizePortfolio } from './riskEngine.js';
import './styles.css';

const tabs = ['Dashboard', 'Players', 'Review Queue', 'Events', 'Reports', 'Import CSV'];

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [query, setQuery] = useState('');

  const enrichedPlayers = useMemo(() => {
    return players.map((player) => calculatePlayerRisk(player, events.filter((event) => event.playerId === player.id)));
  }, []);

  const summary = useMemo(() => summarizePortfolio(enrichedPlayers, reviews), [enrichedPlayers]);
  const filteredPlayers = enrichedPlayers.filter((player) => {
    const haystack = `${player.id} ${player.country} ${player.segment} ${player.flags.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

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
          <span>Mock data only. No real player data. No gambling functionality.</span>
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
        {activeTab === 'Events' && <EventsTable events={events} />}
        {activeTab === 'Reports' && <Reports players={enrichedPlayers} summary={summary} />}
        {activeTab === 'Import CSV' && <ImportCsv />}
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
    <Panel title="Events timeline" subtitle="Sample player events used by the MVP risk engine">
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

function Reports({ players, summary }) {
  return (
    <section className="stack">
      <Panel title="Compliance summary" subtitle="Export-ready narrative for validation conversations">
        <div className="report-box">
          <h4>RiskGuard daily summary</h4>
          <p>{summary.highRiskPlayers} high-risk players and {summary.mediumRiskPlayers} medium-risk players were detected in the sample portfolio. RiskGuard recommends manual review for high-risk cases and responsible gaming actions where loss-chasing, long sessions or deposit spikes are detected.</p>
          <p>This demo is designed for iGaming risk, compliance and operations teams. It does not provide gambling functionality and uses mock data only.</p>
        </div>
      </Panel>
      <Panel title="Suggested next product modules">
        <ul className="clean-list">
          <li>CSV import and field mapping</li>
          <li>Player profile with risk explanation timeline</li>
          <li>Configurable risk rules</li>
          <li>Case notes and audit trail</li>
          <li>Responsible gaming intervention templates</li>
        </ul>
      </Panel>
    </section>
  );
}

function ImportCsv() {
  return (
    <Panel title="Import CSV" subtitle="Planned MVP workflow">
      <div className="import-box">
        <Upload size={34} />
        <h3>CSV import is planned for the next iteration</h3>
        <p>Expected fields: player_id, timestamp, event_type, amount, session_minutes, bonus_id, payment_status, country, segment.</p>
      </div>
    </Panel>
  );
}

createRoot(document.getElementById('root')).render(<App />);
