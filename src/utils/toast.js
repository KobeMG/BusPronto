let idSeq = 0;
const listeners = new Set();

const emit = (t) => {
  listeners.forEach((listener) => listener({ ...t, id: ++idSeq }));
};

export const toast = {
  success: (options) => emit({ variant: 'success', duration: 2500, ...options }),
  error: (options) => emit({ variant: 'error', duration: 3000, ...options }),
  info: (options) => emit({ variant: 'info', duration: 4000, ...options }),
};

export const onToast = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
