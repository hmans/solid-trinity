import {
  Component,
  createContext,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import * as THREE from "three";
import { applyProps } from "./applyProps";

export const ParentContext = createContext<any>();

type THREE = typeof THREE;

type ConstructibleTHREE = {
  [K in keyof THREE]: THREE[K] extends Constructor ? THREE[K] : never;
};

type Constructor<Instance = any> = { new (...args: any[]): Instance };

type ThreeComponentProps<Instance> = any;

type ThreeComponent<Instance> = Component<ThreeComponentProps<Instance>>;

export const makeThreeComponent =
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
