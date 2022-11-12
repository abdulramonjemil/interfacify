const BaseFieldType = require("./base")
const { isSameValue, isSameValueZero } = require("../../lib/algorithms")

class ExactFieldType extends BaseFieldType {
  static #ADDITIONAL_ATTRIBUTES = ["isZeroSignIdentifier"]

  constructor(determiner, attributes) {
    if (determiner === undefined)
      throw new TypeError(
        "The 'determiner' of direct instances of 'ExactFieldType' cannot be 'undefined', " +
          "make the field optional instead"
      )
    super(determiner, attributes)
  }

  static getSupportedAttributes() {
    return [
      ...BaseFieldType.DEFAULT_FIELD_ATTRIBUTES,
      ...ExactFieldType.#ADDITIONAL_ATTRIBUTES
    ]
  }

  get isZeroSignIdentifier() {
    return this.$effectAttributeChaining("isZeroSignIdentifier")
  }

  isTypeOf(value) {
    const {
      isOptional: fieldIsOptional,
      isZeroSignIdentifier: fieldIdentifiesZeroSigns
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    return fieldIdentifiesZeroSigns
      ? isSameValue(this.$DETERMINER, value)
      : isSameValueZero(this.$DETERMINER, value)
  }
}

module.exports = ExactFieldType
