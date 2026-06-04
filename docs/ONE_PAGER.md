# Northbridge RiskGuard — Validation One-Pager

## Short description

Northbridge RiskGuard is a lightweight B2B risk, responsible gaming and compliance monitoring console for iGaming operators.

The current MVP focuses on **RG Monitor**: detecting high-risk player behavior, creating review cases, suggesting policy-safe interventions, keeping audit trail, and exporting a compliance/risk report.

## Problem

Risk, compliance and operations teams in iGaming often have to review player behavior across fragmented data sources:

- deposits and withdrawals;
- session duration;
- loss chasing signals;
- late-night activity;
- bonus abuse patterns;
- failed withdrawals;
- manual notes and decisions;
- responsible gaming actions.

The pain is not only detection. The bigger operational gap is turning signals into a structured review workflow with decision history, safe intervention templates and exportable evidence.

## Product idea

RiskGuard helps teams move from raw events to structured review:

```text
CSV / API events
→ risk scoring
→ triggered rules
→ review queue
→ player profile
→ case decision
→ intervention template
→ notes / audit trail
→ exportable compliance report
```

## MVP features

- Dashboard with portfolio-level risk metrics.
- Player risk table.
- Configurable risk rules.
- CSV import for player events.
- Player profile with risk explanation and event timeline.
- Review queue and case management.
- Case statuses and decisions.
- Responsible gaming intervention templates.
- Notes and audit trail.
- Markdown report export.

## Risk signals in MVP

- deposit spike;
- loss chasing;
- long session;
- late night activity;
- high deposit frequency;
- failed withdrawals;
- bonus abuse pattern.

## Target users

- Head of Risk;
- Compliance Manager;
- Responsible Gaming Manager;
- Fraud Manager;
- Head of Payments;
- COO / Operations Manager.

## What we want to validate

1. Is this workflow painful enough to pay for?
2. Which team owns this process: Risk, Compliance, RG, Fraud, Payments, or Ops?
3. What data sources are usually available?
4. Is CSV upload useful for pilot, or API integration is mandatory?
5. Which risk signals are actually important?
6. Which reports are needed for internal review or regulator-facing evidence?
7. What would make this worth a paid pilot?

## Pilot concept

A lightweight pilot could be structured as:

- 1–2 weeks;
- anonymized CSV sample data;
- configurable rules;
- review queue setup;
- 1–2 operator-specific templates;
- risk/compliance summary report;
- feedback session with Risk/Compliance/Ops.

## Important positioning

RiskGuard does **not** provide gambling functionality.

It is a risk, responsible gaming, fraud and compliance workflow tool for operators that want better operational visibility, safer interventions and clearer audit trail.
