const FieldType = require("./default")
const { isObject } = require("../../lib/functions")

class CustomFieldType extends FieldType {
  static #VALIDATOR_TYPES = {
    SELF: Symbol("SELF"),
    SIGNATURE: Symbol("SIGNATURE")
  }

  static SIGNATURES = {
    IS_TYPE_OF: Symbol("IS_TYPE_OF")
  }

  #VALIDATOR_TYPE = null

  constructor(determiner, attributes) {
    if (!isObject(determiner))
      throw new TypeError("'determiner' must be an object")
    const signature = determiner[CustomFieldType.SIGNATURES.IS_TYPE_OF]

    const signatureType = typeof signature
    const determinerType = typeof determiner
    const signatureIsNotCallable = signatureType !== "function"
    const determinerIsNotCallable = determinerType !== "function"

    if (signatureIsNotCallable && determinerIsNotCallable)
      throw new TypeError(
        "One of the 'IS_TYPE_OF' signature and 'determiner' must be a function"
      )

    const signatureIsPresent = signatureType !== "undefined"
    if (signatureIsNotCallable && signatureIsPresent)
      throw new TypeError(
        `The 'IS_TYPE_OF' signature must be a function if present, got ${signatureType} type`
      )

    super(determiner, attributes)
    const validatorTypes = CustomFieldType.#VALIDATOR_TYPES
    this.#VALIDATOR_TYPE = signatureIsNotCallable
      ? validatorTypes.SELF
      : validatorTypes.SIGNATURE
  }

  isTypeOf(value) {
    const { isOptional: fieldIsOptional } = this.getAttributes()
    if (value === undefined) return fieldIsOptional

    const determiner = this.getDeterminer()
    const validatorTypes = CustomFieldType.#VALIDATOR_TYPES
    const fieldHasSignature = this.#VALIDATOR_TYPE === validatorTypes.SIGNATURE

    const isValidFieldValue = fieldHasSignature
      ? determiner[CustomFieldType.SIGNATURES.IS_TYPE_OF].bind(determiner)
      : determiner
    return Boolean(isValidFieldValue(value))
  }
}

module.exports = CustomFieldType
