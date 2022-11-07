const BaseFieldType = require("./base")

class PrimitiveFieldType extends BaseFieldType {
  static #ATTRIBUTES_PER_PRIMITIVE = {
    any: [],
    array: ["canBeEmpty", "isNullable"],
    bigint: ["isPositive"],
    boolean: [],
    function: ["isNullable"],
    number: ["canBeNaN", "isInteger", "isNonNegative", "isPositive"],
    object: ["canBeAFunction", "isNullable"],
    string: ["canBeEmpty"],
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

  static SUPPORTED_PRIMITIVES = Object.keys(
    PrimitiveFieldType.#ATTRIBUTES_PER_PRIMITIVE
  )

  constructor(determiner, attributes) {
    if (!PrimitiveFieldType.SUPPORTED_PRIMITIVES.includes(determiner))
      throw new Error(`The type '${determiner}' is not supported`)
    super(determiner, attributes)
  }

  static #isValidAnyValue(value, attributes) {
    const { isOptional: fieldIsOptional } = attributes
    if (value === undefined) return fieldIsOptional
    return true
  }

  static #isValidArrayValue(value, attributes) {
    const {
      canBeEmpty: fieldCanBeEmpty,
      isNullable: fieldIsNullable,
      isOptional: fieldIsOptional
    } = attributes

    if (value === undefined) return fieldIsOptional
    if (value === null) return fieldIsNullable

    if (!Array.isArray(value)) return false
    if (value.length === 0) return fieldCanBeEmpty
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
    const { isNullable: fieldIsNullable, isOptional: fieldIsOptional } =
      attributes

    if (value === undefined) return fieldIsOptional
    if (value === null) return fieldIsNullable
    if (typeof value === "function") return true
    return false
  }

  static #isValidNumberValue(value, attributes) {
    const {
      canBeNaN: fieldCanBeNaN,
      isInteger: fieldIsInteger,
      isNonNegative: fieldIsNonNegative,
      isOptional: fieldIsOptional,
      isPositive: fieldIsPositive
    } = attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value !== "number") return false
    if (Number.isNaN(value)) return fieldCanBeNaN
    if (value <= 0 && fieldIsPositive) return false
    if (value < 0 && fieldIsNonNegative) return false
    if (!Number.isInteger(value) && fieldIsInteger) return false
    return true
  }

  static #isValidObjectValue(value, attributes) {
    const {
      canBeAFunction: fieldCanBeAFunction,
      isOptional: fieldIsOptional,
      isNullable: fieldIsNullable
    } = attributes

    if (value === undefined) return fieldIsOptional
    if (value === null) return fieldIsNullable
    if (typeof value === "function") return fieldCanBeAFunction
    if (typeof value === "object") return true
    return false
  }

  static #isValidStringValue(value, attributes) {
    const { canBeEmpty: fieldCanBeEmpty, isOptional: fieldIsOptional } =
      attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value !== "string") return false
    if (value === "") return fieldCanBeEmpty
    return true
  }

  static #isValidSymbolValue(value, attributes) {
    const { isOptional: fieldIsOptional } = attributes

    if (value === undefined) return fieldIsOptional
    if (typeof value === "symbol") return true
    return false
  }

  get canBeEmpty() {
    return this.#effectPrimitiveAttributeChaining("canBeEmpty")
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

  get isNullable() {
    return this.#effectPrimitiveAttributeChaining("isNullable")
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

  getSupportedAttributes() {
    const primitiveInQuestion = this.$DETERMINER
    const supportedAttributes =
      PrimitiveFieldType.$ATTRIBUTES_PER_PRIMITIVE[primitiveInQuestion]
    const attributesDefault = PrimitiveFieldType.#DEFAULT_VALUE_OF_ATTRIBUTES

    const attributesDetails = supportedAttributes.map((attributeName) => ({
      name: attributeName,
      default: attributesDefault
    }))
    return [...BaseFieldType.DEFAULT_FIELD_ATTRIBUTES, ...attributesDetails]
  }

  isTypeOf(value) {
    const validators = PrimitiveFieldType.#VALIDATOR_PER_PRIMITIVE
    const validatorForExpectedType = validators[this.$DETERMINER]
    return validatorForExpectedType(value, this.$attributes)
  }
}

module.exports = PrimitiveFieldType
