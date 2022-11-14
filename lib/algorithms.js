/* eslint-disable no-self-compare */
function isSameValue(a, b) {
  if (a === b) return a !== 0 || 1 / a === 1 / b
  return a !== a && b !== b
}

function isSameValueZero(a, b) {
  if (typeof a === "number" && typeof b === "number")
    return a === b || (a !== a && b !== b)
  return a === b
}
/* eslint-enable no-self-compare */

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

module.exports = {
  containsDuplicates,
  containsDuplicatesZero,
  isSameValue,
  isSameValueZero
}
