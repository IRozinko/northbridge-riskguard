import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, BarChart3, CheckCircle2, Gauge, Search, ShieldAlert, Upload, UsersRound, X } from 'lucide-react';
import { players as seedPlayers, events as seedEvents, reviews as seedReviews } from './mockData.js';
import { calculatePlayerRisk, summarizePortfolio, buildReviewsFromPlayers } from './riskEngine.js';
import { defaultRiskRules } from './riskRules.js';
import { mapRowsToEvents, mapRowsToPlayers, parseCsv, sampleCsv } from './csvUtils.js';
import { getTemplateByDecision, interventionTemplates } from './interventionTemplates.js';
import { buildRiskReport, downloadMarkdownReport } from './reportUtils.js';
import './styles.css';

const tabs = ['Dashboard', 'Players', 'Review Queue', 'Events', 'Reports', 'Rules', 'Templates', 'Import CSV'];
const reviewStatuses = ['Open', 'In progress', 'Action suggested', 'Closed'];
const reviewDecisions = ['No decision yet', 'Monitor', 'Responsible gaming message', 'Suggest limits', 'Cooling-off review', 'Fraud review', 'Close as false positive'];

function normalizeReviews(items) {
  return items.map((review) => ({
    notes: '',
    decision: 'No decision yet',
    auditTrail: [{ at: new Date().toISOString(), action: 'Case created', by: review.owner || 'RiskGuard' }],
    ...review,
  }));
}

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [query, setQuery] = useState('');
  const [rawPlayers, setRawPlayers] = useState(seedPlayers);
  const [rawEvents, setRawEvents] = useState(seedEvents);
  const [reviews, setReviews] = useState(normalizeReviews(seedReviews));
  const [rules, setRules] = useState(defaultRiskRules);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const enrichedPlayers = useMemo(
    () => rawPlayers.map((player) => calculatePlayerRisk(player, rawEvents.filter((event) => event.playerId === player.id), rules)),
    [rawPlayers, rawEvents, rules]
  );

  const summary = useMemo(() => summarizePortfolio(enrichedPlayers, reviews), [enrichedPlayers, reviews]);
  const filteredPlayers = enrichedPlayers.filter((player) => `${player.id} ${player.country} ${player.segment} ${player.flags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));

  function handleCsvImport(text) {
    const rows = parseCsv(text);
    const importedPlayers = mapRowsToPlayers(rows);
    const importedEvents = mapRowsToEvents(rows);
    const enrichedImportedPlayers = importedPlayers.map((player) => calculatePlayerRisk(player, importedEvents.filter((event) => event.playerId === player.id), rules));
    setRawPlayers(importedPlayers);
    setRawEvents(importedEvents);
    setReviews(normalizeReviews(buildReviewsFromPlayers(enrichedImportedPlayers)));
    setSelectedPlayer(null);
    setActiveTab('Dashboard');
  }

  function updateReviewCase(reviewId, patch) {
    setReviews((current) => current.map((review) => {
      if (review.id !== reviewId) return review;
      const changes = Object.entries(patch).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${value}`).join('; ');
      return {
        ...review,
        ...patch,
        auditTrail: [
          ...(review.auditTrail || []),
          { at: new Date().toISOString(), action: `Case updated${changes ? ` — ${changes}` : ''}`, by: 'Risk analyst' },
        ],
      };
    }));
  }

  const selectedPlayerEvents = selectedPlayer ? rawEvents.filter((event) => event.playerId === selectedPlayer.id) : [];
  const selectedPlayerReviews = selectedPlayer ? reviews.filter((review) => review.playerId === selectedPlayer.id) : [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">RG</div><div><h1>Northbridge RiskGuard</h1><p>RG Monitor MVP</p></div></div>
        <nav>{tabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
        <div className="sidebar-note"><strong>Validation demo</strong><span>Mock or imported sample data only. No gambling functionality.</span></div>
      </aside>

      <main className="main">
        <header className="topbar"><div><p className="eyebrow">B2B risk, responsible gaming & compliance console</p><h2>{activeTab}</h2></div><div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player ID, segment, flags..." /></div></header>
        {activeTab === 'Dashboard' && <Dashboard summary={summary} players={enrichedPlayers} reviews={reviews} onSelectPlayer={setSelectedPlayer} />}
        {activeTab === 'Players' && <PlayersTable players={filteredPlayers} onSelectPlayer={setSelectedPlayer} />}
        {activeTab === 'Review Queue' && <ReviewQueue reviews={reviews} players={enrichedPlayers} onSelectPlayer={setSelectedPlayer} updateReviewCase={updateReviewCase} />}
        {activeTab === 'Events' && <EventsTable events={rawEvents} onSelectPlayerById={(playerId) => setSelectedPlayer(enrichedPlayers.find((player) => player.id === playerId))} />}
        {activeTab === 'Reports' && <Reports summary={summary} players={enrichedPlayers} reviews={reviews} events={rawEvents} />}
        {activeTab === 'Rules' && <Rules rules={rules} setRules={setRules} />}
        {activeTab === 'Templates' && <Templates />}
        {activeTab === 'Import CSV' && <ImportCsv onImport={handleCsvImport} />}
      </main>

      {selectedPlayer && <PlayerProfileModal player={selectedPlayer} events={selectedPlayerEvents} reviews={selectedPlayerReviews} onClose={() => setSelectedPlayer(null)} updateReviewCase={updateReviewCase} />}
    </div>
  );
}

function MetricCard({ icon, label, value, tone }) {
  return <div className={`metric-card ${tone || ''}`}><div className="metric-icon">{icon}</div><div><p>{label}</p><strong>{value}</strong></div></div>;
}

function Panel({ title, subtitle, children }) {
  return <section className="panel"><div className="panel-header"><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{children}</section>;
}

function RiskBadge({ level }) {
  return <span className={`risk-badge ${level.toLowerCase()}`}>{level}</span>;
}

function Dashboard({ summary, players, reviews, onSelectPlayer }) {
  const topRisks = [...players].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  return <section className="stack"><div className="metrics-grid"><MetricCard icon={<UsersRound />} label="Players monitored" value={summary.totalPlayers} /><MetricCard icon={<ShieldAlert />} label="High risk" value={summary.highRiskPlayers} tone="danger" /><MetricCard icon={<AlertTriangle />} label="Medium risk" value={summary.mediumRiskPlayers} tone="warning" /><MetricCard icon={<Gauge />} label="Avg risk score" value={summary.averageRiskScore} /><MetricCard icon={<BarChart3 />} label="Open reviews" value={summary.openReviews} /><MetricCard icon={<CheckCircle2 />} label="Responsible actions" value={summary.responsibleActions} /></div><div className="two-col"><Panel title="Highest risk players" subtitle="Players requiring risk/compliance attention">{topRisks.map((player) => <PlayerCard key={player.id} player={player} onClick={() => onSelectPlayer(player)} />)}</Panel><Panel title="Open review queue" subtitle="Manual checks suggested by RiskGuard">{reviews.filter((review) => review.status !== 'Closed').map((review) => <ReviewCard key={review.id} review={review} player={players.find((player) => player.id === review.playerId)} onSelectPlayer={onSelectPlayer} />)}</Panel></div></section>;
}

function PlayerCard({ player, onClick }) {
  return <article className="player-card clickable" onClick={onClick}><div className="card-title-line"><div><h4>{player.id}</h4><p>{player.country} · {player.segment}</p></div><RiskBadge level={player.riskLevel} /></div><div className="score-line"><span>Risk score</span><strong>{player.riskScore}</strong></div><div className="flags">{player.flags.map((flag) => <span key={flag}>{flag}</span>)}</div><div className="recommended-action">{player.recommendedAction}</div></article>;
}

function ReviewCard({ review, player, onSelectPlayer }) {
  const template = getTemplateByDecision(review.decision);
  return <article className="review-card clickable" onClick={() => player && onSelectPlayer?.(player)}><div className="card-title-line"><div><h4>{review.title}</h4><p>{review.owner} · {review.status}</p></div><RiskBadge level={player?.riskLevel || 'Low'} /></div><p>{review.summary}</p><small>Player: {review.playerId} · Decision: {review.decision || 'No decision yet'} · Template: {template.title}</small></article>;
}

function PlayersTable({ players, onSelectPlayer }) {
  return <Panel title="Player risk table" subtitle="Risk score, flags, activity and recommended action"><div className="table-wrap"><table><thead><tr><th>Player</th><th>Risk</th><th>Segment</th><th>Deposits</th><th>Losses</th><th>Session</th><th>Flags</th><th>Recommended action</th></tr></thead><tbody>{players.map((player) => <tr key={player.id} className="clickable-row" onClick={() => onSelectPlayer(player)}><td><strong>{player.id}</strong><small>{player.country}</small></td><td><RiskBadge level={player.riskLevel} /><small>{player.riskScore}</small></td><td>{player.segment}</td><td>${player.totalDeposits}</td><td>${player.netLoss}</td><td>{player.sessionMinutes} min</td><td>{player.flags.join(', ')}</td><td>{player.recommendedAction}</td></tr>)}</tbody></table></div></Panel>;
}

function ReviewQueue({ reviews, players, onSelectPlayer, updateReviewCase }) {
  return <Panel title="Review queue" subtitle="Manual checks for risk, responsible gaming, fraud and bonus abuse"><div className="card-grid">{reviews.map((review) => <div className="case-card" key={review.id}><ReviewCard review={review} player={players.find((player) => player.id === review.playerId)} onSelectPlayer={onSelectPlayer} /><div className="case-actions"><select value={review.status} onChange={(event) => updateReviewCase(review.id, { status: event.target.value })}>{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select><select value={review.decision || 'No decision yet'} onChange={(event) => updateReviewCase(review.id, { decision: event.target.value, status: event.target.value === 'No decision yet' ? review.status : 'Action suggested' })}>{reviewDecisions.map((decision) => <option key={decision}>{decision}</option>)}</select></div><InterventionPreview decision={review.decision} /></div>)}</div></Panel>;
}

function EventsTable({ events, onSelectPlayerById }) {
  return <Panel title="Events timeline" subtitle="Sample or imported player events used by the MVP risk engine"><div className="table-wrap"><table><thead><tr><th>Time</th><th>Player</th><th>Type</th><th>Amount</th><th>Metadata</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="clickable-row" onClick={() => onSelectPlayerById(event.playerId)}><td>{event.timestamp}</td><td>{event.playerId}</td><td>{event.type}</td><td>{event.amount ? `$${event.amount}` : '—'}</td><td>{event.meta}</td></tr>)}</tbody></table></div></Panel>;
}

function Reports({ summary, players, reviews, events }) {
  const report = buildRiskReport({ summary, players, reviews, events });
  return <section className="stack"><Panel title="Compliance summary" subtitle="Export-ready narrative for validation conversations"><div className="report-box"><h4>RiskGuard daily summary</h4><p>{summary.highRiskPlayers} high-risk players and {summary.mediumRiskPlayers} medium-risk players were detected in the current portfolio. RiskGuard recommends manual review for high-risk cases and responsible gaming actions where loss-chasing, long sessions or deposit spikes are detected.</p><p>Open cases: {reviews.filter((review) => review.status !== 'Closed').length}. Closed cases: {reviews.filter((review) => review.status === 'Closed').length}. Action suggested: {reviews.filter((review) => review.status === 'Action suggested').length}.</p><p>This demo is designed for iGaming risk, compliance and operations teams. It does not provide gambling functionality and uses mock or imported sample data only.</p><button className="primary-button" onClick={() => downloadMarkdownReport(report)}>Export markdown report</button></div></Panel><Panel title="Report preview" subtitle="Markdown generated from current portfolio state"><textarea className="report-preview" readOnly value={report} /></Panel><Panel title="Suggested next product modules"><ul className="clean-list"><li>API data ingestion</li><li>Team roles and review ownership</li><li>Exportable PDF compliance reports</li><li>Jurisdiction-specific RG policies</li></ul></Panel></section>;
}

function Rules({ rules, setRules }) {
  function updateRule(id, field, value) { setRules((current) => current.map((rule) => rule.id === id ? { ...rule, [field]: field === 'threshold' || field === 'points' ? Number(value) : value } : rule)); }
  return <Panel title="Configurable risk rules" subtitle="Tune thresholds and points for validation scenarios"><div className="table-wrap"><table><thead><tr><th>Rule</th><th>Category</th><th>Field</th><th>Threshold</th><th>Points</th><th>Description</th></tr></thead><tbody>{rules.map((rule) => <tr key={rule.id}><td><strong>{rule.label}</strong></td><td>{rule.category}</td><td>{rule.field}</td><td><input className="inline-input" type="number" value={rule.threshold} onChange={(event) => updateRule(rule.id, 'threshold', event.target.value)} /></td><td><input className="inline-input" type="number" value={rule.points} onChange={(event) => updateRule(rule.id, 'points', event.target.value)} /></td><td>{rule.description}</td></tr>)}</tbody></table></div><button className="primary-button" onClick={() => setRules(defaultRiskRules)}>Reset default rules</button></Panel>;
}

function Templates() {
  return <Panel title="Responsible gaming intervention templates" subtitle="Policy-safe suggested actions for case decisions"><div className="template-grid">{interventionTemplates.map((template) => <TemplateCard key={template.id} template={template} />)}</div></Panel>;
}

function TemplateCard({ template }) {
  return <article className="template-card"><div className="card-title-line"><div><h4>{template.title}</h4><p>{template.decision} · {template.severity}</p></div></div><p>{template.goal}</p><h5>Internal checklist</h5><ul>{template.internalChecklist.map((item) => <li key={item}>{item}</li>)}</ul><h5>Player-facing message</h5><div className="message-preview">{template.operatorMessage}</div></article>;
}

function InterventionPreview({ decision }) {
  const template = getTemplateByDecision(decision);
  if (!decision || decision === 'No decision yet') return null;
  return <div className="intervention-preview"><strong>{template.title}</strong><p>{template.goal}</p></div>;
}

function ImportCsv({ onImport }) {
  const [csvText, setCsvText] = useState(sampleCsv);
  return <Panel title="Import CSV" subtitle="Paste sample player-event CSV and recalculate portfolio risk"><div className="import-layout"><div className="import-box compact"><Upload size={34} /><h3>CSV event import</h3><p>Expected fields: player_id, timestamp, event_type, amount, session_minutes, country, segment, meta.</p><button className="primary-button" onClick={() => onImport(csvText)}>Import and recalculate</button></div><textarea className="csv-textarea" value={csvText} onChange={(event) => setCsvText(event.target.value)} /></div></Panel>;
}

function CaseManagement({ review, updateReviewCase }) {
  const [notes, setNotes] = useState(review.notes || '');
  const template = getTemplateByDecision(review.decision);
  function applyTemplate() {
    const nextNotes = `${notes ? `${notes}\n\n` : ''}Suggested intervention: ${template.title}\nGoal: ${template.goal}\nChecklist:\n- ${template.internalChecklist.join('\n- ')}\n\nPlayer-facing message:\n${template.operatorMessage}`;
    setNotes(nextNotes);
    updateReviewCase(review.id, { notes: nextNotes, status: 'Action suggested' });
  }
  return <div className="case-management"><div className="case-form-row"><label><span>Status</span><select value={review.status} onChange={(event) => updateReviewCase(review.id, { status: event.target.value })}>{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label><span>Decision</span><select value={review.decision || 'No decision yet'} onChange={(event) => updateReviewCase(review.id, { decision: event.target.value, status: event.target.value === 'No decision yet' ? review.status : 'Action suggested' })}>{reviewDecisions.map((decision) => <option key={decision}>{decision}</option>)}</select></label></div><InterventionPreview decision={review.decision} /><label className="case-notes"><span>Case notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add risk/compliance notes, decision rationale or next action..." /></label><div className="button-row"><button className="primary-button" onClick={() => updateReviewCase(review.id, { notes })}>Save notes</button>{review.decision !== 'No decision yet' && <button className="secondary-button" onClick={applyTemplate}>Apply template to notes</button>}</div><div className="audit-trail"><h4>Audit trail</h4>{(review.auditTrail || []).map((item, index) => <div className="audit-item" key={`${item.at}-${index}`}><span>{new Date(item.at).toLocaleString()}</span><strong>{item.action}</strong><small>{item.by}</small></div>)}</div></div>;
}

function PlayerProfileModal({ player, events, reviews, onClose, updateReviewCase }) {
  return <div className="modal-backdrop"><div className="player-modal"><div className="modal-header"><div><p className="eyebrow">Player profile</p><h3>{player.id}</h3><span>{player.country} · {player.segment} · Last activity: {player.lastActivity || '—'}</span></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="profile-grid"><div className="profile-summary-card"><RiskBadge level={player.riskLevel} /><strong>{player.riskScore}</strong><span>Risk score</span></div><div className="profile-kpi"><span>Deposits</span><strong>${player.totalDeposits}</strong></div><div className="profile-kpi"><span>Net loss</span><strong>${player.netLoss}</strong></div><div className="profile-kpi"><span>Session time</span><strong>{player.sessionMinutes} min</strong></div><div className="profile-kpi"><span>Failed withdrawals</span><strong>{player.failedWithdrawals}</strong></div><div className="profile-kpi"><span>Bonus claims</span><strong>{player.bonusClaims}</strong></div></div><div className="two-col modal-two-col"><Panel title="Risk explanation" subtitle="Triggered rules and why the player was flagged">{player.triggeredRules?.length ? player.triggeredRules.map((rule) => <div className="rule-explanation" key={rule.id}><div className="card-title-line"><strong>{rule.label}</strong><span>+{rule.points}</span></div><p>{rule.description}</p><small>{rule.field} {rule.operator} {rule.threshold}</small></div>) : <p className="muted">No risk rules triggered.</p>}</Panel><Panel title="Recommended action" subtitle="Suggested responsible next step"><div className="recommended-action large">{player.recommendedAction}</div><div className="flags">{player.flags.map((flag) => <span key={flag}>{flag}</span>)}</div></Panel></div><div className="two-col modal-two-col"><Panel title="Event timeline" subtitle="Events connected to this player"><div className="mini-timeline">{events.length ? events.map((event) => <div className="mini-timeline-item" key={event.id}><span>{event.timestamp}</span><strong>{event.type}{event.amount ? ` · $${event.amount}` : ''}</strong><p>{event.meta}</p></div>) : <p className="muted">No events available.</p>}</div></Panel><Panel title="Case management" subtitle="Review status, decision, notes and audit trail">{reviews.length ? reviews.map((review) => <div className="review-context" key={review.id}><div className="card-title-line"><strong>{review.title}</strong><span>{review.status}</span></div><p>{review.summary}</p><small>{review.owner} · Due: {review.dueDate}</small><CaseManagement review={review} updateReviewCase={updateReviewCase} /></div>) : <p className="muted">No review case yet.</p>}</Panel></div></div></div>;
}

createRoot(document.getElementById('root')).render(<App />);
