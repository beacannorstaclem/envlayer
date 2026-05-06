import { clearAuditLog, getAuditLog, recordEvent } from './audit';
import { generateReport, reportCsv, reportJson, reportText } from './auditReporter';

beforeEach(() => {
  clearAuditLog();
});

describe('reportText', () => {
  it('returns placeholder for empty log', () => {
    expect(reportText(getAuditLog())).toBe('No audit events recorded.');
  });

  it('includes event type and key', () => {
    recordEvent('resolved', 'API_URL', { layer: 'base', currentValue: 'http://localhost' });
    const output = reportText(getAuditLog());
    expect(output).toContain('RESOLVED');
    expect(output).toContain('API_URL');
    expect(output).toContain('http://localhost');
  });

  it('includes summary line', () => {
    recordEvent('missing', 'MISSING_KEY');
    const output = reportText(getAuditLog());
    expect(output).toContain('Summary:');
    expect(output).toContain('missing=1');
  });
});

describe('reportJson', () => {
  it('returns valid JSON with events and summary', () => {
    recordEvent('coerced', 'PORT', { currentValue: '3000' });
    const output = reportJson(getAuditLog());
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('events');
    expect(parsed).toHaveProperty('summary');
    expect(parsed.events).toHaveLength(1);
    expect(parsed.summary.coerced).toBe(1);
  });

  it('handles empty log', () => {
    const parsed = JSON.parse(reportJson(getAuditLog()));
    expect(parsed.events).toHaveLength(0);
  });
});

describe('reportCsv', () => {
  it('includes CSV header', () => {
    const output = reportCsv(getAuditLog());
    expect(output.startsWith('timestamp,type,key,layer,previousValue,currentValue')).toBe(true);
  });

  it('includes one row per event', () => {
    recordEvent('overridden', 'DB_HOST', { layer: 'override', previousValue: 'localhost', currentValue: 'db.prod' });
    recordEvent('masked', 'DB_PASS');
    const rows = reportCsv(getAuditLog()).split('\n');
    expect(rows).toHaveLength(3); // header + 2 data rows
    expect(rows[1]).toContain('overridden');
    expect(rows[1]).toContain('DB_HOST');
  });

  it('escapes double quotes in values', () => {
    recordEvent('resolved', 'WEIRD', { currentValue: 'say "hello"' });
    const output = reportCsv(getAuditLog());
    expect(output).toContain('say ""hello""');
  });
});

describe('generateReport', () => {
  it('defaults to text format', () => {
    const output = generateReport(getAuditLog());
    expect(output).toBe('No audit events recorded.');
  });

  it('delegates to correct formatter', () => {
    recordEvent('resolved', 'X');
    expect(generateReport(getAuditLog(), 'json')).toContain('"events"');
    expect(generateReport(getAuditLog(), 'csv')).toContain('timestamp,type');
    expect(generateReport(getAuditLog(), 'text')).toContain('RESOLVED');
  });
});
