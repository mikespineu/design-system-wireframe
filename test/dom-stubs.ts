// jsdom lacks several browser APIs that Radix primitives rely on.
// Imported from jest.setup.ts; keep stubs minimal and side-effect free.

class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  window.ResizeObserver ??= ResizeObserverStub;

  // Radix Select / Slider / Popper read pointer capture and scroll APIs.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};

  // user-event sends PointerEvents; jsdom only has MouseEvent.
  if (!window.PointerEvent) {
    class PointerEventStub extends MouseEvent {
      pointerId: number;
      pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.pointerType = init.pointerType ?? 'mouse';
      }
    }
    window.PointerEvent = PointerEventStub as unknown as typeof PointerEvent;
  }

  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
