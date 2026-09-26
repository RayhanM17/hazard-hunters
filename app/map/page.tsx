import dynamic from 'next/dynamic'

const ExplorationMap = dynamic(() => import('@/components/ExplorationMap'), {
  ssr: false,
})

export default function MapPage() {
  return (
    <div className="relative left-1/2 h-[75vh] min-h-[500px] w-screen -translate-x-1/2 overflow-hidden">
      <ExplorationMap />
    </div>
  )
}
