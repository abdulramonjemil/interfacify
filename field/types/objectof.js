const { isObject } = require("../../lib/helpers")
const BaseFieldType = require("./base")

class ObjectOfFieldType extends BaseFieldType {
  static #ADDITIONAL_ATTRIBUTES = [
    { name: "hasGenericKeys", default: false },
    { name: "isGeneric", default: false }
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

  isTypeOf(value) {
    const {
      hasGenericKeys: fieldHasGenericKeys,
      isGeneric: fieldIsGeneric,
      isOptional: fieldIsOptional
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    if (!isObject(value)) return false
    if (typeof value === "function" && !fieldIsGeneric) return false

    const determiner = this.$DETERMINER
    const isOfExpectedType = determiner.isTypeOf.bind(determiner)
    const enumerableStringProps = Object.values(value)

    if (!fieldHasGenericKeys)
      return enumerableStringProps.every(isOfExpectedType)

    const enumerableSymbolProps = Object.getOwnPropertySymbols(value).filter(
      (key) => Object.prototype.propertyIsEnumerable.call(value, key)
    )
    const allEnumerableProps = [
      ...enumerableStringProps,
      ...enumerableSymbolProps
    ]
    return allEnumerableProps.every(isOfExpectedType)
  }
}

module.exports = ObjectOfFieldType
