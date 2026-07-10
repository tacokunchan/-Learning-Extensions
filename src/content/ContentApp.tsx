import { useEffect, useState } from 'react';
import { getStorageValue, onStorageValueChanged, STORAGE_DEFAULTS } from '../shared/storage';

/**
 * Optionsページで設定した内容(表示ON/OFF・バッジ文言)を反映するバッジ。
 * chrome.storage.onChanged を購読しているため、Optionsでの変更が
 * ページをリロードしなくてもリアルタイムに反映される。
 */
export default function ContentApp() {
  const [enabled, setEnabled] = useState(STORAGE_DEFAULTS.badgeEnabled);
  const [label, setLabel] = useState(STORAGE_DEFAULTS.badgeLabel);

  useEffect(() => {
    let active = true;

    getStorageValue('badgeEnabled').then((value) => {
      if (active) setEnabled(value);
    });
    getStorageValue('badgeLabel').then((value) => {
      if (active) setLabel(value);
    });

    const unsubscribeEnabled = onStorageValueChanged('badgeEnabled', (value) => {
      if (active) setEnabled(value);
    });
    const unsubscribeLabel = onStorageValueChanged('badgeLabel', (value) => {
      if (active) setLabel(value);
    });

    return () => {
      active = false;
      unsubscribeEnabled();
      unsubscribeLabel();
    };
  }, []);

  if (!enabled) return null;

  return <div className="badge">{label}</div>;
}
