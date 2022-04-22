import { Component, createSignal, onMount } from "solid-js"
import T, {
  onAnimationFrame,
  ThreeComponentProps,
  Trinity
} from "solid-trinity"
import { Mesh } from "three"
import { makeInstanceComponents } from "./instancing"

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
  return (
    <>
      <Boids.Root>
        <T.BoxGeometry />
        <T.MeshStandardMaterial color="yellow" />
      </Boids.Root>

      <Boids.Instance />
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
