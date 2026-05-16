import {
  onEnvEvent,
  offEnvEvent,
  emitEnvEvent,
  clearEnvEventHandlers,
  listEnvEventTypes,
  EnvEvent,
} from './envEvent';

beforeEach(() => clearEnvEventHandlers());

describe('onEnvEvent / emitEnvEvent', () => {
  it('calls handler for matching event type', () => {
    const received: EnvEvent[] = [];
    onEnvEvent('set', (e) => received.push(e));
    emitEnvEvent({ type: 'set', key: 'FOO', newValue: 'bar', timestamp: 1 });
    expect(received).toHaveLength(1);
    expect(received[0].key).toBe('FOO');
  });

  it('does not call handler for different event type', () => {
    const received: EnvEvent[] = [];
    onEnvEvent('delete', (e) => received.push(e));
    emitEnvEvent({ type: 'set', key: 'FOO', timestamp: 1 });
    expect(received).toHaveLength(0);
  });

  it('wildcard handler receives all events', () => {
    const received: EnvEvent[] = [];
    onEnvEvent('*', (e) => received.push(e));
    emitEnvEvent({ type: 'set', timestamp: 1 });
    emitEnvEvent({ type: 'delete', timestamp: 2 });
    expect(received).toHaveLength(2);
  });

  it('returns unsubscribe function', () => {
    const received: EnvEvent[] = [];
    const off = onEnvEvent('reset', (e) => received.push(e));
    off();
    emitEnvEvent({ type: 'reset', timestamp: 1 });
    expect(received).toHaveLength(0);
  });
});

describe('offEnvEvent', () => {
  it('removes a specific handler', () => {
    const received: EnvEvent[] = [];
    const handler = (e: EnvEvent) => received.push(e);
    onEnvEvent('merge', handler);
    offEnvEvent('merge', handler);
    emitEnvEvent({ type: 'merge', timestamp: 1 });
    expect(received).toHaveLength(0);
  });
});

describe('listEnvEventTypes', () => {
  it('lists registered event types', () => {
    onEnvEvent('set', () => {});
    onEnvEvent('delete', () => {});
    const types = listEnvEventTypes();
    expect(types).toContain('set');
    expect(types).toContain('delete');
  });
});

describe('clearEnvEventHandlers', () => {
  it('clears specific type', () => {
    onEnvEvent('set', () => {});
    clearEnvEventHandlers('set');
    expect(listEnvEventTypes()).not.toContain('set');
  });

  it('clears all handlers', () => {
    onEnvEvent('set', () => {});
    onEnvEvent('delete', () => {});
    clearEnvEventHandlers();
    expect(listEnvEventTypes()).toHaveLength(0);
  });
});
