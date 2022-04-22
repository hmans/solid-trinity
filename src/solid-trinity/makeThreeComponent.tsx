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

type Constructor<Instance = any> = { new (...args: any[]): Instance };

type ThreeComponentProps<
  Klass extends Constructor,
  Instance = InstanceType<Klass>
> = MainProps<Instance> &
  RefProp<Instance> &
  AttachProp &
  ConstructorArgsProps<Klass> &
  ObjectProp<Instance>;

type MainProps<T> = Omit<ConvenienceProps<T>, "children" | "attach" | "args">;

type ConvenienceProps<T> = {
  [K in keyof T]?: SetArgumentType<T, K> | SetScalarArgumentType<T, K>;
};

type SetArgumentType<T, K extends keyof T> = T[K] extends {
  set: (...args: infer Arguments) => any;
}
  ? Arguments extends [any]
    ? Arguments[0] | T[K]
    : Arguments | T[K]
  : T[K];

type SetScalarArgumentType<T, K extends keyof T> = T[K] extends {
  setScalar: (scalar: infer Argument) => any;
}
  ? Argument | T[K]
  : T[K];

type AttachProp = {
  /** Attach the object to the parent property specified here. */
  attach?: string;
};

type RefProp<T> = { ref?: T | null | ((val: T | null) => void) };

/**
 * Our wrapper components allow the user to pass an already instantiated object, or it will create a new
 * instance of the class it wraps around.
 */
type ObjectProp<T> = {
  /** If you already have an instance of the class you want to wrap, you can pass it here. */
  object?: T | { dispose?: () => void };
};

/** Some extra props we will be accepting on our wrapper component. */
type ConstructorArgsProps<TConstructor> = {
  /** Arguments passed to the wrapped THREE class' constructor. */
  args?: TConstructor extends new (...args: infer V) => any ? V : never;
};

type ThreeComponent<
  Klass extends Constructor,
  Instance = InstanceType<Constructor>
> = Component<ThreeComponentProps<Klass, Instance>>;

export const makeThreeComponent =
  <Klass extends Constructor, Instance = InstanceType<Klass>>(
    klass: Klass
  ): ThreeComponent<Klass, Instance> =>
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
