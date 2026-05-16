import {
  subscribe,
  unsubscribe,
  notifyObservers,
  notifyAll,
  clearObservers,
  listObserverIds,
  EnvChangeEvent,
} from "./envObserver";

beforeEach(() => {
  clearObservers();
});

describe("subscribe / unsubscribe", () => {
  it("returns a unique id per subscriber", () => {
    const id1 = subscribe(() => {});
    const id2 = subscribe(() => {});
    expect(id1).not.toBe(id2);
    expect(listObserverIds()).toHaveLength(2);
  });

  it("unsubscribe removes the observer", () => {
    const id = subscribe(() => {});
    expect(unsubscribe(id)).toBe(true);
    expect(listObserverIds()).toHaveLength(0);
  });

  it("unsubscribe returns false for unknown id", () => {
    expect(unsubscribe("ghost")).toBe(false);
  });
});

describe("notifyObservers", () => {
  it("calls callback when value changes", () => {
    const events: EnvChangeEvent[] = [];
    subscribe((e) => events.push(e));
    notifyObservers("PORT", "3000", "4000");
    expect(events).toHaveLength(1);
    expect(events[0].key).toBe("PORT");
    expect(events[0].previousValue).toBe("3000");
    expect(events[0].nextValue).toBe("4000");
  });

  it("does not call callback when value is unchanged", () => {
    const events: EnvChangeEvent[] = [];
    subscribe((e) => events.push(e));
    notifyObservers("PORT", "3000", "3000");
    expect(events).toHaveLength(0);
  });

  it("only notifies observers watching the specific key", () => {
    const allEvents: EnvChangeEvent[] = [];
    const portEvents: EnvChangeEvent[] = [];
    subscribe((e) => allEvents.push(e));
    subscribe((e) => portEvents.push(e), ["PORT"]);
    notifyObservers("HOST", "localhost", "example.com");
    expect(allEvents).toHaveLength(1);
    expect(portEvents).toHaveLength(0);
  });

  it("swallows errors thrown by callbacks", () => {
    subscribe(() => { throw new Error("boom"); });
    expect(() => notifyObservers("X", "1", "2")).not.toThrow();
  });
});

describe("notifyAll", () => {
  it("fires events for added, removed and changed keys", () => {
    const events: EnvChangeEvent[] = [];
    subscribe((e) => events.push(e));
    notifyAll(
      { A: "1", B: "2" },
      { A: "1", B: "99", C: "new" }
    );
    expect(events).toHaveLength(2);
    const keys = events.map((e) => e.key).sort();
    expect(keys).toEqual(["B", "C"]);
  });

  it("detects removed keys (nextValue undefined)", () => {
    const events: EnvChangeEvent[] = [];
    subscribe((e) => events.push(e));
    notifyAll({ GONE: "bye" }, {});
    expect(events[0].nextValue).toBeUndefined();
  });
});
