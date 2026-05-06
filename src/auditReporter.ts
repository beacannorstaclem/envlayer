/**
 * auditReporter.ts — Formats and exports audit logs in various output formats
 */

import { AuditEvent, AuditLog, auditSummary } from './audit';

export type ReportFormat = 'text' | 'json' | 'csv';

function formatTimestamp(ts: number): string {
  return new Date(ts).toISOString();
}

function eventToRow(event: AuditEvent): string {
  const layer = event.layer ?? '-';
  const prev = event.previousValue ?? '-';
  const curr = event.currentValue ?? '-';
  return `${formatTimestamp(event.timestamp)}  [${event.type.toUpperCase().padEnd(10)}]  ${event.key.padEnd(24)}  layer=${layer}  prev=${prev}  curr=${curr}`;
}

export function reportText(log: AuditLog): string {
  if (log.events.length === 0) return 'No audit events recorded.';
  const lines = log.events.map(eventToRow);
  const summary = auditSummary(log);
  const summaryLine = Object.entries(summary)
    .map(([k, v]) => `${k}=${v}`)
    .join('  ');
  return [...lines, '', `Summary: ${summaryLine}`].join('\n');
}

export function reportJson(log: AuditLog): string {
  return JSON.stringify(
    {
      events: log.events,
      summary: auditSummary(log),
    },
    null,
    2
  );
}

export function reportCsv(log: AuditLog): string {
  const header = 'timestamp,type,key,layer,previousValue,currentValue';
  const rows = log.events.map((e) =>
    [
      formatTimestamp(e.timestamp),
      e.type,
      e.key,
      e.layer ?? '',
      e.previousValue ?? '',
      e.currentValue ?? '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header, ...rows].join('\n');
}

export function generateReport(log: AuditLog, format: ReportFormat = 'text'): string {
  switch (format) {
    case 'json': return reportJson(log);
    case 'csv':  return reportCsv(log);
    default:     return reportText(log);
  }
}
