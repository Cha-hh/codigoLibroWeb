'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function ShippingMap({ center, onPick, interactive = true }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onPickRef = useRef(onPick)

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const container = containerRef.current
    if (container._leaflet_id) {
      container._leaflet_id = null
    }

    const map = L.map(container, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      tap: interactive,
    }).setView(center, 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const marker = L.marker(center, { icon: markerIcon }).addTo(map)

    if (interactive) {
      map.on('click', (event) => {
        if (onPickRef.current) {
          onPickRef.current(event.latlng)
        }
      })
    }

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.off()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [center, interactive])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    mapRef.current.setView(center)
    markerRef.current.setLatLng(center)
  }, [center])

  return <div ref={containerRef} className="h-72 w-full rounded-lg" />
}
