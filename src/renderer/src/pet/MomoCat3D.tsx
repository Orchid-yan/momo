import { useEffect, useRef, type JSX } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { PetAction } from '@shared/petActions'
import { moodDurationMs, type PetMood } from '@shared/petLife'

/** Apricot / cream from the 2D Momo PNG — stylized, not strand fur. */
const FUR = '#ee9b48'
const FUR_DEEP = '#d4782c'
const CREAM = '#fff1dc'
const PAW = '#fffaf2'
const NOSE = '#ee9aa8'
const EAR = '#f2b8b0'
const IRIS = '#4a2c1a'
const PUPIL = '#16100c'

interface MomoCat3DProps {
  action?: PetAction | null
  mood?: PetMood
}

export default function MomoCat3D({ action = null, mood = 'idle' }: MomoCat3DProps): JSX.Element {
  const acting = action ? ` is-acting act-${action}` : ` is-${mood}`
  return (
    <div className={`momo-3d-wrap${acting}`} data-testid="momo-3d">
      <span className="momo-fx momo-fx-hearts" aria-hidden>
        ♡
      </span>
      <span className="momo-fx momo-fx-hearts momo-fx-hearts-r" aria-hidden>
        ♡
      </span>
      <span className="momo-fx momo-fx-sparkles" aria-hidden>
        ✦
      </span>
      <span className="momo-fx momo-fx-zzz" aria-hidden>
        zzz
      </span>
      <Canvas
        flat
        dpr={[1, 1.75]}
        frameloop="always"
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
          powerPreference: 'low-power'
        }}
        camera={{ position: [0, 1.05, 3.7], fov: 24, near: 0.1, far: 24 }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0)
          camera.lookAt(0, 0.55, 0)
        }}
        style={{ pointerEvents: 'none', background: 'transparent' }}
      >
        <GingerKitten action={action} mood={mood} />
      </Canvas>
    </div>
  )
}

function FurMaterial({ color }: { color: string }): JSX.Element {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.7}
      metalness={0}
      sheen={1}
      sheenColor="#ffd2a0"
      sheenRoughness={0.52}
      clearcoat={0.06}
      clearcoatRoughness={0.75}
    />
  )
}

function GingerKitten({ action, mood }: { action: PetAction | null; mood: PetMood }): JSX.Element {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const lids = useRef<Group>(null)
  const tail = useRef<Group>(null)
  const paw = useRef<Group>(null)
  const started = useRef(performance.now())

  useEffect(() => {
    started.current = performance.now()
  }, [mood, action])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const dur = action ? 1150 : Math.max(moodDurationMs(mood), 800)
    const p = Math.min(1, (performance.now() - started.current) / dur)
    const bounce = Math.sin(p * Math.PI)

    let x = 0
    let y = 0
    let roll = 0
    let yaw = 0.08
    let breath = 1 + Math.sin(t * 2.15) * 0.02
    let headPitch = Math.sin(t * 2.15) * 0.035
    let headYaw = 0
    let lid = mood === 'sleepy' ? 0.82 : 0.06
    let pawLift = 0
    let tailWag = Math.sin(t * 2.4) * 0.18

    if (mood === 'sleepy') {
      breath = 1 + Math.sin(t * 1.05) * 0.012
      headPitch = 0.32 + Math.sin(t * 1.05) * 0.025
      y = -0.03
      tailWag *= 0.2
    } else if (mood === 'stretch' || action === 'stretch') {
      y = bounce * 0.1
      breath = 1 + bounce * 0.08
      headPitch = -0.22 * bounce
    } else if (mood === 'hop' || action === 'sparkle') {
      y = bounce * 0.28
    } else if (mood === 'slide') {
      x = bounce * 0.2
    } else if (action === 'nuzzle') {
      headYaw = Math.sin(t * 7.5) * 0.22
      headPitch = 0.12
      roll = Math.sin(t * 7.5) * 0.08
    } else if (action === 'wave') {
      pawLift = 0.55 + Math.sin(t * 11) * 0.32
    } else if (action === 'roll') {
      roll = Math.sin(t * 6) * 0.16
      y = Math.abs(Math.sin(t * 6)) * 0.04
    }

    const g = root.current
    if (g) {
      g.position.set(x, y - 0.12, 0)
      g.rotation.set(0, yaw, roll)
    }
    if (body.current) {
      body.current.scale.set(2 - breath, breath, 2 - breath)
    }
    if (head.current) {
      head.current.rotation.set(headPitch, headYaw, 0)
    }
    if (lids.current) {
      lids.current.scale.y = 0.25 + lid * 1.4
      lids.current.position.y = 0.1 - lid * 0.06
    }
    if (tail.current) {
      tail.current.rotation.z = -0.35 + tailWag
    }
    if (paw.current) {
      paw.current.rotation.x = -pawLift
      paw.current.position.y = 0.12 + pawLift * 0.12
    }
  })

  return (
    <group>
      <hemisphereLight args={['#fff6ea', '#c9a07a', 0.9]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[1.6, 2.4, 1.8]} intensity={1.4} color="#fff3e4" />
      <directionalLight position={[-1.5, 0.6, 1.1]} intensity={0.32} color="#ffc09a" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0.08]} scale={[0.7, 0.42, 1]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#3a2418" transparent opacity={0.18} />
      </mesh>

      <group ref={root}>
        <group ref={body}>
          <Blob pos={[0, 0.28, 0.02]} rad={0.4} scale={[1.45, 0.72, 1.12]} color={FUR} />
          <Blob pos={[-0.34, 0.22, 0.02]} rad={0.2} scale={[0.85, 0.95, 1]} color={FUR} />
          <Blob pos={[0.34, 0.22, 0.02]} rad={0.2} scale={[0.85, 0.95, 1]} color={FUR} />
          <Blob pos={[0, 0.32, 0.28]} rad={0.28} scale={[1.05, 0.78, 0.62]} color={CREAM} />
          <Blob pos={[0, 0.42, 0.08]} rad={0.18} scale={[0.85, 0.4, 0.7]} color={FUR_DEEP} />
        </group>

        <group ref={head} position={[0, 0.78, 0.16]}>
          <Blob pos={[0, 0, 0]} rad={0.36} scale={[1.08, 0.98, 1]} color={FUR} />
          <Blob pos={[-0.22, -0.08, 0.14]} rad={0.14} color={FUR} />
          <Blob pos={[0.22, -0.08, 0.14]} rad={0.14} color={FUR} />
          <Blob pos={[0, 0.12, 0.04]} rad={0.14} scale={[0.75, 0.32, 0.5]} color={FUR_DEEP} />
          <Blob pos={[0, -0.12, 0.26]} rad={0.16} scale={[1.2, 0.78, 0.72]} color={CREAM} />
          <Ear side={-1} />
          <Ear side={1} />
          <Eye side={-1} />
          <Eye side={1} />
          <group ref={lids}>
            <Blob pos={[-0.13, 0.1, 0.28]} rad={0.11} scale={[1.05, 0.5, 0.65]} color={FUR} />
            <Blob pos={[0.13, 0.1, 0.28]} rad={0.11} scale={[1.05, 0.5, 0.65]} color={FUR} />
          </group>
          <mesh position={[0, -0.14, 0.4]} scale={[0.85, 0.55, 0.5]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial color={NOSE} roughness={0.35} />
          </mesh>
        </group>

        <group ref={paw} position={[-0.15, 0.07, 0.42]}>
          <Blob pos={[0, 0, 0]} rad={0.12} scale={[1.15, 0.55, 1.35]} color={PAW} />
        </group>
        <Blob pos={[0.15, 0.07, 0.42]} rad={0.12} scale={[1.15, 0.55, 1.35]} color={PAW} />
        <Blob pos={[-0.26, 0.08, -0.12]} rad={0.11} scale={[1.05, 0.55, 1.2]} color={PAW} />
        <Blob pos={[0.26, 0.08, -0.12]} rad={0.11} scale={[1.05, 0.55, 1.2]} color={PAW} />

        <group ref={tail} position={[0.42, 0.22, -0.08]}>
          <Blob pos={[0, 0, 0]} rad={0.09} color={FUR} />
          <Blob pos={[0.09, 0.1, -0.03]} rad={0.085} color={FUR} />
          <Blob pos={[0.12, 0.22, 0]} rad={0.08} color={FUR} />
          <Blob pos={[0.08, 0.32, 0.06]} rad={0.075} color={CREAM} />
        </group>
      </group>
    </group>
  )
}

function Blob({
  pos,
  rad,
  scale = [1, 1, 1],
  color
}: {
  pos: [number, number, number]
  rad: number
  scale?: [number, number, number]
  color: string
}): JSX.Element {
  return (
    <mesh position={pos} scale={scale}>
      <sphereGeometry args={[rad, 28, 28]} />
      <FurMaterial color={color} />
    </mesh>
  )
}

function Ear({ side }: { side: -1 | 1 }): JSX.Element {
  return (
    <group position={[side * 0.2, 0.26, 0]} rotation={[0.15, side * 0.1, side * -0.38]}>
      <mesh scale={[0.15, 0.26, 0.1]}>
        <sphereGeometry args={[1, 18, 18]} />
        <FurMaterial color={FUR} />
      </mesh>
      <mesh position={[0, 0.04, 0.045]} scale={[0.07, 0.2, 0.04]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial color={EAR} roughness={0.55} />
      </mesh>
    </group>
  )
}

function Eye({ side }: { side: -1 | 1 }): JSX.Element {
  return (
    <group position={[side * 0.125, 0.04, 0.3]}>
      <mesh scale={[1, 1.12, 0.72]}>
        <sphereGeometry args={[0.105, 20, 20]} />
        <meshStandardMaterial color="#fffdf8" roughness={0.28} />
      </mesh>
      <mesh position={[side * -0.012, -0.012, 0.055]} scale={[0.62, 0.72, 0.48]}>
        <sphereGeometry args={[0.105, 16, 16]} />
        <meshStandardMaterial color={IRIS} roughness={0.45} />
      </mesh>
      <mesh position={[side * -0.012, -0.016, 0.09]} scale={[0.3, 0.36, 0.28]}>
        <sphereGeometry args={[0.105, 12, 12]} />
        <meshStandardMaterial color={PUPIL} />
      </mesh>
      <mesh position={[0.028, 0.032, 0.1]} scale={[0.16, 0.2, 0.12]}>
        <sphereGeometry args={[0.105, 10, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}
