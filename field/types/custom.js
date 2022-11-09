const BaseFieldType = require("./base")
const { isObject } = require("../../lib/helpers")

class CustomFieldType extends BaseFieldType {
  static #VALIDATOR_TYPES = {
    SELF: Symbol("SELF"),
    SIGNATURE: Symbol("SIGNATURE")
  }

  static SIGNATURES = {
    IS_TYPE_OF: Symbol("IS_TYPE_OF")
  }

  constructor(determiner, attributes) {
    if (!isObject(determiner))
      throw new TypeError("'determiner' must be an object")

    const signature = determiner[CustomFieldType.SIGNATURES.IS_TYPE_OF]
    if (typeof signature !== "function")
      throw new TypeError("The 'IS_TYPE_OF' signature must be a function")
    super(determiner, attributes)
  }

  isTypeOf(value) {
    const { isOptional: fieldIsOptional } = this.getAttributes()
    if (value === undefined) return fieldIsOptional

    const determiner = this.$DETERMINER
    const customValidator = determiner[CustomFieldType.SIGNATURES.IS_TYPE_OF]
    return Boolean(customValidator.call(determiner, value))
  }
}

module.exports = CustomFieldType
