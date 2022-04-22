import { makeThreeComponent } from "./makeThreeComponent";

export const defaultReactor = {
  Mesh: makeThreeComponent("Mesh"),
  MeshStandardMaterial: makeThreeComponent("MeshStandardMaterial"),
  DodecahedronGeometry: makeThreeComponent("DodecahedronGeometry"),
};
