import { batch, Component, createSignal, For, Signal } from "solid-js"
import T, {
  onAnimationFrame,
  ThreeComponentProps,
  Trinity
} from "solid-trinity"
import { Mesh, Vector3 } from "three"
import { makeInstanceComponents } from "./instancing"

const Thingy: Component<ThreeComponentProps<typeof Mesh> & {
  color?: string
}> = (props) => {
  const [rot, setRot] = createSignal(0)

  onAnimationFrame(() => {
    setRot((rot) => rot + 0.01)
  })

  return (
    <T.Mesh {...props} rotation={[rot(), rot(), 0]} scale={1}>
      <T.DodecahedronGeometry />
      <T.MeshStandardMaterial color={props.color ?? "hotpink"} />
    </T.Mesh>
  )
}

const Boids = makeInstanceComponents()

const RotatingCube = () => {
  const [rotation, setRotation] = createSignal(0)

  let mesh!: Mesh

  onAnimationFrame(() => {
    setRotation((rotation) => rotation + 0.01)
  })

  return (
    <T.Mesh rotation={[rotation(), rotation(), 0]} ref={mesh}>
      <T.BoxGeometry />
      <T.MeshStandardMaterial color="hotpink" />
    </T.Mesh>
  )
}

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
    <RotatingCube />

    <Thingy position-x={-5} color="red" />
    <Thingy position-x={+5} />
  </Trinity>
)

export default App
