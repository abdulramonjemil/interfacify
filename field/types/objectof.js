const BaseFieldType = require("./base")
const { isObject } = require("../../lib/helpers")

class ObjectOfFieldType extends BaseFieldType {
  static #ADDITIONAL_ATTRIBUTES = [
    "hasGenericKeys",
    "ignoresEnumerability",
    "isGeneric"
  ]

  constructor(determiner, attributes) {
    if (!(determiner instanceof BaseFieldType))
      throw new TypeError("'determiner' must be an instance of 'BaseFieldType'")

    super(determiner, attributes)
  }

  static getSupportedAttributes() {
    return [
      ...BaseFieldType.DEFAULT_FIELD_ATTRIBUTES,
      ...ObjectOfFieldType.#ADDITIONAL_ATTRIBUTES
    ]
  }

  get hasGenericKeys() {
    return this.$effectAttributeChaining("hasGenericKeys")
  }

  get isGeneric() {
    return this.$effectAttributeChaining("isGeneric")
  }

  isTypeOf(value) {
    const {
      hasGenericKeys: fieldHasGenericKeys,
      ignoresEnumerability: fieldIgnoresEnumerability,
      isGeneric: fieldIsGeneric,
      isOptional: fieldIsOptional
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    if (!isObject(value)) return false
    if (typeof value === "function" && !fieldIsGeneric) return false

    const determiner = this.$DETERMINER
    const isOfExpectedType = determiner.isTypeOf.bind(determiner)

    const stringPropValuesToUse = fieldIgnoresEnumerability
      ? Object.getOwnPropertyNames(value).map((key) => value[key])
      : Object.values(value) // Only enumerables

    if (!fieldHasGenericKeys)
      return stringPropValuesToUse.every(isOfExpectedType)

    const symbolPropValues = Object.getOwnPropertySymbols(value).map(
      (key) => value[key]
    )

    const symbolPropValuesToUse = fieldIgnoresEnumerability
      ? symbolPropValues
      : symbolPropValues.filter((key) =>
          Object.prototype.propertyIsEnumerable.call(value, key)
        )

    const allEnumerableProps = [
      ...stringPropValuesToUse,
      ...symbolPropValuesToUse
    ]
    return allEnumerableProps.every(isOfExpectedType)
  }
}

module.exports = ObjectOfFieldType
