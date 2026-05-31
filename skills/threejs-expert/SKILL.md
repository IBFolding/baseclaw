---
name: threejs-expert
description: Create 3D visuals, animations, and interactive experiences with Three.js and React Three Fiber.
triggers:
  - three.js
  - 3D
  - webgl
  - animation
  - react three fiber
  - r3f
role: specialist
scope: implementation
output-format: code
---

# Three.js Expert

Create immersive 3D experiences for web applications using Three.js and React Three Fiber.

## When to Use

- Hero sections with 3D elements
- Animated token visualizations
- Interactive data visualizations
- Particle effects
- 3D charts and graphs

## Installation

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

## Common Patterns

### 1. Basic Scene Setup

```tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'

export function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls />
      <Environment preset="city" />
      {/* Your 3D objects */}
    </Canvas>
  )
}
```

### 2. Animated Token Sphere

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'

export function TokenSphere() {
  const meshRef = useRef()
  
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15
  })
  
  return (
    <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.5}>
      <MeshDistortMaterial
        color="#F97316"
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  )
}
```

### 3. Floating Coins

```tsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'

export function FloatingCRD({ position }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group position={position}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial color="#F97316" metalness={0.8} roughness={0.2} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.3}
          color="#7C2D12"
          anchorX="center"
          anchorY="middle"
        >
          CRD
        </Text>
      </group>
    </Float>
  )
}
```

### 4. Particle Field

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function ParticleField({ count = 1000 }) {
  const points = useRef()
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [count])
  
  useFrame((state) => {
    points.current.rotation.y = state.clock.getElapsedTime() * 0.05
  })
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#F97316" transparent opacity={0.6} />
    </points>
  )
}
```

### 5. Hero Section with 3D

```tsx
'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { TokenSphere, FloatingCRD, ParticleField } from './3d-components'

export function Hero3D() {
  return (
    <div className="h-[60vh] w-full relative">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <TokenSphere />
          <FloatingCRD position={[-2, 1, 0]} />
          <FloatingCRD position={[2, -1, 0]} />
          <ParticleField count={500} />
        </Suspense>
      </Canvas>
      
      {/* Overlay content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            Money for Machines
          </h1>
        </div>
      </div>
    </div>
  )
}
```

## Performance Tips

1. **Use `useMemo`** for expensive calculations
2. **Limit particle count** on mobile
3. **Use `drei` helpers** for optimized abstractions
4. **Implement LOD** (Level of Detail) for complex models
5. **Use instanced meshes** for repeated objects

## ClawReserve Use Cases

1. **3D Token Showcase** — Animated CRD/SHELL/vCRD tokens
2. **Hero Background** — Floating coins with particle effects  
3. **Data Visualization** — 3D charts for TVL, volume
4. **Loading States** — Animated 3D loaders
5. **Governance Viz** — 3D representation of voting power

## Output Format

Provide:
1. Component code
2. Installation commands
3. Usage example
4. Performance notes