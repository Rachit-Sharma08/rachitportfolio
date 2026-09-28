import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { WorkProject } from './projectsData'

export interface PanelOpenEvent {
  x: number
  y: number
}

export interface PanelScreenRect {
  x: number
  y: number
  w: number
  h: number
  visible: boolean
}

interface ProjectPanelProps {
  project: WorkProject
  z: number
  focusRange?: number
  screenRect: PanelScreenRect
}

const PANEL_W = 5
const PANEL_H = 3.1
const PANEL_D = 0.12
const PANEL_Y = 0.15

function useGradientTexture(from: string, to: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 320
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 512, 320)
      grad.addColorStop(0, from)
      grad.addColorStop(1, to)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 512, 320)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [from, to])
}

export default function ProjectPanel({
  project,
  z,
  focusRange = 6,
  screenRect,
}: ProjectPanelProps) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const texture = useGradientTexture(project.accentFrom, project.accentTo)

  useFrame(({ camera }) => {
    const dist = Math.abs(camera.position.z - z)
    const focus = THREE.MathUtils.clamp(1 - dist / focusRange, 0, 1)
    const ease = focus * focus * (3 - 2 * focus)
    const scale = 0.86 + ease * 0.24
    if (group.current) {
      group.current.scale.setScalar(scale)
      group.current.position.z = z
    }
    if (mat.current) {
      mat.current.opacity = 0.35 + ease * 0.65
    }

    const hw = (PANEL_W * scale) / 2
    const hh = (PANEL_H * scale) / 2
    const frontZ = z + PANEL_D / 2
    const pts: [number, number, number][] = [
      [-hw, PANEL_Y - hh, frontZ],
      [hw, PANEL_Y - hh, frontZ],
      [hw, PANEL_Y + hh, frontZ],
      [-hw, PANEL_Y + hh, frontZ],
    ]
    const v = new THREE.Vector3()
    let inFront = camera.position.z > frontZ
    const xs: number[] = []
    const ys: number[] = []
    for (const [px, py, pz] of pts) {
      v.set(px, py, pz).project(camera)
      if (v.z > 1 || v.z < -1) inFront = false
      xs.push(v.x)
      ys.push(v.y)
    }

    if (inFront) {
      const iw = window.innerWidth
      const ih = window.innerHeight
      const left = ((Math.min(...xs) + 1) / 2) * iw
      const right = ((Math.max(...xs) + 1) / 2) * iw
      const top = ((1 - Math.max(...ys)) / 2) * ih
      const bottom = ((1 - Math.min(...ys)) / 2) * ih
      screenRect.x = left
      screenRect.y = top
      screenRect.w = right - left
      screenRect.h = bottom - top
      screenRect.visible = true
    } else {
      screenRect.visible = false
    }
  })

  return (
    <group ref={group} position={[0, PANEL_Y, z]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[PANEL_W, PANEL_H, PANEL_D]} />
        <meshBasicMaterial
          ref={mat}
          map={texture}
          transparent
          toneMapped={false}
        />
      </mesh>

      <Html
        position={[0, 0, PANEL_D / 2 + 0.01]}
        center
        transform
        distanceFactor={3.4}
        pointerEvents="none"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="flex h-full w-full flex-col justify-between"
          style={{ width: '540px', height: '335px' }}
        >
          <div className="w-fit rounded-full border border-white/20 bg-black/35 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-white/85 backdrop-blur-sm">
            {project.tag}
          </div>

          <div>
            <h3 className="text-5xl font-extrabold leading-none tracking-[-0.03em] text-white">
              {project.title}
            </h3>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/60">
              View project →
            </p>
          </div>
        </div>
      </Html>
    </group>
  )
}