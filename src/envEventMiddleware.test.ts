import {
  createEnvEventMiddleware,
  applyEnvEventMiddleware,
  EnvEventRequest,
} from './envEventMiddleware';
import {
  onEnvEvent,
  clearEnvEventHandlers,
  EnvEvent,
} from './envEvent';

beforeEach(() => clearEnvEventHandlers());

function makeReq(overrides: Partial<EnvEventRequest> = {}): EnvEventRequest {
  return {
    env: { FOO: 'bar' },
    operation: 'set',
    key: 'FOO',
    value: 'bar',
    ...overrides,
  };
}

describe('createEnvEventMiddleware', () => {
  it('emits event after next() is called', () => {
    const events: EnvEvent[] = [];
    onEnvEvent('set', (e) => events.push(e));
    const mw = createEnvEventMiddleware();
    applyEnvEventMiddleware(makeReq(), mw);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('set');
  });

  it('captures oldValue from previous env', () => {
    const events: EnvEvent[] = [];
    onEnvEvent('set', (e) => events.push(e));
    const mw = createEnvEventMiddleware();
    applyEnvEventMiddleware(
      makeReq({ previous: { FOO: 'old' }, env: { FOO: 'new' }, key: 'FOO' }),
      mw
    );
    expect(events[0].oldValue).toBe('old');
    expect(events[0].newValue).toBe('new');
  });

  it('passes meta through to event', () => {
    const events: EnvEvent[] = [];
    onEnvEvent('delete', (e) => events.push(e));
    const mw = createEnvEventMiddleware();
    applyEnvEventMiddleware(
      makeReq({ operation: 'delete', meta: { source: 'test' } }),
      mw
    );
    expect(events[0].meta).toEqual({ source: 'test' });
  });

  it('returns result from next()', () => {
    const mw = createEnvEventMiddleware();
    const req = makeReq();
    const result = applyEnvEventMiddleware(req, mw);
    expect(result.env).toEqual(req.env);
  });

  it('emits merge event type', () => {
    const events: EnvEvent[] = [];
    onEnvEvent('merge', (e) => events.push(e));
    const mw = createEnvEventMiddleware();
    applyEnvEventMiddleware(makeReq({ operation: 'merge' }), mw);
    expect(events).toHaveLength(1);
  });
});
