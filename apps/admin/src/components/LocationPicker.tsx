"use client"

import type { DragEndEvent, LatLngExpression, LeafletMouseEvent } from "leaflet"
import L from "leaflet"
import { useEffect, useMemo } from "react"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type LocationPickerProps = {
  latitude: number
  longitude: number
  onChange: (coords: { latitude: number; longitude: number }) => void
}

const DEFAULT_CENTER: LatLngExpression = [54.5, -2.5]
const DEFAULT_ZOOM = 5

type LocationMarkerProps = {
  position: LatLngExpression | undefined
  onChange: (coords: { latitude: number; longitude: number }) => void
}

const LocationMarker = ({ position, onChange }: LocationMarkerProps) => {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    },
  })

  if (!position) return null

  return (
    <Marker
      position={position}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend: (e: DragEndEvent) => {
          const marker = e.target as L.Marker
          const latlng = marker.getLatLng()
          onChange({ latitude: latlng.lat, longitude: latlng.lng })
        },
      }}
    />
  )
}

type MapControllerProps = {
  center: LatLngExpression
  hasCoords: boolean
}

const MapController = ({ center, hasCoords }: MapControllerProps) => {
  const map = useMap()
  const initialHadCoords = useMemo(() => hasCoords, [])

  useEffect(() => {
    if (hasCoords && !initialHadCoords) {
      map.panTo(center)
    }
  }, [map, center, hasCoords, initialHadCoords])

  return null
}

export const LocationPicker = ({ latitude, longitude, onChange }: LocationPickerProps) => {
  const hasCoords = latitude !== 0 || longitude !== 0
  const position: LatLngExpression | undefined = hasCoords ? [latitude, longitude] : undefined
  const center: LatLngExpression = hasCoords ? [latitude, longitude] : DEFAULT_CENTER

  const initialCenter = useMemo(() => center, [])

  return (
    <MapContainer center={initialCenter} zoom={DEFAULT_ZOOM} className="z-0 h-64 w-full rounded-md border">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} onChange={onChange} />
      <MapController center={center} hasCoords={hasCoords} />
    </MapContainer>
  )
}
