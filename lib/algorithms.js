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

module.exports = {
  isSameValue,
  isSameValueZero
}
