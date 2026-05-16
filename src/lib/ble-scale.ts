import React from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export const ESP32_SCALE_SERVICE_UUID = '7e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const ESP32_SCALE_WEIGHT_CHARACTERISTIC_UUID = '7e400003-b5a3-f393-e0a9-e50e24dcca9e';
export const ESP32_SCALE_DEVICE_NAME = 'WasteScale';

type BleDevice = {
  id: string;
  name: string | null;
};

type BleStatus = 'idle' | 'unsupported' | 'permission-denied' | 'scanning' | 'connected' | 'error';

function decodeBase64(value: string) {
  const atob = globalThis.atob;
  if (typeof atob !== 'function') {
    return '';
  }

  return atob(value);
}

export function parseScalePayload(payload: string) {
  const cleanPayload = payload.trim();
  const match = cleanPayload.match(/^(?:WT:)?\s*(\d+(?:\.\d+)?)$/i);
  if (!match) {
    return null;
  }

  const weight = Number(match[1]);
  return Number.isFinite(weight) && weight > 0 ? weight : null;
}

async function requestAndroidPermissions() {
  if (Platform.OS !== 'android') {
    return false;
  }

  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    return Object.values(results).every((result) => result === PermissionsAndroid.RESULTS.GRANTED);
  }

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function getBleManager() {
  try {
    const ble = (await import('react-native-ble-plx')) as { BleManager: new () => any };
    return new ble.BleManager();
  } catch {
    return null;
  }
}

export function useBleScale(onWeight: (weightGrams: number) => void) {
  const managerRef = React.useRef<any>(null);
  const subscriptionRef = React.useRef<{ remove: () => void } | null>(null);
  const scanTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = React.useState<BleStatus>('idle');
  const [devices, setDevices] = React.useState<BleDevice[]>([]);
  const [message, setMessage] = React.useState('Ready to scan for ESP32 scale.');

  React.useEffect(() => {
    return () => {
      subscriptionRef.current?.remove();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      managerRef.current?.stopDeviceScan?.();
      managerRef.current?.destroy?.();
    };
  }, []);

  const startScan = React.useCallback(async () => {
    if (Platform.OS !== 'android') {
      setStatus('unsupported');
      setMessage('Bluetooth scale support is Android-first in this build.');
      return;
    }

    const permitted = await requestAndroidPermissions();
    if (!permitted) {
      setStatus('permission-denied');
      setMessage('Bluetooth permissions are required to read the ESP32 scale.');
      return;
    }

    managerRef.current ??= await getBleManager();
    if (!managerRef.current) {
      setStatus('unsupported');
      setMessage('Bluetooth native module is unavailable. Use an Android development build.');
      return;
    }

    setDevices([]);
    setStatus('scanning');
    setMessage('Scanning for WasteScale...');

    managerRef.current.startDeviceScan([ESP32_SCALE_SERVICE_UUID], null, (error: unknown, device: any) => {
      if (error) {
        setStatus('error');
        setMessage('Bluetooth scan failed. Check that Bluetooth and location are enabled.');
        managerRef.current?.stopDeviceScan?.();
        return;
      }

      if (!device?.id) {
        return;
      }

      const deviceName = device.name ?? device.localName ?? null;
      const isScale = deviceName === ESP32_SCALE_DEVICE_NAME || device.serviceUUIDs?.includes(ESP32_SCALE_SERVICE_UUID);

      if (!isScale) {
        return;
      }

      setDevices((currentDevices) => {
        if (currentDevices.some((currentDevice) => currentDevice.id === device.id)) {
          return currentDevices;
        }

        return [...currentDevices, { id: device.id, name: deviceName }];
      });
    });

    scanTimeoutRef.current = setTimeout(() => {
      managerRef.current?.stopDeviceScan?.();
      setStatus('idle');
      setMessage('Scan finished. Start another scan if the ESP32 is now powered on.');
    }, 12000);
  }, []);

  const connect = React.useCallback(
    async (deviceId: string) => {
      if (!managerRef.current) {
        return;
      }

      managerRef.current.stopDeviceScan();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      try {
        setMessage('Connecting to ESP32 scale...');
        const device = await managerRef.current.connectToDevice(deviceId);
        await device.discoverAllServicesAndCharacteristics();
        subscriptionRef.current?.remove();
        subscriptionRef.current = device.monitorCharacteristicForService(
          ESP32_SCALE_SERVICE_UUID,
          ESP32_SCALE_WEIGHT_CHARACTERISTIC_UUID,
          (error: unknown, characteristic: { value?: string } | null) => {
            if (error) {
              setStatus('error');
              setMessage('Scale connection dropped. Reconnect and try again.');
              return;
            }

            if (!characteristic?.value) {
              return;
            }

            const parsedWeight = parseScalePayload(decodeBase64(characteristic.value));
            if (parsedWeight) {
              onWeight(parsedWeight);
              setMessage(`Scale reading: ${parsedWeight.toFixed(1)} g`);
            }
          },
        );

        setStatus('connected');
        setMessage('Connected. Waiting for weight notifications...');
      } catch {
        setStatus('error');
        setMessage('Unable to connect to the ESP32 scale.');
      }
    },
    [onWeight],
  );

  const disconnect = React.useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setStatus('idle');
    setMessage('Disconnected from scale.');
  }, []);

  return {
    status,
    devices,
    message,
    startScan,
    connect,
    disconnect,
  };
}
