/**
 * Shared wrapper for chart sections — provides consistent card styling,
 * heading, optional description, and screen-reader table pattern.
 *
 * Eliminates the repeated section/h2/p boilerplate from each chart component.
 */

import type { ReactNode } from 'react'

interface Props {
  /** Section title displayed as an uppercase mono heading */
  title: string
  /** Optional description text shown below the title */
  description?: string
  /** Additional className appended to the <section> element */
  className?: string
  children: ReactNode
}

export default function ChartSection({ title, description, className = '', children }: Props) {
  return (
    /* NEUTRAL.300 */
    <section className={`bg-white border border-[#ddd] rounded-sm p-6 mb-5 ${className}`.trim()}>
      {/* NEUTRAL.650 */}
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666] mb-1 font-mono">
        {title}
      </h2>
      {/* NEUTRAL.600 */}
      {description && (
        <p className="text-[12px] text-[#767676] mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </section>
  )
}
