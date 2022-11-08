const BaseFieldType = require("./base")
const { isObject } = require("../../lib/helpers")

class InstanceOfFieldType extends BaseFieldType {
  constructor(determiner, attributes) {
    if (!isObject(determiner))
      throw new TypeError("'determiner' must be an object")

    const determinerCanHaveInstance =
      determiner[Symbol.hasInstance] !== undefined ||
      typeof determiner === "function"

    if (!determinerCanHaveInstance)
      throw new TypeError(
        `'${determiner}' is not usable as right-hand side of 'instanceof'`
      )

    super(determiner, attributes)
  }

  isTypeOf(value) {
    const { isOptional: fieldIsOptional } = this.$attributes
    if (value === undefined) return fieldIsOptional
    const determiner = this.$DETERMINER
    return value instanceof determiner
  }
}

module.exports = InstanceOfFieldType
