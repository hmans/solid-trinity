import {
  Component,
  createContext,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import * as THREE from "three";
import { applyProps } from "./applyProps";

const onAnimationFrame = (fn: Function) => {
  let running = true;

  const animate = () => {
    fn();
    if (running) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  onCleanup(() => (running = false));
};

const ParentContext = createContext<any>();

type THREE = typeof THREE;

type ConstructibleTHREE = {
  [K in keyof THREE]: THREE[K] extends Constructor ? THREE[K] : never;
};

type Constructor<Instance = any> = { new (...args: any[]): Instance };

type ThreeComponentProps<Instance> = any;

type ThreeComponent<Instance> = Component<ThreeComponentProps<Instance>>;

const makeThreeComponent =
  <TName extends keyof ConstructibleTHREE, Klass = ConstructibleTHREE[TName]>(
    name: TName
  ): ThreeComponent<Klass> =>
  (props) => {
    const [local, instanceProps] = splitProps(props, ["children"]);

    /* Fetch the constructor */
    const klass = THREE[name] as ConstructibleTHREE[TName];

    /* Create instance */
    const instance = new klass();

    /* Assign ref */
    typeof props.ref === "function"
      ? props.ref(instance)
      : (props.ref = instance);

    /* Connect to parent */
    const parent = useContext(ParentContext);
    if (
      instance instanceof THREE.Object3D &&
      parent instanceof THREE.Object3D
    ) {
      parent.add(instance);
      onCleanup(() => parent.remove(instance));
    }

    /* Attach */
    if (instance instanceof THREE.Material) parent.material = instance;
    if (instance instanceof THREE.BufferGeometry) parent.geometry = instance;

    /* Apply props */
    applyProps(instance, instanceProps);

    /* Automatically dispose */
    if ("dispose" in instance) onCleanup(() => instance.dispose());

    return (
      <ParentContext.Provider value={instance}>
        {local.children}
      </ParentContext.Provider>
    );
  };

const T = {
  Mesh: makeThreeComponent("Mesh"),
  MeshStandardMaterial: makeThreeComponent("MeshStandardMaterial"),
  DodecahedronGeometry: makeThreeComponent("DodecahedronGeometry"),
};

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

const App: Component = () => {
  let mesh: THREE.Mesh | null = null;

  onAnimationFrame(() => {
    mesh!.rotation.x = mesh!.rotation.y += 0.01;
  });

  return (
    <ThreeGame>
      <T.Mesh ref={mesh} scale={2}>
        <T.DodecahedronGeometry />
        <T.MeshStandardMaterial color="hotpink" />
      </T.Mesh>
    </ThreeGame>
  );
};

export default App;
