import { Component } from "solid-js"
import * as THREE from "three"
import { onAnimationFrame } from "./hooks"
import { popParent, pushParent } from "./parenting"

export const Trinity: Component = (props) => {
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  /* Make a scene */
  const scene = new THREE.Scene()
  pushParent(scene)
  props.children
  popParent()

  /* Make a default camera */
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
