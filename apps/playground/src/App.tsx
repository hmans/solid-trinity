import { Component, createSignal } from "solid-js"
import T, { onAnimationFrame, Trinity } from "solid-trinity"

const Thingy = () => {
  const [rot, setRot] = createSignal(0)

  onAnimationFrame(() => {
    setRot((rot) => (rot += 0.01))
  })

  return (
    <T.Mesh rotation-z={rot()} scale={1}>
      <T.DodecahedronGeometry />
      <T.MeshStandardMaterial color="hotpink" />
    </T.Mesh>
  )
}

const App: Component = () => (
  <Trinity>
    <T.AmbientLight intensity={0.2} />
    <T.DirectionalLight position={[10, 10, 10]} intensity={0.6} />
    <Thingy />
  </Trinity>
)

export default App
