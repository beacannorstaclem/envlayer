import {
  recordEvent,
  getAuditLog,
  clearAuditLog,
  filterAuditLog,
  auditSummary,
} from './audit';

beforeEach(() => {
  clearAuditLog();
});

describe('recordEvent', () => {
  it('records a basic resolved event', () => {
    const event = recordEvent('resolved', 'API_URL', { layer: 'production', currentValue: 'https://api.example.com' });
    expect(event.type).toBe('resolved');
    expect(event.key).toBe('API_URL');
    expect(event.layer).toBe('production');
    expect(event.currentValue).toBe('https://api.example.com');
    expect(event.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('appends multiple events to the log', () => {
    recordEvent('resolved', 'KEY_A');
    recordEvent('missing', 'KEY_B');
    recordEvent('coerced', 'KEY_C');
    expect(getAuditLog().events).toHaveLength(3);
  });
});

describe('getAuditLog', () => {
  it('returns a copy of the log', () => {
    recordEvent('resolved', 'X');
    const log1 = getAuditLog();
    recordEvent('missing', 'Y');
    const log2 = getAuditLog();
    expect(log1.events).toHaveLength(1);
    expect(log2.events).toHaveLength(2);
  });
});

describe('clearAuditLog', () => {
  it('empties the log', () => {
    recordEvent('resolved', 'A');
    clearAuditLog();
    expect(getAuditLog().events).toHaveLength(0);
  });
});

describe('filterAuditLog', () => {
  it('filters events by type', () => {
    recordEvent('resolved', 'A');
    recordEvent('missing', 'B');
    recordEvent('resolved', 'C');
    const filtered = filterAuditLog((e) => e.type === 'resolved');
    expect(filtered.events).toHaveLength(2);
    expect(filtered.events.every((e) => e.type === 'resolved')).toBe(true);
  });

  it('filters events by key', () => {
    recordEvent('resolved', 'DB_HOST');
    recordEvent('masked', 'DB_PASS');
    const filtered = filterAuditLog((e) => e.key.startsWith('DB_'));
    expect(filtered.events).toHaveLength(2);
  });
});

describe('auditSummary', () => {
  it('counts each event type correctly', () => {
    recordEvent('resolved', 'A');
    recordEvent('resolved', 'B');
    recordEvent('missing', 'C');
    recordEvent('coerced', 'D');
    recordEvent('masked', 'E');
    recordEvent('overridden', 'F');
    const summary = auditSummary(getAuditLog());
    expect(summary.resolved).toBe(2);
    expect(summary.missing).toBe(1);
    expect(summary.coerced).toBe(1);
    expect(summary.masked).toBe(1);
    expect(summary.overridden).toBe(1);
  });

  it('returns zeros for empty log', () => {
    const summary = auditSummary(getAuditLog());
    expect(Object.values(summary).every((v) => v === 0)).toBe(true);
  });
});
