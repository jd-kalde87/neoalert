import { useCallback, useState } from 'react'
import { Loader2, MapPin, Route } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import {
  fetchRoadRoute,
  secondsToEstimatedMinutes,
} from '@shared/services/routing/osrm.api'
import type { RouteCoordinate } from '@shared/types/operations.types'
import { RouteEditorMap } from './OperationMapEditors'

interface RouteMapEditorProps {
  plantLat: number | null
  plantLng: number | null
  siteLat: number | null
  siteLng: number | null
  color: string
  initialCoordinates?: RouteCoordinate[]
  initialRoadSnapped?: boolean
  excludeRouteId?: string
  onRouteCalculated: (payload: {
    coordinates: RouteCoordinate[]
    estimatedMinutes: number
    roadSnapped: boolean
  }) => void
}

export function RouteMapEditor({
  plantLat,
  plantLng,
  siteLat,
  siteLng,
  color,
  initialCoordinates = [],
  initialRoadSnapped = false,
  excludeRouteId,
  onRouteCalculated,
}: RouteMapEditorProps) {
  const [coordinates, setCoordinates] = useState<RouteCoordinate[]>(initialCoordinates)
  const [waypoints, setWaypoints] = useState<RouteCoordinate[]>([])
  const [roadSnapped, setRoadSnapped] = useState(initialRoadSnapped)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plantPosition: RouteCoordinate | null =
    plantLat != null && plantLng != null ? [plantLat, plantLng] : null
  const sitePosition: RouteCoordinate | null =
    siteLat != null && siteLng != null ? [siteLat, siteLng] : null

  const runRouting = useCallback(
    async (extraWaypoints: RouteCoordinate[]) => {
      setError(null)
      if (plantLat == null || plantLng == null || siteLat == null || siteLng == null) {
        setError('La planta y el sitio deben tener ubicación en mapa.')
        return
      }

      const points: RouteCoordinate[] = [
        [plantLat, plantLng],
        ...extraWaypoints,
        [siteLat, siteLng],
      ]
      setLoading(true)
      try {
        const result = await fetchRoadRoute(points)
        setCoordinates(result.coordinates)
        setRoadSnapped(true)
        const estimatedMinutes = secondsToEstimatedMinutes(result.durationSeconds)
        onRouteCalculated({
          coordinates: result.coordinates,
          estimatedMinutes,
          roadSnapped: true,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al calcular ruta')
      } finally {
        setLoading(false)
      }
    },
    [plantLat, plantLng, siteLat, siteLng, onRouteCalculated],
  )

  const handleAddWaypoint = async (lat: number, lng: number) => {
    const next = [...waypoints, [lat, lng] as RouteCoordinate]
    setWaypoints(next)
    await runRouting(next)
  }

  const clearWaypoints = async () => {
    setWaypoints([])
    await runRouting([])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void runRouting(waypoints)}
          disabled={loading || !plantPosition || !sitePosition}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Route className="size-4" />}
          Trazar por vías mapeadas
        </Button>
        {waypoints.length > 0 ? (
          <Button type="button" size="sm" variant="secondary" onClick={() => void clearWaypoints()}>
            Quitar puntos intermedios ({waypoints.length})
          </Button>
        ) : null}
        {roadSnapped ? (
          <span className="text-xs font-medium text-emerald-700">Ajustada a red vial OSM</span>
        ) : null}
      </div>

      {error ? <p className="neo-alert-error m-0 text-sm">{error}</p> : null}

      <RouteEditorMap
        plantPosition={plantPosition}
        sitePosition={sitePosition}
        routeColor={color}
        coordinates={coordinates}
        waypoints={waypoints}
        onAddWaypoint={(lat, lng) => void handleAddWaypoint(lat, lng)}
        excludeRouteId={excludeRouteId}
        isDrawing={Boolean(plantPosition && sitePosition)}
      />

      <p className="flex items-center gap-1 text-xs text-slate-500">
        <MapPin className="size-3.5" />
        {coordinates.length} vértices en el trazado
        {waypoints.length > 0 ? ` · ${waypoints.length} punto(s) intermedio(s)` : ''}
      </p>
    </div>
  )
}
