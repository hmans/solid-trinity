import { World } from "miniplex"
import { Component, createSignal, For, onMount } from "solid-js"
import T, {
  onAnimationFrame,
  ThreeComponentProps,
  Trinity
} from "solid-trinity"
import { Mesh, Vector3 } from "three"
import { makeInstanceComponents } from "./instancing"

type Entity = {
  position: Vector3
}

interface IVector3 {
  x: number
  y: number
  z: number
}

const world = new World()

const Thingy: Component<ThreeComponentProps<typeof Mesh> & {
  color?: string
}> = (props) => {
  const [rot, setRot] = createSignal(0)

  onAnimationFrame(() => {
    setRot((rot) => (rot += 0.01))
  })

  return (
    <T.Mesh {...props} rotation-z={rot()} scale={1}>
      <T.DodecahedronGeometry />
      <T.MeshStandardMaterial color={props.color ?? "hotpink"} />
    </T.Mesh>
  )
}

const Boids = makeInstanceComponents()

const makePositions = () => {
  const positions = new Array<IVector3>()

  for (let i = 0; i < 100; i++) {
    positions.push({
      x: Math.random() * 50 - 25,
      y: Math.random() * 50 - 25,
      z: Math.random() * 50 - 25
    })
  }

  return positions
}

const Swarm = () => {
  const [positions, setPositions] = createSignal<IVector3[]>(makePositions())

  onAnimationFrame(() => {
    setPositions((positions) =>
      positions.map((pos) => ({ ...pos, x: pos.x + 1 }))
    )
  })

  return (
    <>
      <Boids.Root>
        <T.BoxGeometry />
        <T.MeshStandardMaterial color="yellow" />
      </Boids.Root>

      <For each={positions()}>
        {(pos) => {
          return <Boids.Instance position={[pos.x, pos.y, pos.z]} />
        }}
      </For>
    </>
  )
}

const App: Component = () => (
  <Trinity>
    <T.AmbientLight intensity={0.2} />
    <T.DirectionalLight position={[10, 10, 10]} intensity={0.6} />

    <Swarm />

    <Thingy position-x={-5} color="red" />
    <Thingy position-x={+5} />
  </Trinity>
)

export default App
