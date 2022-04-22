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

type ThreeComponentProps<
  Klass extends Constructor,
  Instance = InstanceType<Klass>
> = {
  args?: ConstructorParameters<Klass>;
  ref?: Instance;
};

type ThreeComponent<
  Klass extends Constructor,
  Instance = InstanceType<Constructor>
> = Component<ThreeComponentProps<Klass, Instance>>;

export const makeThreeComponent =
  <Klass extends Constructor, Instance = InstanceType<Klass>>(
    klass: Klass
  ): ThreeComponent<Klass> =>
  (props) => {
    const [local, instanceProps] = splitProps(props, [
      "ref",
      "args",
      "children",
    ]);

    /* Create instance */
    const instance = new klass(...(local.args || [])) as Instance;

    /* Assign ref */
    typeof local.ref === "function"
      ? local.ref(instance)
      : (local.ref = instance);

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
