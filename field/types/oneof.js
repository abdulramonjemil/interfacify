const BaseFieldType = require("./base")
const { isSameValue, isSameValueZero } = require("../../lib/algorithms")
const { containsDuplicates } = require("../../lib/helpers")

class OneOfFieldType extends BaseFieldType {
  static #ADDITIONAL_ATTRIBUTES = [
    { name: "isZeroSignIdentifier", default: false }
  ]

  static getSupportedAttributes() {
    return [
      ...BaseFieldType.DEFAULT_FIELD_ATTRIBUTES,
      ...OneOfFieldType.#ADDITIONAL_ATTRIBUTES
    ]
  }

  constructor(determiner, attributes) {
    if (!Array.isArray(determiner))
      throw new TypeError("'determiner' must be an array")

    if (determiner.length < 2)
      throw new Error(
        "The 'determiner' array must contain two or more elements"
      )

    if (containsDuplicates(determiner))
      throw new Error("The 'determiner' array cannot contain duplicate types")

    super(determiner, attributes)
  }

  isTypeOf(value) {
    const {
      isOptional: fieldIsOptional,
      isZeroSignIdentifier: fieldIdentifiesZeroSigns
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    const variants = this.$DETERMINER

    const valueMatchesADefinedType = variants.some((member) => {
      if (member instanceof BaseFieldType) return member.isTypeOf(value)
      return fieldIdentifiesZeroSigns
        ? isSameValue(member, value)
        : isSameValueZero(member, value)
    })
    return valueMatchesADefinedType
  }
}

module.exports = OneOfFieldType
