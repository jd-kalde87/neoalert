import type { AuditFieldChange } from '../types/audit.types'

interface AuditChangeListProps {
  changes: AuditFieldChange[]
}

export function AuditChangeList({ changes }: AuditChangeListProps) {
  if (changes.length === 0) return null

  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {changes.map((change) => (
        <li
          key={change.field}
          className="flex flex-col gap-1 rounded-md border border-slate-200 px-3 py-2.5 text-sm"
        >
          <strong>{change.label}</strong>
          <div className="flex flex-wrap items-center gap-1.5">
            {change.previous != null ? (
              <span className="rounded-sm bg-red-500/10 px-1.5 py-0.5 text-slate-500 line-through">
                {change.previous}
              </span>
            ) : null}
            {change.previous != null && change.next != null ? (
              <span className="text-slate-500">→</span>
            ) : null}
            {change.next != null ? (
              <span className="rounded-sm bg-accent/10 px-1.5 py-0.5 font-medium text-accent">
                {change.next}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
