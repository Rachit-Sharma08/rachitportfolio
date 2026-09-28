import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import { PANEL_SPACING, type WorkProject } from './projectsData'
import type { PanelScreenRect } from './ProjectPanel'
import GridFloor from './GridFloor'
import ProjectPanel from './ProjectPanel'

const CAM_START_Z = 7
const CAM_FAR_Z = CAM_START_Z - 25

interface CameraRigProps {
  progressRef: MutableRefObject<number>
  blurEl?: MutableRefObject<HTMLDivElement | null>
}

function CameraRig({ progressRef, blurEl }: CameraRigProps) {
  const z = useRef(CAM_START_Z)
  const last = useRef(progressRef.current)
  const blur = useRef(0)

  useFrame(({ camera }, delta) => {
    const target =
      CAM_START_Z - progressRef.current * (CAM_START_Z - CAM_FAR_Z)
    z.current += (target - z.current) * (1 - Math.exp(-delta * 6))
    camera.position.z = z.current
    camera.lookAt(0, 0.15, z.current - 14)

    const velocity =
      Math.abs(progressRef.current - last.current) / Math.max(delta, 0.0001)
    last.current = progressRef.current

    const targetBlur = Math.min(velocity * 0.35, 8)
    blur.current += (targetBlur - blur.current) * Math.min(1, delta * 5)
    const el = blurEl?.current
    if (el) {
      if (blur.current > 0.1) el.style.filter = `blur(${blur.current.toFixed(2)}px)`
      else el.style.filter = ''
    }
  })

  return null
}

interface WorksSceneProps {
  progressRef: MutableRefObject<number>
  blurEl?: MutableRefObject<HTMLDivElement | null>
  projects?: WorkProject[]
  screenRects?: PanelScreenRect[]
}

export default function WorksScene({
  progressRef,
  blurEl,
  projects,
  screenRects,
}: WorksSceneProps) {
  const list = projects ?? []
  return (
    <Canvas
      camera={{ position: [0, 0.5, CAM_START_Z], fov: 50, near: 0.1, far: 120 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 14, 60]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 6]} intensity={1.2} />

      <GridFloor />

      {list.map((project, i) => (
        <ProjectPanel
          key={project.id}
          project={project}
          z={-i * PANEL_SPACING}
          focusRange={PANEL_SPACING * 0.75}
          screenRect={screenRects?.[i] ?? { x: 0, y: 0, w: 0, h: 0, visible: false }}
        />
      ))}

      <CameraRig progressRef={progressRef} blurEl={blurEl} />
    </Canvas>
  )
}