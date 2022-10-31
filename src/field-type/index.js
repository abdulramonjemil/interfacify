const FIELD_TYPE_SIGNATURES = {
  IS_VALID_FIELD_VALUE: Symbol("IS_VALID_FIELD_VALUE")
}

export default class FieldType {
  static SIGNATURES = FIELD_TYPE_SIGNATURES
  static ATTRIBUTE_ENTRIES = [
    { name: "isOptional", type: "boolean", default: false },
    { name: "isReadonly", type: "boolean", default: false }
  ]

  _attributes = {
    isOptional: FieldType[0].default,
    isReadonly: FieldType[1].default
  }

  constructor(type, attributes) {
    const attributesType = typeof attributes
    if (attributesType !== "object" && attributes !== undefined)
      throw new TypeError("Attributes must be in an object")

    if (attributesType === "object") {
      const { isOptional, isReadonly } = attributes
      if (typeof isOptional !== "boolean" && isOptional !== undefined)
        throw new TypeError("The 'isOptional' attribute must be a boolean")
      if (typeof isReadonly !== "boolean" && isReadonly !== undefined)
        throw new TypeError("The 'isReadonly' attribute must be a boolean")

      this._attributes.isOptional = isOptional
      this._attributes.isReadonly = isReadonly
    }

    this.type = type
  }

  static _assertAttributeSupport(attribute) {
    const attributeIsSupported = FieldType.ATTRIBUTE_ENTRIES.some(
      (entry) => entry.name === attribute
    )

    if (!attributeIsSupported)
      throw new Error(`The attribute '${attribute}' is not supported`)
  }

  static _assertAttributeValueValidity(attribute, value) {
    const attributeEntry = FieldType.ATTRIBUTE_ENTRIES.find(
      (entry) => entry.name === attribute
    )

    const expectedAttributeType = attributeEntry.type
    if (typeof value !== expectedAttributeType)
      throw new Error(
        `The attribute '${attribute}' must be of ${expectedAttributeType} type`
      )
  }

  static _assertEarlyAccessOfAttribute(attribute) {
    const orderedAttributes = FieldType.ATTRIBUTE_ENTRIES.map(
      (entry) => entry.name
    )
    const attributeIndex = orderedAttributes.findIndex(
      (value) => value === attribute
    )

    let attributeIsAccessedLate = false
    let attributeThatShouldBeAccessedLate = null
    for (let i = attributeIndex + 1; i < orderedAttributes.length; i += 1) {
      const currentAttribute = this.attributes[orderedAttributes[i]]
      const currentAttributeIsAccessed = currentAttribute === true
      if (currentAttributeIsAccessed) {
        attributeIsAccessedLate = true
        attributeThatShouldBeAccessedLate = currentAttribute
        break
      }
    }

    if (attributeIsAccessedLate)
      throw new Error(
        `The '${attribute}' attribute should be accessed before '${attributeThatShouldBeAccessedLate}'`
      )
  }

  static _assertOneTimeAccessOfAttribute(attribute) {
    if (this._attributes[attribute] === true)
      throw new Error("The 'isOptional' attribute can only be accessed once")
  }

  static _assertValidityOfAttributeValues(attributes) {
    FieldType.ATTRIBUTE_ENTRIES.forEach((entry) => {
      const attribute = entry.name
      const attributeValue = attributes[attribute]
      if (typeof attributeValue !== "boolean" && attributeValue !== undefined)
        throw new TypeError(
          `The '${attribute}' attribute must be a ${entry.type}`
        )
    })
  }

  [FIELD_TYPE_SIGNATURES.IS_VALID_FIELD_VALUE](value) {
    return value === this.type
  }

  getAttribute(attribute) {
    FieldType._assertAttributeSupport(attribute)
    return this._attributes[attribute]
  }

  getAttributes() {
    return this._attributes
  }

  setAttribute(attribute, value) {
    FieldType._assertAttributeSupport(attribute)
    FieldType._assertAttributeValueValidity(attribute, value)
    this._attributes[attribute] = value
  }

  // get isOptional() {
  //   FieldType._assertOneTimeAccessOfAttribute("isOptional")
  //   FieldType._assertEarlyAccessOfAttribute("isOptional")

  //   this._attributes.isOptional = true
  //   return this
  // }

  // /* eslint-disable-next-line class-methods-use-this */
  // set isOptional(value) {
  //   throw new Error("The 'isOptional' attribute cannot be set")
  // }

  // get isReadonly() {
  //   FieldType._assertOneTimeAccessOfAttribute("isReadonly")
  //   FieldType._assertEarlyAccessOfAttribute("isReadonly")

  //   this._attributes.isReadonly = true
  //   return this
  // }

  // /* eslint-disable-next-line class-methods-use-this */
  // set isReadonly(value) {
  //   throw new Error("The 'isReadonly' attribute cannot be set")
  // }
}
