import { Component } from "solid-js"
import * as THREE from "three"
import { parentStack } from "./components"
import { onAnimationFrame } from "./hooks"

export const Trinity: Component = (props) => {
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  /* Cool! */
  const scene = new THREE.Scene()
  parentStack.push(scene)
  props.children
  parentStack.pop()

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight
  )
  camera.position.z = 10

  onAnimationFrame(() => {
    renderer.render(scene, camera)
  })

  return renderer.domElement
}
