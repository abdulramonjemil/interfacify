function isObject(value) {
  return (
    typeof value === "function" || (typeof value === "object" && value !== null)
  )
}

function isInheritor(firstObject, secondObject) {
  if (firstObject === null) return false
  const protoOfFirstObject = Object.getPrototypeOf(firstObject)

  if (protoOfFirstObject === secondObject) return true
  return isInheritor(protoOfFirstObject, secondObject)
}

/**
 * This function checks whether a class extends another class (directly or
 * indirectly). For example, if class 'C' extends class 'B', and class 'B'
 * extends class 'A', this function will return true when passed 'C' and 'A'
 * (in that order).
 */
function isExtender(firstClass, secondClass) {
  if (typeof firstClass !== "function")
    throw new TypeError(`${firstClass} is not a class`)

  if (typeof secondClass !== "function")
    throw new TypeError(`${secondClass} is not a class`)

  if (!isObject(firstClass.prototype) || !isObject(secondClass.prototype))
    return false

  let mediatorClass = firstClass
  while (mediatorClass !== null) {
    const protoOfMediatorClass = Object.getPrototypeOf(mediatorClass)
    const protoOfMediatorClassPrototype = Object.getPrototypeOf(
      mediatorClass.prototype
    )
    if (protoOfMediatorClassPrototype !== protoOfMediatorClass.prototype)
      return false

    if (
      protoOfMediatorClass === secondClass &&
      protoOfMediatorClassPrototype === secondClass.prototype
    )
      return true

    mediatorClass = protoOfMediatorClass
  }
  return false
}

/**
 * Generates an appropriate compare function for sorting values in an array.
 * For example, the array '[{ name: "Bola" }, { name: "Ade" }]' cannot be
 * sorted directly with the 'sort()' method as the objects will remain in the
 * same order after the call. To sort the array based on the name,
 * 'generateCompareFn' can be used to generate a comparer which will look sort
 * based on the 'name' property of each item in the array. It is done by calling
 * sort like this: '.sort(generateCompareFn(["name"]))'... More deepened sort can
 * be done by passing more items in the determinant array. For example, if the
 * 'name' property of each item is an array of two names, we could sort the array
 * based on the first names in each of the array by calling sort like this:
 * '.sort(generateCompareFn(["name", 0]))'
 *
 * Visit https://www.youtube.com/watch?v=LH2iFJgabUQ for more info
 */

function generateCompareFn(determinant, order) {
  if (order !== "asc" && order !== "desc" && order !== undefined)
    throw new Error("'order' must be one of 'asc' or 'desc' if present")
  const orderCode = order === "desc" ? -1 : 1

  if (!Array.isArray(determinant)) {
    return function compareFunction(firstEntry, secondEntry) {
      if (firstEntry > secondEntry) return orderCode * 1
      if (firstEntry < secondEntry) return orderCode * -1
      return 0
    }
  }

  return function compareFunction(firstEntry, secondEntry) {
    const firstCompareValue = determinant.reduce(
      (previousValue, currentValue) => previousValue[currentValue],
      firstEntry
    )

    const secondCompareValue = determinant.reduce(
      (previousValue, currentValue) => previousValue[currentValue],
      secondEntry
    )

    if (firstCompareValue > secondCompareValue) return orderCode * 1
    if (firstCompareValue < secondCompareValue) return orderCode * -1
    return 0
  }
}

module.exports = {
  generateCompareFn,
  isExtender,
  isInheritor,
  isObject
}
