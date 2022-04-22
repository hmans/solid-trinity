import { Component } from "solid-js";
import * as THREE from "three";
import T, { onAnimationFrame, ParentContext } from "./solid-trinity";

const ThreeGame: Component = (props) => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();

  scene.add(new THREE.AmbientLight());
  scene.add(new THREE.DirectionalLight());

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight
  );
  camera.position.z = 10;

  onAnimationFrame(() => {
    renderer.render(scene, camera);
  });

  return (
    <>
      {renderer.domElement}
      <ParentContext.Provider value={scene}>
        {props.children}
      </ParentContext.Provider>
    </>
  );
};

const Thingy = () => {
  let mesh: THREE.Mesh | null = null;

  onAnimationFrame(() => {
    mesh!.rotation.x = mesh!.rotation.y += 0.01;
  });

  return (
    <T.Mesh ref={mesh} scale={2}>
      <T.DodecahedronGeometry />
      <T.MeshStandardMaterial color="hotpink" />
    </T.Mesh>
  );
};

const App: Component = () => (
  <ThreeGame>
    <Thingy />
  </ThreeGame>
);

export default App;
