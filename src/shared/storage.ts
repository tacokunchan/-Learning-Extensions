import { useEffect, useState } from 'react';

/** chrome.storage.sync に保存する値のスキーマ。キーを追加する場合はこことDEFAULTSを更新する。 */
export interface StorageSchema {
  counter: number;
  badgeEnabled: boolean;
  badgeLabel: string;
}

export const STORAGE_DEFAULTS: StorageSchema = {
  counter: 0,
  badgeEnabled: true,
  badgeLabel: 'Hello from the extension!',
};

export async function getStorageValue<K extends keyof StorageSchema>(
  key: K,
): Promise<StorageSchema[K]> {
  const result = await chrome.storage.sync.get({ [key]: STORAGE_DEFAULTS[key] });
  return result[key] as StorageSchema[K];
}

export async function setStorageValue<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K],
): Promise<void> {
  await chrome.storage.sync.set({ [key]: value });
}

/** 指定キーの変更を購読する。戻り値の関数を呼ぶと購読解除する。 */
export function onStorageValueChanged<K extends keyof StorageSchema>(
  key: K,
  callback: (newValue: StorageSchema[K]) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: chrome.storage.AreaName,
  ) => {
    if (areaName !== 'sync') return;
    const change = changes[key];
    if (change) callback(change.newValue as StorageSchema[K]);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

/** Popup/Optionsから使う、storageと同期されたstate用フック。 */
export function useStorageValue<K extends keyof StorageSchema>(
  key: K,
): [StorageSchema[K], (value: StorageSchema[K]) => void, boolean] {
  const [value, setValue] = useState<StorageSchema[K]>(STORAGE_DEFAULTS[key]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    getStorageValue(key).then((stored) => {
      if (!active) return;
      setValue(stored);
      setLoaded(true);
    });

    const unsubscribe = onStorageValueChanged(key, (next) => {
      if (active) setValue(next);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [key]);

  const update = (next: StorageSchema[K]) => {
    setValue(next);
    void setStorageValue(key, next);
  };

  return [value, update, loaded];
}
