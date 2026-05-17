export type BleDevice = {
  id: string;
  name: string | null;
};

export type BleStatus = 'idle' | 'unsupported' | 'permission-denied' | 'scanning' | 'connected' | 'error';
