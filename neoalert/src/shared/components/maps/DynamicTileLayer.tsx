import { useEffect } from 'react'
import { TileLayer, useMap } from 'react-leaflet'
import type { MapLayerMode } from '@shared/types/map.types'

interface DynamicTileLayerProps {
  layerMode: MapLayerMode
}

function MapAttribution({ layerMode }: DynamicTileLayerProps) {
  const map = useMap()

  useEffect(() => {
    map.attributionControl.setPrefix('NeoAlert')
  }, [map])

  useEffect(() => {
    if (layerMode === 'operational') {
      map.getContainer().classList.add('neo-map--operational')
    } else {
      map.getContainer().classList.remove('neo-map--operational')
    }
  }, [layerMode, map])

  return null
}

export function DynamicTileLayer({ layerMode }: DynamicTileLayerProps) {
  const isSatellite = layerMode === 'satellite'

  return (
    <>
      <TileLayer
        attribution={
          isSatellite
            ? 'Tiles &copy; Esri'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
        url={
          isSatellite
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      />
      <MapAttribution layerMode={layerMode} />
    </>
  )
}
