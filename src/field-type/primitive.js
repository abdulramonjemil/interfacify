import FieldType from "./index"

export default class PrimitiveFieldType extends FieldType {
  static #SUPPORTED_TYPES = [
    "string",
    "number",
    "boolean",
    "symbol",
    "bigint",
    "function",
    "object"
  ]

  constructor(type, attributes) {
    if (!PrimitiveFieldType.#SUPPORTED_TYPES.includes(type)) {
      throw new Error(`The type '${type}' is not supported`)
    }
    super(type, attributes)
  }

  [FieldType.SIGNATURES.IS_VALID_FIELD_VALUE](value) {
    return typeof value === this.type
  }
}
