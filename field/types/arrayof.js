const BaseFieldType = require("./base")
const { isSameValue, isSameValueZero } = require("../../lib/algorithms")

class ArrayOfFieldType extends BaseFieldType {
  static #ADDITIONAL_ATTRIBUTES = [
    { name: "isEmptiable", default: false },
    { name: "isZeroSignIdentifier", default: false }
  ]

  static getSupportedAttributes() {
    return [
      ...BaseFieldType.DEFAULT_FIELD_ATTRIBUTES,
      ...ArrayOfFieldType.#ADDITIONAL_ATTRIBUTES
    ]
  }

  get isEmptiable() {
    return this.$effectAttributeChaining("isEmptiable")
  }

  get isZeroSignIdentifier() {
    return this.$effectAttributeChaining("isZeroSignIdentifier")
  }

  isTypeOf(value) {
    const {
      isEmptiable: fieldIsEmptiable,
      isOptional: fieldIsOptional,
      isZeroSignIdentifier: fieldIdentifiesZeroSigns
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    if (!Array.isArray(value)) return false
    if (value.length === 0) return fieldIsEmptiable

    const determiner = this.$DETERMINER
    if (determiner instanceof BaseFieldType)
      return value.every(determiner.isTypeOf.bind(determiner))

    return fieldIdentifiesZeroSigns
      ? value.every(isSameValue.bind(null, determiner))
      : value.every(isSameValueZero.bind(null, determiner))
  }
}

module.exports = ArrayOfFieldType
