/**
 * Shared wrapper for chart sections — provides consistent card styling,
 * heading, optional description, source attribution, and screen-reader table pattern.
 *
 * Eliminates the repeated section/h2/p boilerplate from each chart component.
 */

import type { ReactNode } from 'react'
import { useI18n } from '../hooks/useI18n.ts'

interface Props {
  /** Section title displayed as an uppercase mono heading */
  title: string
  /** Optional description text shown below the title */
  description?: string
  /** Whether to show the data source attribution line (default: true) */
  showSource?: boolean
  /** Additional className appended to the <section> element */
  className?: string
  children: ReactNode
}

export default function ChartSection({ title, description, showSource = true, className = '', children }: Props) {
  const { t } = useI18n()

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
      {/* NEUTRAL.500 */}
      {showSource && (
        <div className="text-[10px] text-[#999] mt-3 font-mono">
          {t('chart.source')}
        </div>
      )}
    </section>
  )
}
