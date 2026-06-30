import type { IncidentTimelineEvent } from '../types/incident.types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

interface IncidentTimelineProps {
  events: IncidentTimelineEvent[]
}

export function IncidentTimeline({ events }: IncidentTimelineProps) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {events.map((event, index) => (
        <li
          key={event.id}
          className="relative grid grid-cols-[20px_1fr] gap-3 pb-4"
        >
          <div
            className="z-[1] mt-1 h-3 w-3 rounded-full border-2 border-accent bg-white"
            aria-hidden="true"
          />
          {index < events.length - 1 ? (
            <div
              className="absolute top-4 bottom-0 left-[5px] w-0.5 bg-slate-200"
              aria-hidden="true"
            />
          ) : null}
          <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{event.action}</strong>
              <time className="text-xs text-slate-500" dateTime={event.timestamp}>
                {formatDate(event.timestamp)}
              </time>
            </div>
            <span className="mt-1 block text-[0.8125rem] text-slate-500">{event.actor}</span>
            {event.note ? <p className="mt-2 text-sm">{event.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
