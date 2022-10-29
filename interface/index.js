class Interface {
  constructor(fields, attributes) {
    const fieldsTypeErrorMessage =
      "The definitions of fields of an interface (second argument passed to the `Interface` constructor) must be an ordinary object"
    if (typeof fields !== "object") throw new TypeError(fieldsTypeErrorMessage)

    const fieldsPrototype = Object.getPrototypeOf(fields)
    if (fieldsPrototype !== Object.prototype && fieldsPrototype !== null)
      throw new TypeError(fieldsTypeErrorMessage)

    const attributesTypeErrorMessage =
      "The definitions of attributes of an interface (second argument passed to the `Interface` constructor) must be an ordinary object"
    if (typeof attributes !== "object")
      throw new TypeError(attributesTypeErrorMessage)

    const attributesPrototype = Object.getPrototypeOf(attributes)
    if (
      attributesPrototype !== Object.prototype &&
      attributesPrototype !== null
    )
      throw new TypeError(attributesTypeErrorMessage)
  }
}

export default Interface
