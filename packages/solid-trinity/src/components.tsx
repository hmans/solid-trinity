import { Component, createEffect, onCleanup, splitProps } from "solid-js"
import * as THREE from "three"
import { getCurrentParent, popParent, pushParent } from "./parenting"

export type Constructor<Instance = any> = { new (...args: any[]): Instance }

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

type Ref<T> = (value: T) => void

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

export type ThreeComponentProps<
  Klass extends Constructor<any>,
  Instance = InstanceType<Klass>
> = MainProps<Instance> &
  RefProp<Instance> &
  AttachProp &
  ConstructorArgsProps<Klass> &
  ObjectProp<Instance>

export type ThreeComponent<
  Klass extends Constructor,
  Instance = InstanceType<Klass>
  // > = (props: PropsWithChildren<ThreeComponentProps<Klass, Instance>>) => Instance
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

  const parent = getCurrentParent()

  /* Create instance */
  const instance = new klass(...(local.args ?? [])) as Instance

  /* Assign ref */
  props.ref?.(instance)

  /* Apply props */
  applyProps(instance, instanceProps)

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

  /* Render children */
  pushParent(instance)
  local.children
  popParent()

  /* Automatically dispose */
  if ("dispose" in instance) onCleanup(() => (instance as any).dispose())

  return <>{instance}</>
}

/**
 * Convenience method for setting (potentially nested) properties on an object.
 */
export const applyProps = (
  object: { [key: string]: any },
  props: { [key: string]: any }
) => {
  for (const key in props) {
    /* If the key contains a hyphen, we're setting a sub property. */
    if (key.indexOf("-") > -1) {
      const [property, ...rest] = key.split("-")
      applyProps(object[property], { [rest.join("-")]: props[key] })
      continue
    }

    /* If the property exposes a `setScalar` function, we'll use that */
    if (object[key]?.setScalar && typeof props[key] === "number") {
      createEffect(() => object[key].setScalar(props[key]))
      continue
    }

    /* If the property exposes a `copy` function and the value is of the same type,
       we'll use that. (Vectors, Eulers, Quaternions, ...) */
    if (
      object[key]?.copy &&
      object[key].constructor === props[key].constructor
    ) {
      createEffect(() => object[key].copy(props[key]))
      continue
    }

    /* If the property exposes a `set` function, we'll use that. */
    if (object[key]?.set) {
      Array.isArray(props[key])
        ? createEffect(() => object[key].set(...props[key]))
        : createEffect(() => object[key].set(props[key]))
      continue
    }

    /* If we got here, we couldn't do anything special, so let's just check if the
       target property exists and assign it directly. */
    if (key in object) {
      createEffect(() => (object[key] = props[key]))
    }
  }
}
