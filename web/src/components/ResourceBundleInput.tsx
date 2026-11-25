import { RESOURCE_LABELS } from '../data/gameData';
import type { ResourceKey } from '../types';
import { RESOURCE_KEYS } from '../utils/gameMath';

export type BundleState = Record<ResourceKey, number>;

export const emptyBundle: BundleState = { food: 0, wood: 0, stone: 0, ore: 0, gold: 0 };

export function ResourceBundleInput({
  bundle,
  onChange,
}: {
  bundle: BundleState;
  onChange: (bundle: BundleState) => void;
}) {
  return (
    <div className="bundle-inputs">
      {RESOURCE_KEYS.map((key) => (
        <label key={key} className={`mini-resource resource-${key}`}>
          <span>{RESOURCE_LABELS[key]}</span>
          <input
            min="0"
            type="number"
            value={bundle[key]}
            onChange={(event) => onChange({ ...bundle, [key]: Number(event.target.value) })}
          />
        </label>
      ))}
    </div>
  );
}
