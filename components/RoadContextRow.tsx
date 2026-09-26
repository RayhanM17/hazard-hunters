import { Road, CloudSun, Sun, type LucideIcon } from 'lucide-react'
import type { RoadType, Weather, TimeOfDay } from '@/types'

interface Props {
  roadType: RoadType | null
  weather: Weather | null
  timeOfDay: TimeOfDay | null
}

export const ROAD_LABELS: Record<RoadType, string> = {
  HIGHWAY: 'Highway',
  ARTERIAL: 'Arterial',
  RESIDENTIAL: 'Residential',
  RURAL: 'Rural',
  PARKING_LOT: 'Parking Lot',
  UNKNOWN: 'Unknown Road',
}

export const WEATHER_LABELS: Record<Weather, string> = {
  CLEAR: 'Clear',
  RAINY: 'Rainy',
  SNOWY: 'Snowy',
  FOGGY: 'Foggy',
  OVERCAST: 'Overcast',
  NIGHT: 'Night',
  UNKNOWN: 'Unknown Weather',
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  DAWN: 'Dawn',
  DAYTIME: 'Daytime',
  DUSK: 'Dusk',
  NIGHT: 'Night',
  UNKNOWN: 'Unknown Time',
}

function Chip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
      <Icon size={12} />
      {label}
    </span>
  )
}

export default function RoadContextRow({ roadType, weather, timeOfDay }: Props) {
  if (!roadType && !weather && !timeOfDay) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {roadType && <Chip icon={Road} label={ROAD_LABELS[roadType]} />}
      {weather && <Chip icon={CloudSun} label={WEATHER_LABELS[weather]} />}
      {timeOfDay && <Chip icon={Sun} label={TIME_LABELS[timeOfDay]} />}
    </div>
  )
}
