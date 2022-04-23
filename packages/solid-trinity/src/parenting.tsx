export const parentStack = new Array<any>()

export const getCurrentParent = () =>
  parentStack.length > 0 ? parentStack[parentStack.length - 1] : null

export const pushParent = (parent: any) => parentStack.push(parent)

export const popParent = () => parentStack.pop()
