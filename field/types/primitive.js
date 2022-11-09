const BaseFieldType = require("./base")

class PrimitiveFieldType extends BaseFieldType {
  static #ATTRIBUTES_PER_PRIMITIVE = {
    any: [],
    array: ["isFilled"],
    bigint: ["isPositive"],
    boolean: [],
    function: [],
    number: ["isInteger", "isNonNegative", "isPositive"],
    object: ["isGeneric"],
    string: ["isFilled"],
    symbol: []
  }

  static #DEFAULT_VALUE_OF_ATTRIBUTES = false

  static SUPPORTED_PRIMITIVES = [
    "any",
    "array",
    "bigint",
    "boolean",
    "function",
    "number",
    "object",
    "string",
    "symbol"
  ]

  constructor(determiner, attributes) {
    PrimitiveFieldType.#assertPrimitiveSupport(determiner)
    super(determiner, attributes)
  }

  static #assertPrimitiveSupport(primitive) {
    if (!Object.hasOwn(PrimitiveFieldType.#ATTRIBUTES_PER_PRIMITIVE, primitive))
      throw new Error(`The type '${primitive}' is not supported`)
  }

  static getSupportedAttributes(primitiveType) {
    PrimitiveFieldType.#assertPrimitiveSupport(primitiveType)
    const attributesForType =
      PrimitiveFieldType.$ATTRIBUTES_PER_PRIMITIVE[primitiveType]
    const attributesDefault = PrimitiveFieldType.#DEFAULT_VALUE_OF_ATTRIBUTES

    const attributesDetails = attributesForType.map((attributeName) => ({
      name: attributeName,
      default: attributesDefault
    }))
    return [...BaseFieldType.DEFAULT_FIELD_ATTRIBUTES, ...attributesDetails]
  }

  get isFilled() {
    return this.#effectPrimitiveAttributeChaining("isFilled")
  }

  get isGeneric() {
    return this.#effectPrimitiveAttributeChaining("isGeneric")
  }

  get isInteger() {
    return this.#effectPrimitiveAttributeChaining("isInteger")
  }

  get isNonNegative() {
    const { isPositive: fieldIsPositive } = this.$attributes
    if (fieldIsPositive)
      throw new Error(
        "A field cannot be 'non-negative' and 'positive' at the same time"
      )
    return this.#effectPrimitiveAttributeChaining("isNonNegative")
  }

  get isPositive() {
    const { isNonNegative: fieldIsNonNegative } = this.$attributes
    if (fieldIsNonNegative && this.$DETERMINER === "number")
      throw new Error(
        "A field cannot be 'non-negative' and 'positive' at the same time"
      )
    return this.#effectPrimitiveAttributeChaining("isPositive")
  }

  #assertAttributeSupportForPrimitive(attributeName) {
    const primitiveInQuestion = this.$DETERMINER
    const supportedAttributes =
      PrimitiveFieldType.#ATTRIBUTES_PER_PRIMITIVE[primitiveInQuestion]

    if (!supportedAttributes.includes(attributeName))
      throw new Error(
        `The attribute '${attributeName}' is not supported on the ` +
          `primitive type '${primitiveInQuestion}'`
      )
  }

  #effectPrimitiveAttributeChaining(attributeName) {
    this.#assertAttributeSupportForPrimitive(attributeName)
    return this.$effectAttributeChaining(attributeName)
  }

  #valueIsValidAny(value) {
    const { isOptional: fieldIsOptional } = this.$attributes
    if (value === undefined) return fieldIsOptional
    return true
  }

  #valueIsValidArray(value) {
    const { isFilled: fieldIsFilled, isOptional: fieldIsOptional } =
      this.$attributes

    if (value === undefined) return fieldIsOptional
    if (!Array.isArray(value)) return false
    if (value.length === 0) return !fieldIsFilled
    return true
  }

  #valueIsValidBigint(value) {
    const { isOptional: fieldIsOptional, isPositive: fieldIsPositive } =
      this.$attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value !== "bigint") return false
    if (value === 0n && fieldIsPositive) return false
    return true
  }

  #valueIsValidBoolean(value) {
    const { isOptional: fieldIsOptional } = this.$attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value === "boolean") return true
    return false
  }

  #valueIsValidFunction(value) {
    const { isOptional: fieldIsOptional } = this.$attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value === "function") return true
    return false
  }

  #valueIsValidNumber(value) {
    const {
      isInteger: fieldIsInteger,
      isNonNegative: fieldIsNonNegative,
      isOptional: fieldIsOptional,
      isPositive: fieldIsPositive
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value !== "number") return false
    if (Number.isNaN(value)) return false
    if (value <= 0 && fieldIsPositive) return false
    if (value < 0 && fieldIsNonNegative) return false
    if (!Number.isInteger(value) && fieldIsInteger) return false
    return true
  }

  #valueIsValidObject(value) {
    const { isGeneric: fieldIsGeneric, isOptional: fieldIsOptional } =
      this.$attributes

    if (value === undefined) return fieldIsOptional
    if (value === null) return false
    if (typeof value === "function") return fieldIsGeneric
    if (typeof value === "object") return true
    return false
  }

  #valueIsValidString(value) {
    const { isFilled: fieldIsFilled, isOptional: fieldIsOptional } =
      this.$attributes
    if (value === undefined) return fieldIsOptional
    if (typeof value !== "string") return false
    if (value === "") return !fieldIsFilled
    return true
  }

  #valueIsValidSymbol(value) {
    const { isOptional: fieldIsOptional } = this.$attributes
    if (value === undefined) return fieldIsOptional
    if (typeof value === "symbol") return true
    return false
  }

  isTypeOf(value) {
    const expectedType = this.$DETERMINER
    if (expectedType === "any") return this.#valueIsValidAny(value)
    if (expectedType === "array") return this.#valueIsValidArray(value)
    if (expectedType === "bigint") return this.#valueIsValidBigint(value)
    if (expectedType === "boolean") return this.#valueIsValidBoolean(value)
    if (expectedType === "function") return this.#valueIsValidFunction(value)
    if (expectedType === "number") return this.#valueIsValidNumber(value)
    if (expectedType === "object") return this.#valueIsValidObject(value)
    if (expectedType === "string") return this.#valueIsValidString(value)
    if (expectedType === "symbol") return this.#valueIsValidSymbol(value)
    return false // Should never run
  }
}

module.exports = PrimitiveFieldType
