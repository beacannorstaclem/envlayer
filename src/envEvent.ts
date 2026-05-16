/**
 * envEvent.ts — Typed event bus for environment change notifications.
 */

export type EnvEventType =
  | 'set'
  | 'delete'
  | 'reset'
  | 'merge'
  | 'rollback';

export interface EnvEvent {
  type: EnvEventType;
  key?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export type EnvEventHandler = (event: EnvEvent) => void;

const handlers = new Map<EnvEventType | '*', Set<EnvEventHandler>>();

export function onEnvEvent(
  type: EnvEventType | '*',
  handler: EnvEventHandler
): () => void {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type)!.add(handler);
  return () => offEnvEvent(type, handler);
}

export function offEnvEvent(
  type: EnvEventType | '*',
  handler: EnvEventHandler
): void {
  handlers.get(type)?.delete(handler);
}

export function emitEnvEvent(event: EnvEvent): void {
  const specific = handlers.get(event.type);
  specific?.forEach((h) => h(event));
  const wildcard = handlers.get('*');
  wildcard?.forEach((h) => h(event));
}

export function clearEnvEventHandlers(type?: EnvEventType | '*'): void {
  if (type) {
    handlers.delete(type);
  } else {
    handlers.clear();
  }
}

export function listEnvEventTypes(): Array<EnvEventType | '*'> {
  return Array.from(handlers.keys());
}
