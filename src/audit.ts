/**
 * audit.ts — Tracks resolution events and changes to environment variables
 */

export type AuditEventType = 'resolved' | 'overridden' | 'missing' | 'coerced' | 'masked';

export interface AuditEvent {
  timestamp: number;
  type: AuditEventType;
  key: string;
  layer?: string;
  previousValue?: string;
  currentValue?: string;
  meta?: Record<string, unknown>;
}

export interface AuditLog {
  events: AuditEvent[];
}

const _log: AuditEvent[] = [];

export function recordEvent(
  type: AuditEventType,
  key: string,
  options: Omit<AuditEvent, 'timestamp' | 'type' | 'key'> = {}
): AuditEvent {
  const event: AuditEvent = {
    timestamp: Date.now(),
    type,
    key,
    ...options,
  };
  _log.push(event);
  return event;
}

export function getAuditLog(): AuditLog {
  return { events: [..._log] };
}

export function clearAuditLog(): void {
  _log.splice(0, _log.length);
}

export function filterAuditLog(
  predicate: (event: AuditEvent) => boolean
): AuditLog {
  return { events: _log.filter(predicate) };
}

export function auditSummary(log: AuditLog): Record<AuditEventType, number> {
  const summary: Record<AuditEventType, number> = {
    resolved: 0,
    overridden: 0,
    missing: 0,
    coerced: 0,
    masked: 0,
  };
  for (const event of log.events) {
    summary[event.type]++;
  }
  return summary;
}
