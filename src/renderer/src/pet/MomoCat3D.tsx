import { useEffect, useRef, type JSX } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { PetAction } from '@shared/petActions'
import { moodDurationMs, type PetMood } from '@shared/petLife'

/** Apricot / cream from the 2D Momo PNG — stylized, not strand fur. */
const FUR = '#e39445'
const FUR_DEEP = '#c96e2c'
const CREAM = '#f7ead6'
const PAW = '#fff6ea'
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
        camera={{ position: [0, 0.7, 3.45], fov: 26, near: 0.1, far: 24 }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0)
          camera.lookAt(0, 0.62, 0)
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
    let yaw = 0.16
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
          <Blob pos={[0, 0.4, 0.02]} rad={0.46} scale={[1.12, 0.92, 1.18]} color={FUR} />
          <Blob pos={[0, 0.48, 0.22]} rad={0.34} scale={[1, 0.9, 0.95]} color={FUR} />
          <Blob pos={[0, 0.46, 0.34]} rad={0.26} scale={[0.95, 0.95, 0.7]} color={CREAM} />
          <Blob pos={[0, 0.62, 0.12]} rad={0.22} scale={[0.7, 0.45, 0.55]} color={FUR_DEEP} />
        </group>

        <group ref={head} position={[0, 0.92, 0.2]}>
          <Blob pos={[0, 0, 0]} rad={0.38} scale={[1.02, 0.96, 0.98]} color={FUR} />
          <Blob pos={[-0.2, -0.06, 0.16]} rad={0.16} color={FUR} />
          <Blob pos={[0.2, -0.06, 0.16]} rad={0.16} color={FUR} />
          <Blob pos={[0, 0.14, 0.02]} rad={0.16} scale={[0.7, 0.35, 0.5]} color={FUR_DEEP} />
          <Blob pos={[0, -0.1, 0.28]} rad={0.17} scale={[1.15, 0.8, 0.75]} color={CREAM} />
          <Ear side={-1} />
          <Ear side={1} />
          <Eye side={-1} />
          <Eye side={1} />
          <group ref={lids}>
            <Blob pos={[-0.13, 0.08, 0.3]} rad={0.11} scale={[1.05, 0.55, 0.7]} color={FUR} />
            <Blob pos={[0.13, 0.08, 0.3]} rad={0.11} scale={[1.05, 0.55, 0.7]} color={FUR} />
          </group>
          <mesh position={[0, -0.12, 0.42]} scale={[0.7, 0.5, 0.45]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={NOSE} roughness={0.35} />
          </mesh>
        </group>

        <group ref={paw} position={[-0.16, 0.12, 0.4]}>
          <Blob pos={[0, 0, 0]} rad={0.13} scale={[1.05, 0.7, 1.15]} color={PAW} />
        </group>
        <Blob pos={[0.16, 0.12, 0.4]} rad={0.13} scale={[1.05, 0.7, 1.15]} color={PAW} />
        <Blob pos={[-0.22, 0.1, -0.06]} rad={0.12} scale={[1, 0.65, 1.1]} color={PAW} />
        <Blob pos={[0.22, 0.1, -0.06]} rad={0.12} scale={[1, 0.65, 1.1]} color={PAW} />

        <group ref={tail} position={[0.34, 0.28, -0.12]}>
          <Blob pos={[0, 0, 0]} rad={0.1} color={FUR} />
          <Blob pos={[0.1, 0.08, -0.04]} rad={0.09} color={FUR} />
          <Blob pos={[0.16, 0.18, -0.02]} rad={0.085} color={FUR} />
          <Blob pos={[0.14, 0.28, 0.04]} rad={0.08} color={CREAM} />
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
    <group position={[side * 0.24, 0.28, 0.02]} rotation={[0.25, side * 0.15, side * -0.55]}>
      <mesh scale={[0.16, 0.24, 0.1]}>
        <sphereGeometry args={[1, 18, 18]} />
        <FurMaterial color={FUR} />
      </mesh>
      <mesh position={[0, 0.02, 0.04]} scale={[0.09, 0.15, 0.05]}>
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
