import { World } from "miniplex"
import { Component, onCleanup, onMount, splitProps } from "solid-js"
import {
  makeThreeComponentProxy,
  onAnimationFrame,
  ThreeComponent,
  ThreeComponentProps
} from "solid-trinity"
import { Group, InstancedMesh, Object3D } from "three"

/* Create a local reactor with the Three.js classes we need */
const T = makeThreeComponentProxy({ Group, InstancedMesh, Object3D })

type InstanceEntity = {
  instance: {
    /** The Three.js scene object defining this instance's transform. */
    sceneObject: Object3D
  }
}

export const makeInstanceComponents = () => {
  /* We're using Miniplex as a state container. */
  const ecs = new World<InstanceEntity>()

  /* This component renders the InstancedMesh itself and continuously updates it
     from the data in the ECS. */
  const Root: Component<ThreeComponentProps<typeof InstancedMesh> & {
    countStep?: number
  }> = (props) => {
    let instancedMesh!: InstancedMesh

    const [local, instancedMeshProps] = splitProps(props, [
      "children",
      "countStep"
    ])

    /* The following hook will make sure this entire component gets re-rendered when
       the number of instance entities changes. We're using this to dynamically grow
       or shrink the instance buffer. */
    const { entities } = ecs.archetype("instance")

    const instanceLimit = 10000

    // const instanceLimit =
    //   Math.floor(entities.length / localProps.countStep + 1) * localProps.countStep

    function updateInstances() {
      const l = entities.length
      let count = 0
      for (let i = 0; i < l; i++) {
        const { instance } = entities[i]

        if (instance.sceneObject.visible) {
          instancedMesh.setMatrixAt(i, instance.sceneObject.matrixWorld)
          count++
        }
      }

      instancedMesh.instanceMatrix.needsUpdate = true
      instancedMesh.count = count
    }

    onAnimationFrame(updateInstances)

    return (
      <T.InstancedMesh
        ref={instancedMesh}
        {...instancedMeshProps}
        args={[null!, null!, instanceLimit]}
      >
        {local.children}
      </T.InstancedMesh>
    )
  }

  /* The Instance component will create a new ECS entity storing a reference
     to a three.js scene object. */
  const Instance: ThreeComponent<typeof Group> = (props) => {
    let group!: Group

    const [local, groupProps] = splitProps(props, ["children"])

    onMount(() => {
      const entity = ecs.createEntity({
        instance: {
          sceneObject: group
        }
      })

      onCleanup(() => ecs.destroyEntity(entity))
    })

    return (
      <T.Group ref={group} {...groupProps}>
        {local.children}
      </T.Group>
    )
  }

  return { Root, Instance }
}
