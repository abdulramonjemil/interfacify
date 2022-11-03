const FieldType = require("./default")

class PrimitiveFieldType extends FieldType {
  static #ADDITIONAL_ATTRIBUTES = [
    { name: "isNullable", default: false, isChainable: true }
  ]

  static #PRIMITIVES_NULL_VALUES = {
    any: [null, 0n, 0, ""],
    array: null,
    bigint: 0n,
    function: null,
    number: 0,
    object: null,
    string: ""
  }

  static SUPPORTED_ATTRIBUTES = [
    ...FieldType.SUPPORTED_ATTRIBUTES,
    ...PrimitiveFieldType.#ADDITIONAL_ATTRIBUTES
  ]

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
    if (!PrimitiveFieldType.SUPPORTED_PRIMITIVES.includes(determiner))
      throw new Error(`The type '${determiner}' is not supported`)
    super(determiner, attributes)
  }

  isTypeOf(value) {
    if (Number.isNaN(value)) return false
    const { isNullable: fieldIsNullable, isOptional: fieldIsOptional } =
      this.getAttributes()
    if (value === undefined) return fieldIsOptional

    const expectedType = this.getDeterminer()
    const nullValues = PrimitiveFieldType.#PRIMITIVES_NULL_VALUES
    let valueIsNull = nullValues[expectedType] === value

    if (expectedType === "any") {
      valueIsNull = nullValues.any.some((nullValue) => nullValue === value)
      if (valueIsNull && !fieldIsNullable) return false
      return true
    }

    if (expectedType === "array") {
      if (valueIsNull) return fieldIsNullable
      if (Array.isArray(value)) return true
      return false
    }

    const fieldHasNullEquiv =
      expectedType !== "boolean" && expectedType !== "symbol"
    if (fieldHasNullEquiv && valueIsNull) return fieldIsNullable
    return typeof value === expectedType
  }

  static #_ = (() => {
    super.defineChainables(
      PrimitiveFieldType,
      PrimitiveFieldType.#ADDITIONAL_ATTRIBUTES
    )
  })()
}

module.exports = PrimitiveFieldType
