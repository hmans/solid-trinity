import {
  Component,
  createContext,
  createEffect,
  onCleanup,
  splitProps,
  useContext
} from "solid-js"
import * as THREE from "three"

export const ParentContext = createContext<any>()

type THREE = typeof THREE

export type Constructor<Instance = any> = { new (...args: any[]): Instance }

export type ThreeComponentProps<
  Klass extends Constructor<any>,
  Instance = InstanceType<Klass>
> = MainProps<Instance> &
  RefProp<Instance> &
  AttachProp &
  ConstructorArgsProps<Klass> &
  ObjectProp<Instance>

type MainProps<T> = Omit<ConvenienceProps<T>, "children" | "attach" | "args">

type ConvenienceProps<T> = {
  [K in keyof T]?: SetArgumentType<T, K> | SetScalarArgumentType<T, K>
}

type SetArgumentType<T, K extends keyof T> = T[K] extends {
  set: (...args: infer Arguments) => any
}
  ? Arguments extends [any]
    ? Arguments[0] | T[K]
    : Arguments | T[K]
  : T[K]

type SetScalarArgumentType<T, K extends keyof T> = T[K] extends {
  setScalar: (scalar: infer Argument) => any
}
  ? Argument | T[K]
  : T[K]

type AttachProp = {
  /** Attach the object to the parent property specified here. */
  attach?: string
}

type Ref<T> = { (val: T): void } | T

type RefProp<T> = { ref?: Ref<T> }

/**
 * Our wrapper components allow the user to pass an already instantiated object, or it will create a new
 * instance of the class it wraps around.
 */
type ObjectProp<T> = {
  /** If you already have an instance of the class you want to wrap, you can pass it here. */
  object?: T | { dispose?: () => void }
}

/** Some extra props we will be accepting on our wrapper component. */
type ConstructorArgsProps<TConstructor extends Constructor> = {
  /** Arguments passed to the wrapped THREE class' constructor. */
  // args?: TConstructor extends new (...args: infer V) => any ? V : never;
  args?: ConstructorParameters<TConstructor>
}

export type ThreeComponent<
  Klass extends Constructor,
  Instance = InstanceType<Klass>
> = Component<ThreeComponentProps<Klass, Instance>>

export const makeThreeComponent = <
  Klass extends Constructor,
  Instance = InstanceType<Klass>
>(
  klass: Klass
): ThreeComponent<Klass, Instance> => (props) => {
  const [local, instanceProps] = splitProps(props, [
    "ref",
    "args",
    "attach",
    "children"
  ])

  const parent = useContext(ParentContext)

  /* Create instance */
  const instance = new klass(...(local.args ?? [])) as Instance

  /* Assign ref */
  if ("ref" in props)
    typeof props.ref !== "function"
      ? (props.ref = instance)
      : (props.ref as Function)(instance)

  /* Apply props */
  createEffect(() => applyProps(instance, instanceProps))

  /* Connect to parent */
  if (instance instanceof THREE.Object3D && parent instanceof THREE.Object3D) {
    parent.add(instance)
    onCleanup(() => parent.remove(instance))
  }

  /* Attach */
  let attach: string | undefined = local.attach
  if (!attach) {
    if (instance instanceof THREE.Material) attach = "material"
    else if (instance instanceof THREE.BufferGeometry) attach = "geometry"
    else if (instance instanceof THREE.Fog) attach = "fog"
  }

  /* If the instance has an "attach" property, attach it to the parent */
  if (attach) {
    if (attach in parent) {
      parent[attach] = instance
      onCleanup(() => void (parent[attach!] = undefined))
    } else {
      console.error(
        `Property "${attach}" does not exist on parent "${parent.constructor.name}"`
      )
    }
  }

  /* Automatically dispose */
  if ("dispose" in instance) onCleanup(() => (instance as any).dispose())

  return (
    <ParentContext.Provider value={instance}>
      {local.children}
    </ParentContext.Provider>
  )
}

/**
 * Convenience method for setting (potentially nested) properties on an object.
 */
export const applyProps = (
  object: { [key: string]: any },
  props: { [key: string]: any }
) => {
  for (const key in props) {
    const value = props[key]

    /* If the key contains a hyphen, we're setting a sub property. */
    if (key.indexOf("-") > -1) {
      const [property, ...rest] = key.split("-")
      applyProps(object[property], { [rest.join("-")]: value })
    } else if (key in object) {
      if (object[key]?.setScalar && typeof value === "number") {
        object[key].setScalar(value)
      } else if (
        object[key]?.copy &&
        object[key].constructor === value.constructor
      ) {
        object[key].copy(value)
      } else if (object[key]?.set) {
        Array.isArray(value)
          ? object[key].set(...value)
          : object[key].set(value)
      } else {
        object[key] = value
      }
    }
  }
}
