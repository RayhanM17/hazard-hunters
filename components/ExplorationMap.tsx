'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from 'react-leaflet'
import type { Layer } from 'leaflet'
import type { Feature, Geometry } from 'geojson'
import 'leaflet/dist/leaflet.css'
import { Loader2, MapPinned, Flame, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getHazard, SEVERITY_COLORS } from '@/lib/hazards'
import { DANGER_COLORS, parseGeoJson, severityGradientColor, escapeHtml } from '@/lib/geo'
import HazardBadge from './HazardBadge'
import ConfidenceBadge from './ConfidenceBadge'
import type { ExplorationHex, HeatmapHex, Zone, SubmissionPin } from '@/types'

type Mode = 'mine' | 'heatmap' | 'zones'

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795]
const DEFAULT_ZOOM = 4
const LOCATED_ZOOM = 15

/**
 * MapContainer's `center`/`zoom` props only take effect on the initial mount — Leaflet's own
 * docs call this out, changing them afterwards does nothing. This drives the already-mounted
 * map imperatively whenever the resolved center changes (e.g. once geolocation/pins resolve).
 */
function RecenterOnLocate({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

const TABS: { key: Mode; label: string; icon: typeof MapPinned }[] = [
  { key: 'mine', label: 'My Territory', icon: MapPinned },
  { key: 'heatmap', label: 'Community Heatmap', icon: Flame },
  { key: 'zones', label: 'Zone Battles', icon: Trophy },
]

function featureCollection<P>(items: P[], getGeoJson: (item: P) => string) {
  return {
    type: 'FeatureCollection' as const,
    features: items
      .map((item) => ({
        type: 'Feature' as const,
        geometry: parseGeoJson<Geometry>(getGeoJson(item)),
        properties: item as unknown as Record<string, unknown>,
      }))
      .filter((f): f is Feature<Geometry, Record<string, unknown>> => f.geometry !== null),
  }
}

export default function ExplorationMap() {
  const [mode, setMode] = useState<Mode>('mine')

  const [mine, setMine] = useState<{ hexes: ExplorationHex[]; pins: SubmissionPin[] } | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapHex[] | null>(null)
  const [zones, setZones] = useState<Zone[] | null>(null)
  const [loading, setLoading] = useState(false)

  // Fallback for a first-time user with no submissions yet — live GPS, best-effort.
  const [geoCenter, setGeoCenter] = useState<[number, number] | null>(null)
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeoCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 5000, maximumAge: 60_000 },
    )
  }, [])

  // Preferred: the location of the user's most recent submission — "where I'm actually hunting
  // hazards", not just wherever the browser currently is. Takes priority once it loads.
  const pinCenter: [number, number] | null =
    mine && mine.pins.length > 0 ? [mine.pins[0].latitude, mine.pins[0].longitude] : null

  const center = pinCenter ?? geoCenter ?? DEFAULT_CENTER
  const zoom = pinCenter || geoCenter ? LOCATED_ZOOM : DEFAULT_ZOOM

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (mode === 'mine' && mine) return
      if (mode === 'heatmap' && heatmap) return
      if (mode === 'zones' && zones) return

      setLoading(true)
      try {
        if (mode === 'mine') {
          const res = await fetch('/api/map/mine')
          const data = await res.json()
          if (!cancelled) setMine(data)
        } else if (mode === 'heatmap') {
          const res = await fetch('/api/map/heatmap')
          const data = await res.json()
          if (!cancelled) setHeatmap(data)
        } else {
          const res = await fetch('/api/zones')
          const data = await res.json()
          if (!cancelled) setZones(data)
        }
      } catch {
        // best-effort — map just stays empty for this mode
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [mode, mine, heatmap, zones])

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-3 z-[1000] inline-flex -translate-x-1/2 rounded-full border border-slate-800 bg-slate-900/95 p-1 shadow-lg backdrop-blur-sm">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              mode === key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-100',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="absolute right-3 top-3 z-[1000] flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/95 px-3 py-1.5 text-xs text-indigo-300">
          <Loader2 size={12} className="animate-spin" /> Loading…
        </div>
      )}

      {mode === 'mine' && <div className="pointer-events-none absolute inset-0 z-[350] bg-slate-950/40" />}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="dark-tiles h-full w-full"
        style={{ background: '#020617' }}
      >
        <RecenterOnLocate center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mode === 'mine' && mine && (
          <>
            <GeoJSON
              key={`mine-hexes-${mine.hexes.length}`}
              data={featureCollection(mine.hexes, (h) => h.hexGeoJson)}
              style={(feature) => {
                const level = (feature?.properties as ExplorationHex).cellDangerLevel
                return {
                  fillColor: DANGER_COLORS[level],
                  fillOpacity: 0.75,
                  color: 'rgba(224, 242, 254, 0.55)',
                  weight: 1.5,
                }
              }}
              onEachFeature={(feature: Feature, layer: Layer) => {
                const p = feature.properties as ExplorationHex
                layer.bindTooltip(
                  `<div class="text-xs"><strong>${escapeHtml(p.hexId)}</strong><br/>` +
                    `${p.totalObservations} observation${p.totalObservations === 1 ? '' : 's'} · ${p.hazardsInCell} hazard${p.hazardsInCell === 1 ? '' : 's'}<br/>` +
                    `${p.hazardTypesFound ? escapeHtml(p.hazardTypesFound) : 'No hazards found'}</div>`,
                  { sticky: true },
                )
              }}
            />
            {mine.pins.map((pin) => {
              const meta = getHazard(pin.hazardType)
              return (
                <CircleMarker
                  key={pin.submissionId}
                  center={[pin.latitude, pin.longitude]}
                  radius={7}
                  pathOptions={{
                    color: '#0f172a',
                    weight: 2,
                    fillColor: SEVERITY_COLORS[pin.severity],
                    fillOpacity: 0.95,
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px] space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <HazardBadge type={pin.hazardType} size="sm" />
                        <ConfidenceBadge confidence={pin.confidence} />
                      </div>
                      {pin.description && <p className="text-xs text-slate-300">{pin.description}</p>}
                      <p className="text-xs text-slate-400">
                        Severity {pin.severity} · <span className="font-semibold text-emerald-400">+{pin.pointsAwarded} pts</span>
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </>
        )}

        {mode === 'heatmap' && heatmap && (
          <GeoJSON
            key={`heatmap-${heatmap.length}`}
            data={featureCollection(heatmap, (h) => h.hexGeoJson)}
            style={(feature) => {
              const avg = (feature?.properties as HeatmapHex).avgSeverity
              return {
                fillColor: severityGradientColor(avg ?? 1),
                fillOpacity: 0.6,
                color: 'rgba(255, 255, 255, 0.35)',
                weight: 1,
              }
            }}
            onEachFeature={(feature: Feature, layer: Layer) => {
              const p = feature.properties as HeatmapHex
              layer.bindTooltip(
                `<div class="text-xs"><strong>${p.totalHazards} hazard${p.totalHazards === 1 ? '' : 's'}</strong> · ${p.uniqueReporters} reporter${p.uniqueReporters === 1 ? '' : 's'}<br/>Avg severity ${p.avgSeverity.toFixed(1)}</div>`,
                { sticky: true },
              )
            }}
          />
        )}

        {mode === 'zones' && zones && (
          <GeoJSON
            key={`zones-${zones.length}`}
            data={featureCollection(zones, (z) => z.zoneGeoJson)}
            style={{
              fillColor: 'rgba(99, 102, 241, 0.25)',
              fillOpacity: 0.25,
              color: 'rgba(129, 140, 248, 0.85)',
              weight: 2,
              dashArray: '4 4',
            }}
            onEachFeature={(feature: Feature, layer: Layer) => {
              const p = feature.properties as Zone
              layer.bindTooltip(
                `<div class="text-xs"><strong>Zone #${p.zoneRank}</strong><br/>${p.hazardsReported} hazard${p.hazardsReported === 1 ? '' : 's'} · ${p.activeScouts} scout${p.activeScouts === 1 ? '' : 's'}<br/>${p.cellsMapped} cell${p.cellsMapped === 1 ? '' : 's'} mapped</div>`,
                { sticky: true, permanent: false },
              )
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
