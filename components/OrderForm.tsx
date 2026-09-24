'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import OrderSummary from './OrderSummary';
import {
  canUploadFiles,
  isOrderBackendConfigured,
  submitOrder,
} from '@/lib/order-api';
import { LAST_ORDER_KEY } from '@/lib/use-last-order';
import {
  ACCEPTED_UPLOAD_TYPES,
  experienceLevels,
  orderSchema,
  validateUpload,
  type OrderValues,
} from '@/lib/order-schema';
import { addOns, calculateTotal, formatLkr, getPackage, packages } from '@/content/pricing';
import { site, whatsappLink } from '@/content/site';

const stepFields: Array<Array<keyof OrderValues>> = [
  ['packageId', 'addOnIds'],
  ['name', 'email', 'phone', 'location'],
  ['role', 'experience', 'industry', 'notes'],
  ['consent', 'company'],
];

const stepTitles = ['Package', 'Your details', 'Career info', 'Review'];

export default function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const preselected = searchParams.get('package');
  const defaultPackage = getPackage(preselected ?? '')?.id ?? 'professional';

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderValues>({
    resolver: zodResolver(orderSchema),
    mode: 'onTouched',
    defaultValues: {
      packageId: defaultPackage,
      addOnIds: [],
      name: '',
      email: '',
      phone: '',
      location: '',
      role: '',
      experience: '',
      industry: '',
      notes: '',
      company: '',
    },
  });

  const values = watch();
  const total = useMemo(
    () => calculateTotal(values.packageId, values.addOnIds ?? []),
    [values.packageId, values.addOnIds],
  );

  // Keep the preselected package in sync if someone lands on /order/?package=…
  useEffect(() => {
    const fromUrl = getPackage(searchParams.get('package') ?? '')?.id;
    if (fromUrl) setValue('packageId', fromUrl);
  }, [searchParams, setValue]);

  const goNext = async () => {
    const valid = await trigger(stepFields[step]);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, stepFields.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onFilesPicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    const problem = picked.map(validateUpload).find(Boolean);
    if (problem) {
      setFileError(problem);
      setFiles([]);
      event.target.value = '';
      return;
    }
    setFileError(null);
    setFiles(picked.slice(0, 3));
  };

  const whatsappFallback = (ref: string, data: OrderValues) =>
    whatsappLink(
      [
        `Hi ${site.name}, I would like to order.`,
        `Reference: ${ref}`,
        `Package: ${getPackage(data.packageId)?.name}`,
        `Add-ons: ${(data.addOnIds ?? []).map((id) => addOns.find((a) => a.id === id)?.name).join(', ') || 'none'}`,
        `Total: ${formatLkr(total)}`,
        `Name: ${data.name}`,
        `Target role: ${data.role}`,
      ].join('\n'),
    );

  const onSubmit = async (data: OrderValues) => {
    // Honeypot: bots fill every field they can see in the DOM.
    if (data.company) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitOrder(data, total, files);

      // The success page reads this to show the summary without a round trip.
      sessionStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify({
          ref: result.ref,
          packageId: data.packageId,
          addOnIds: data.addOnIds ?? [],
          total,
          name: data.name,
          email: data.email,
          stored: result.stored,
          via: result.via,
          whatsapp: whatsappFallback(result.ref, data),
        }),
      );

      router.push(`/order/success/?ref=${result.ref}`);
    } catch (error) {
      console.error(error);
      setSubmitError(
        'We could not save your order just now. Please try again, or send us the details on WhatsApp and we will take it from there.',
      );
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div>
        <ol className="mb-8 flex items-center gap-2" aria-label="Order progress">
          {stepTitles.map((title, index) => {
            const state = index === step ? 'current' : index < step ? 'done' : 'todo';
            return (
              <li key={title} className="flex flex-1 flex-col gap-2">
                <span
                  className={`h-1.5 rounded-full ${
                    state === 'todo' ? 'bg-navy/15 dark:bg-white/15' : 'bg-teal'
                  }`}
                />
                <span
                  className={`text-xs font-semibold ${
                    state === 'current'
                      ? 'text-teal-700 dark:text-teal'
                      : 'text-navy-700/70 dark:text-slate-400'
                  }`}
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  {index + 1}. {title}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Step 1 — package and add-ons */}
        <fieldset className={step === 0 ? 'block' : 'hidden'}>
          <legend className="text-xl font-bold text-navy dark:text-white">Choose your package</legend>
          <p className="mt-1 text-sm text-navy-700/80 dark:text-slate-300">
            You can change this later by messaging us before we start.
          </p>

          <div className="mt-5 space-y-3">
            {packages.map((pkg) => (
              <label
                key={pkg.id}
                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${
                  values.packageId === pkg.id
                    ? 'border-teal bg-teal/5 ring-1 ring-teal'
                    : 'border-navy/15 bg-white hover:border-navy/30 dark:border-white/15 dark:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  value={pkg.id}
                  {...register('packageId')}
                  className="mt-1 h-5 w-5 accent-teal"
                />
                <span className="flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-heading text-base font-bold text-navy dark:text-white">
                      {pkg.name}
                      {pkg.popular && (
                        <span className="ml-2 rounded-full bg-amber px-2 py-0.5 text-[11px] font-bold uppercase text-navy-900">
                          Popular
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-navy dark:text-white">
                      {formatLkr(pkg.price)}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-navy-700/80 dark:text-slate-300">
                    {pkg.summary}
                  </span>
                  <span className="mt-1 block text-xs text-navy-700/70 dark:text-slate-400">
                    {pkg.turnaround} · {pkg.revisions} revision
                    {pkg.revisions === 1 ? '' : 's'}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.packageId && <p className="field-error">{errors.packageId.message}</p>}

          <h2 className="mt-8 text-base">Add-ons (optional)</h2>
          <div className="mt-3 space-y-3">
            {addOns.map((addOn) => (
              <label
                key={addOn.id}
                className="flex cursor-pointer gap-3 rounded-2xl border border-navy/15 bg-white p-4 hover:border-navy/30 dark:border-white/15 dark:bg-white/5"
              >
                <input
                  type="checkbox"
                  value={addOn.id}
                  {...register('addOnIds')}
                  className="mt-1 h-5 w-5 accent-teal"
                />
                <span className="flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-navy dark:text-white">{addOn.name}</span>
                    <span className="text-sm font-semibold text-navy dark:text-white">
                      +{formatLkr(addOn.price)}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-navy-700/80 dark:text-slate-300">
                    {addOn.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Step 2 — contact details */}
        <fieldset className={step === 1 ? 'block' : 'hidden'}>
          <legend className="text-xl font-bold text-navy dark:text-white">Your details</legend>
          <p className="mt-1 text-sm text-navy-700/80 dark:text-slate-300">
            We use these to send your files and to reach you about the draft.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" className="input" autoComplete="name" {...register('name')} />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="input"
                {...register('email')}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="phone">Phone or WhatsApp</label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="07X XXX XXXX"
                className="input"
                {...register('phone')}
              />
              {errors.phone && <p className="field-error">{errors.phone.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="location">City or country</label>
              <input
                id="location"
                autoComplete="address-level2"
                className="input"
                {...register('location')}
              />
              {errors.location && <p className="field-error">{errors.location.message}</p>}
            </div>
          </div>
        </fieldset>

        {/* Step 3 — career info and uploads */}
        <fieldset className={step === 2 ? 'block' : 'hidden'}>
          <legend className="text-xl font-bold text-navy dark:text-white">Career info</legend>
          <p className="mt-1 text-sm text-navy-700/80 dark:text-slate-300">
            The more specific you are, the less back-and-forth later.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="role">Target job role</label>
              <input
                id="role"
                className="input"
                placeholder="e.g. Senior accountant"
                {...register('role')}
              />
              {errors.role && <p className="field-error">{errors.role.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="industry">Industry</label>
              <input
                id="industry"
                className="input"
                placeholder="e.g. Banking"
                {...register('industry')}
              />
              {errors.industry && <p className="field-error">{errors.industry.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="experience">Years of experience</label>
              <select id="experience" className="input" {...register('experience')}>
                <option value="">Select…</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {errors.experience && <p className="field-error">{errors.experience.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">
                Anything else we should know? <span className="font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={4}
                className="input"
                placeholder="Job adverts you are targeting, achievements you are proud of, deadlines…"
                {...register('notes')}
              />
              {errors.notes && <p className="field-error">{errors.notes.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="uploads">
                Current CV or photo <span className="font-normal">(optional, max 5 MB each)</span>
              </label>
              <input
                id="uploads"
                type="file"
                multiple
                accept={ACCEPTED_UPLOAD_TYPES.join(',')}
                onChange={onFilesPicked}
                className="input py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white dark:file:bg-teal dark:file:text-navy-900"
              />
              {fileError && <p className="field-error">{fileError}</p>}
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-navy-700/70 dark:text-slate-400">
                  {files.map((file) => (
                    <li key={file.name}>
                      {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
                    </li>
                  ))}
                </ul>
              )}
              {!canUploadFiles && (
                <p className="mt-2 text-xs text-amber">
                  {isOrderBackendConfigured
                    ? 'Files are not uploaded from this form — send them on WhatsApp after ordering and we will attach them to your reference.'
                    : 'Uploads are not connected yet on this build — you can send files on WhatsApp after ordering.'}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Step 4 — review and consent */}
        <fieldset className={step === 3 ? 'block' : 'hidden'}>
          <legend className="text-xl font-bold text-navy dark:text-white">Review and confirm</legend>

          <div className="mt-5 card">
            <OrderSummary
              packageId={values.packageId}
              addOnIds={values.addOnIds ?? []}
              total={total}
            />
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            {[
              ['Name', values.name],
              ['Email', values.email],
              ['Phone', values.phone],
              ['Location', values.location],
              ['Target role', values.role],
              ['Industry', values.industry],
              ['Experience', values.experience],
              ['Files', files.length ? `${files.length} attached` : 'None'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-navy-700/70 dark:text-slate-400">
                  {label}
                </dt>
                <dd className="mt-0.5 break-words font-medium text-navy dark:text-white">
                  {value || '—'}
                </dd>
              </div>
            ))}
          </dl>

          {/* Honeypot — visually hidden, never announced, never filled by humans. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="company">Company</label>
            <input id="company" tabIndex={-1} autoComplete="off" {...register('company')} />
          </div>

          <label className="mt-6 flex cursor-pointer gap-3 rounded-2xl border border-navy/15 bg-white p-4 dark:border-white/15 dark:bg-white/5">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-teal" {...register('consent')} />
            <span className="text-sm text-navy-700/90 dark:text-slate-200">
              I agree to {site.name} storing these details to prepare my order, as described in the{' '}
              <Link href="/privacy/" className="font-semibold text-teal-700 underline dark:text-teal">
                privacy notice
              </Link>
              . Uploaded files are deleted 90 days after delivery.
            </span>
          </label>
          {errors.consent && <p className="field-error">{errors.consent.message}</p>}

          {submitError && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
            >
              {submitError}{' '}
              <a href={whatsappLink()} className="font-semibold underline">
                Message us on WhatsApp
              </a>
            </div>
          )}
        </fieldset>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <button type="button" onClick={goBack} className="btn-secondary sm:w-auto">
              Back
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}

          {step < stepFields.length - 1 ? (
            <button type="button" onClick={goNext} className="btn-primary sm:px-10">
              Continue
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="btn-primary sm:px-10">
              {submitting ? 'Placing order…' : `Place order · ${formatLkr(total)}`}
            </button>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="card">
          <h2 className="text-base">Your order</h2>
          <div className="mt-4">
            <OrderSummary
              packageId={values.packageId}
              addOnIds={values.addOnIds ?? []}
              total={total}
            />
          </div>
          <p className="mt-4 border-t border-navy/10 pt-4 text-xs text-navy-700/70 dark:border-white/10 dark:text-slate-400">
            You pay after ordering, by card or bank transfer. Nothing is charged on this page.
          </p>
        </div>
      </aside>
    </form>
  );
}
