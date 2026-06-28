import 'leaflet'

declare module 'leaflet' {
  interface HeatMapOptions {
    minOpacity?: number
    maxZoom?: number
    radius?: number
    blur?: number
    gradient?: Record<number, string>
  }

  interface HeatLayer extends Layer {
    setLatLngs(latlngs: [number, number, number][]): HeatLayer
  }

  function heatLayer(
    latlngs: [number, number, number?][],
    options?: HeatMapOptions,
  ): HeatLayer
}

declare module 'leaflet.heat'
