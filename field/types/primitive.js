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

  static #VALIDATOR_PER_PRIMITIVE = {
    any: PrimitiveFieldType.#isValidAnyValue,
    array: PrimitiveFieldType.#isValidArrayValue,
    bigint: PrimitiveFieldType.#isValidBigintValue,
    boolean: PrimitiveFieldType.#isValidBooleanValue,
    function: PrimitiveFieldType.#isValidFunctionValue,
    number: PrimitiveFieldType.#isValidNumberValue,
    object: PrimitiveFieldType.#isValidObjectValue,
    string: PrimitiveFieldType.#isValidStringValue,
    symbol: PrimitiveFieldType.#isValidSymbolValue
  }

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
    if (!Object.hasOwn(PrimitiveFieldType.#VALIDATOR_PER_PRIMITIVE, primitive))
      throw new Error(`The type '${primitive}' is not supported`)
  }

  static #isValidAnyValue(value, attributes) {
    const { isOptional: fieldIsOptional } = attributes
    if (value === undefined) return fieldIsOptional
    return true
  }

  static #isValidArrayValue(value, attributes) {
    const { isFilled: fieldIsFilled, isOptional: fieldIsOptional } = attributes

    if (value === undefined) return fieldIsOptional
    if (!Array.isArray(value)) return false
    if (value.length === 0) return !fieldIsFilled
    return true
  }

  static #isValidBigintValue(value, attributes) {
    const { isOptional: fieldIsOptional, isPositive: fieldIsPositive } =
      attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value !== "bigint") return false
    if (value === 0n && fieldIsPositive) return false
    return true
  }

  static #isValidBooleanValue(value, attributes) {
    const { isOptional: fieldIsOptional } = attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value === "boolean") return true
    return false
  }

  static #isValidFunctionValue(value, attributes) {
    const { isOptional: fieldIsOptional } = attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value === "function") return true
    return false
  }

  static #isValidNumberValue(value, attributes) {
    const {
      isInteger: fieldIsInteger,
      isNonNegative: fieldIsNonNegative,
      isOptional: fieldIsOptional,
      isPositive: fieldIsPositive
    } = attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value !== "number") return false
    if (Number.isNaN(value)) return false
    if (value <= 0 && fieldIsPositive) return false
    if (value < 0 && fieldIsNonNegative) return false
    if (!Number.isInteger(value) && fieldIsInteger) return false
    return true
  }

  static #isValidObjectValue(value, attributes) {
    const { isGeneric: fieldIsGeneric, isOptional: fieldIsOptional } =
      attributes

    if (value === undefined) return fieldIsOptional
    if (value === null) return false
    if (typeof value === "function") return fieldIsGeneric
    if (typeof value === "object") return true
    return false
  }

  static #isValidStringValue(value, attributes) {
    const { isFilled: fieldIsFilled, isOptional: fieldIsOptional } = attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value !== "string") return false
    if (value === "") return !fieldIsFilled
    return true
  }

  static #isValidSymbolValue(value, attributes) {
    const { isOptional: fieldIsOptional } = attributes
    if (value === undefined) return fieldIsOptional
    if (typeof value === "symbol") return true
    return false
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
    if (fieldIsNonNegative)
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

  isTypeOf(value) {
    const validators = PrimitiveFieldType.#VALIDATOR_PER_PRIMITIVE
    const validatorForExpectedType = validators[this.$DETERMINER]
    return validatorForExpectedType(value, this.$attributes)
  }
}

module.exports = PrimitiveFieldType
