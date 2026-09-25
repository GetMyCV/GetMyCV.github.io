'use client';

import { useState } from 'react';
import type { CvContent, CvLayout } from '@/content/cvs';
import AtsReportView from './AtsReportView';
import CvPlainText from './CvPlainText';

/** "How an ATS reads this CV", shown under each sample CV. */
export default function SampleAtsPanel({ cv, layout, accent }: { cv: CvContent; layout: CvLayout; accent: string }) {
  const [text, setText] = useState('');
  return (
    <section className="card mx-auto mt-8 max-w-[794px] print:hidden" aria-labelledby="ats-panel-title">
      <p className="eyebrow">ATS check</p>
      <h2 id="ats-panel-title" className="mt-1 text-xl">
        How an applicant tracking system reads this CV
      </h2>
      <p className="mt-2 text-sm text-navy-700/80 dark:text-slate-300">
        Before a person sees your CV, software turns it into text and looks for your details, sections, dates and keywords. Here is
        exactly what it gets from this template. Paste a job ad to see the keyword match.
      </p>
      <div className="mt-5">
        <AtsReportView text={text} content={cv} pages={1} />
      </div>
      <CvPlainText cv={cv} layout={layout} accent={accent} onText={setText} />
    </section>
  );
}
