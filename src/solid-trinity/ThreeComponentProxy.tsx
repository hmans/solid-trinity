import { makeThreeComponent } from "./makeThreeComponent";
import * as THREE from "three";

export const defaultProxy = {
  Mesh: makeThreeComponent(THREE.Mesh),
  MeshStandardMaterial: makeThreeComponent(THREE.MeshStandardMaterial),
  DodecahedronGeometry: makeThreeComponent(THREE.DodecahedronGeometry),
};
