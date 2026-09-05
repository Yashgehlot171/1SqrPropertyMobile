type LoaderListener = (visible: boolean) => void;

const listeners = new Set<LoaderListener>();
let activeRequests = 0;

function emit() {
  const visible = activeRequests > 0;
  listeners.forEach(listener => listener(visible));
}

export const apiLoader = {
  start() {
    activeRequests += 1;
    emit();
  },

  stop() {
    activeRequests = Math.max(0, activeRequests - 1);
    emit();
  },

  subscribe(listener: LoaderListener) {
    listeners.add(listener);
    listener(activeRequests > 0);
    return () => listeners.delete(listener);
  },
};
