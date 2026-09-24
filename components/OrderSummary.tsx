import { addOns, formatPrice, getPackage } from '@/content/pricing';

type Props = {
  packageId: string;
  addOnIds: string[];
  total: number;
};

export default function OrderSummary({ packageId, addOnIds, total }: Props) {
  const pkg = getPackage(packageId);
  const chosen = addOns.filter((a) => addOnIds.includes(a.id));

  return (
    <div className="text-sm">
      <dl className="space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-semibold text-navy dark:text-white">
            {pkg?.name ?? 'Package'} package
          </dt>
          <dd className="tabular-nums text-navy-700 dark:text-slate-200">
            {formatPrice(pkg?.price ?? null)}
          </dd>
        </div>

        {chosen.map((addOn) => (
          <div key={addOn.id} className="flex items-baseline justify-between gap-4">
            <dt className="text-navy-700/80 dark:text-slate-300">{addOn.name}</dt>
            <dd className="tabular-nums text-navy-700 dark:text-slate-200">
              {formatPrice(addOn.price)}
            </dd>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-4 border-t border-navy/10 pt-3 dark:border-white/10">
          <dt className="font-heading text-base font-bold text-navy dark:text-white">Total</dt>
          <dd className="font-heading text-base font-bold tabular-nums text-teal-700 dark:text-teal">
            {formatPrice(total)}
          </dd>
        </div>

      </dl>

      {pkg && (
        <p className="pt-3 text-xs text-navy-700/70 dark:text-slate-400">
          Delivered in {pkg.turnaround}
          {addOnIds.includes('express') ? ' — express moves this to 48 hours.' : '.'}
        </p>
      )}
    </div>
  );
}
