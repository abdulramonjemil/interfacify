const BaseFieldType = require("./base")
const {
  containsDuplicates,
  containsDuplicatesZero
} = require("../../lib/algorithms")

class ArrayOfFieldType extends BaseFieldType {
  static #ADDITIONAL_ATTRIBUTES = [
    "hasUniqueItems",
    "isEmptiable",
    "isZeroSignIdentifier"
  ]

  constructor(determiner, attributes) {
    if (!(determiner instanceof BaseFieldType))
      throw new TypeError("'determiner' must be an instance of 'BaseFieldType'")

    super(determiner, attributes)
  }

  static getSupportedAttributes() {
    return [
      ...BaseFieldType.DEFAULT_FIELD_ATTRIBUTES,
      ...ArrayOfFieldType.#ADDITIONAL_ATTRIBUTES
    ]
  }

  get hasUniqueItems() {
    return this.$effectAttributeChaining("hasUniqueItems")
  }

  get isEmptiable() {
    return this.$effectAttributeChaining("isEmptiable")
  }

  get isZeroSignIdentifier() {
    return this.$effectAttributeChaining("isZeroSignIdentifier")
  }

  isTypeOf(value) {
    const {
      hasUniqueItems: fieldHasUniqueItems,
      isEmptiable: fieldIsEmptiable,
      isOptional: fieldIsOptional,
      isZeroSignIdentifier: fieldIdentifiesZeroSigns
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    if (!Array.isArray(value)) return false
    if (value.length === 0) return fieldIsEmptiable

    if (fieldHasUniqueItems) {
      const fieldContainsDuplicates = fieldIdentifiesZeroSigns
        ? containsDuplicates(value)
        : containsDuplicatesZero(value)
      if (fieldContainsDuplicates) return false
    }

    const determiner = this.$DETERMINER
    return value.every(determiner.isTypeOf.bind(determiner))
  }
}

module.exports = ArrayOfFieldType
