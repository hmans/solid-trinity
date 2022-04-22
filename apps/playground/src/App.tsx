import { World } from "miniplex"
import {
  batch,
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Signal
} from "solid-js"
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

const Swarm = () => {
  const positions = new Array<Signal<Vector3>>()

  for (let i = 0; i < 5000; i++) {
    positions.push(
      createSignal<Vector3>(
        new Vector3(
          Math.random() * 50 - 25,
          Math.random() * 50 - 25,
          Math.random() * 50 - 25
        ),
        { equals: false }
      )
    )
  }

  const animatePositions = () => {
    for (const [_, setPos] of positions) {
      setPos((pos) => {
        pos.x += 0.01
        return pos
      })
    }
  }

  onAnimationFrame(() => batch(animatePositions))

  return (
    <>
      <Boids.Root>
        <T.MeshStandardMaterial color="green" />
        <T.BoxGeometry />
      </Boids.Root>

      <For each={positions}>
        {([pos]) => <Boids.Instance position={pos()} />}
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
