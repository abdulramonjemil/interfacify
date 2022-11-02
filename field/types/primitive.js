const FieldType = require("./default")
const { generateCompareFn } = require("../../lib/functions")

class PrimitiveFieldType extends FieldType {
  static #ADDITIONAL_ATTRIBUTES = [
    { name: "isNullable", default: false, isChainable: true }
  ]

  /**
   * This is meant to overwrite 'FieldType.SUPPORTED_ATTRIBUTES'. Call
   * '.sort()' with appropriate compare fn if it won't be alphabetically
   * ordered based on 'name'.
   */
  static SUPPORTED_ATTRIBUTES = [
    ...FieldType.SUPPORTED_ATTRIBUTES,
    ...PrimitiveFieldType.#ADDITIONAL_ATTRIBUTES
  ].sort(generateCompareFn(["name"]))

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
    if (!PrimitiveFieldType.SUPPORTED_PRIMITIVES.includes(determiner)) {
      throw new Error(`The type '${determiner}' is not supported`)
    }
    super(determiner, attributes)
  }

  isTypeOf(value) {
    return typeof value === this.getDeterminer()
  }

  static #_ = (() => {
    super.defineChainables(
      PrimitiveFieldType,
      PrimitiveFieldType.#ADDITIONAL_ATTRIBUTES
    )
  })()
}

module.exports = PrimitiveFieldType
