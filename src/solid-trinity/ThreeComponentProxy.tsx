import { makeThreeComponent } from "./makeThreeComponent";

export const defaultProxy = {
  Mesh: makeThreeComponent("Mesh"),
  MeshStandardMaterial: makeThreeComponent("MeshStandardMaterial"),
  DodecahedronGeometry: makeThreeComponent("DodecahedronGeometry"),
};
