import type { Component } from "solid-js";
import * as THREE from "three";

const ThreeGame: Component = () => {
  const renderer = new THREE.WebGLRenderer();

  return renderer.domElement;
};

const App: Component = () => {
  return <ThreeGame />;
};

export default App;
