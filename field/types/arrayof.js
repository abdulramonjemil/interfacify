const { isSameValue, isSameValueZero } = require("../../lib/algorithms")
const BaseFieldType = require("./base")

class ArrayOfFieldType extends BaseFieldType {
  static #ADDITIONAL_ATTRIBUTES = [
    { name: "isTemplate", default: false },
    { name: "isZeroSignIdentifier", default: false }
  ]

  static getSupportedAttributes() {
    return [
      ...BaseFieldType.DEFAULT_FIELD_ATTRIBUTES,
      ...ArrayOfFieldType.#ADDITIONAL_ATTRIBUTES
    ]
  }

  get isTemplate() {
    return this.$effectAttributeChaining("isTemplate")
  }

  get isZeroSignIdentifier() {
    return this.$effectAttributeChaining("isZeroSignIdentifier")
  }

  isTypeOf(value) {
    const {
      isTemplate: fieldIsTemplate,
      isOptional: fieldIsOptional,
      isZeroSignIdentifier: fieldIdentifiesZeroSigns
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    if (!Array.isArray(value)) return false
    if (value.length === 0) return fieldIsTemplate

    const determiner = this.$DETERMINER
    if (determiner instanceof BaseFieldType)
      return value.every(determiner.isTypeOf.bind(determiner))

    return fieldIdentifiesZeroSigns
      ? value.every(isSameValue.bind(null, determiner))
      : value.every(isSameValueZero.bind(null, determiner))
  }
}

module.exports = ArrayOfFieldType
