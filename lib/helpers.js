const { isSameValue } = require("./algorithms")

function containsDuplicates(array) {
  if (!Array.isArray(array)) throw new TypeError("'array' must be an array")
  const arrayLength = array.length
  if (arrayLength === 0 || arrayLength === 1) return false

  const arrayZeros = []
  const arrayWithoutZero = []

  for (const item of array) {
    if (item === 0) {
      arrayZeros.push(item)
      const arrayZerosCount = arrayZeros.length
      if (arrayZerosCount > 2) return true
      if (arrayZerosCount === 2 && isSameValue(arrayZeros[0], arrayZeros[1]))
        return true
    } else arrayWithoutZero.push(item)
  }

  if (new Set(arrayWithoutZero).size !== arrayWithoutZero.length) return true
  return false
}

function containsDuplicatesZero(array) {
  if (!Array.isArray(array)) throw new TypeError("'array' must be an array")
  const arrayLength = array.length
  if (arrayLength === 0 || arrayLength === 1) return false
  return new Set(array).size !== array.length
}

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

function generateCompareFn(determinant, order) {
  if (order !== "asc" && order !== "desc" && order !== undefined)
    throw new Error("'order' must be one of 'asc' or 'desc' if present")
  const orderCode = order === "desc" ? -1 : 1

  if (!Array.isArray(determinant)) {
    return function compareFunction(firstEntry, secondEntry) {
      if (firstEntry > secondEntry) return 1 * orderCode
      if (firstEntry < secondEntry) return -1 * orderCode
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

    if (firstCompareValue > secondCompareValue) return 1 * orderCode
    if (firstCompareValue < secondCompareValue) return -1 * orderCode
    return 0
  }
}

module.exports = {
  containsDuplicates,
  containsDuplicatesZero,
  generateCompareFn,
  isExtender,
  isInheritor,
  isObject
}
