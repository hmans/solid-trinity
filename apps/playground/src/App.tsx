import { Component } from "solid-js"
import * as THREE from "three"
import T, { onAnimationFrame, ParentContext } from "./solid-trinity"

const Thingy = () => {
  let mesh: THREE.Mesh = null!

  onAnimationFrame(() => {
    mesh.rotation.x = mesh.rotation.y += 0.01
  })

  return (
    <T.Mesh ref={mesh} scale={1}>
      <T.DodecahedronGeometry />
      <T.MeshStandardMaterial color="hotpink" />
    </T.Mesh>
  )
}

const App: Component = () => (
  <ThreeGame>
    <T.AmbientLight intensity={0.2} />
    <T.DirectionalLight position={[10, 10, 10]} intensity={0.6} />
    <Thingy />
  </ThreeGame>
)

export default App
