const { isSameValue, isSameValueZero } = require("../../lib/algorithms")

class FieldType {
  static $ATTRIBUTE_SETTING_METHODS = {
    ANY: Symbol("ANY"),
    CHAINING: Symbol("CHAINING"),
    METHOD_CALLS: Symbol("METHOD_CALLS")
  }

  static $CHECK_BYPASS_SIGNATURE = Symbol("BYPASS_CHECK_SIGNATURE")
  static $EXPECTED_TYPE_OF_ATTRIBUTES = "boolean"
  static $VALUE_OF_ATTRIBUTES_AFTER_CHAINING = true

  /**
   * This array defines the order in which attributes should be chained,
   * their default value, and whether they are chainable i.e they can be
   * accessed on an instance to set their value to true
   * (e.g 'instance.isOptional'). An attribute will be set to true when
   * it is chained.
   *
   * This array may also be overwritten by subclasses, which is why
   * 'this.constructor' is used throughout different methods of this class
   * instead of directly using 'FieldType'.
   *
   * The attribute entries should be ordered alphabetically based on their
   * name so that users can easily know which comes first when chaining.
   */
  static SUPPORTED_ATTRIBUTES = [
    { name: "isOptional", default: false },
    { name: "isReadonly", default: false },
    { name: "isZeroSignIdentifier", default: false }
  ]

  $ATTRIBUTE_SETTING_METHOD = null
  $DETERMINER = null

  $attributes = {} // Will be populated in constructor

  constructor(determiner, attributes) {
    if (determiner === undefined && this.constructor === FieldType)
      throw new TypeError(
        "The 'determiner' of direct instances of 'FieldType' cannot be 'undefined', " +
          "make the field optional instead"
      )

    if (typeof attributes !== "object" && attributes !== undefined)
      throw new TypeError("Attributes of a field type must be in an object")

    this.$DETERMINER = determiner

    const defaultAttributes = {}
    this.constructor.SUPPORTED_ATTRIBUTES.forEach((attribute) => {
      defaultAttributes[attribute.name] = attribute.default
    })

    this.setAttributes(defaultAttributes, FieldType.$CHECK_BYPASS_SIGNATURE)
    if (attributes !== undefined) this.setAttributes(attributes)
    this.$ATTRIBUTE_SETTING_METHOD = FieldType.$ATTRIBUTE_SETTING_METHODS.ANY
  }

  static $assertAttributeValueValidity(value) {
    const expectedType = FieldType.$EXPECTED_TYPE_OF_ATTRIBUTES
    if (typeof value !== expectedType)
      throw new Error(`Attributes must be of '${expectedType}' type`)
  }

  get isOptional() {
    return this.$effectAttributeChaining("isOptional")
  }

  get isReadonly() {
    return this.$effectAttributeChaining("isReadonly")
  }

  /**
   * Not available for use on all instances of classes that extend 'FieldType'
   * Classes that intend to support the attribute should impelement their own
   * instead of inheriting.
   */
  get isZeroSignIdentifier() {
    if (this.constructor !== FieldType)
      throw new Error(
        "The attribute 'isZeroSignIdentifier' is not supported by instances of " +
          `'${this.constructor.name}`
      )
    return this.$effectAttributeChaining("isZeroSignIdentifier")
  }

  $assertAllowanceOfAttributeSettingMethod(method) {
    const allowedMethod = this.$ATTRIBUTE_SETTING_METHOD
    const methodIsAllowed =
      method === FieldType.$ATTRIBUTE_SETTING_METHODS.ANY ||
      method === allowedMethod
    if (!methodIsAllowed)
      throw new Error(
        `attribute cannot be set by '${method.description.toLowerCase()}'. Use other methods instead`
      )
  }

  $assertAttributeSupport(attributeName) {
    const attributeIsSupported = this.constructor.SUPPORTED_ATTRIBUTES.some(
      (entry) => entry.name === attributeName
    )
    if (!attributeIsSupported)
      throw new Error(`The attribute '${attributeName}' is not supported`)
  }

  $assertEffectivenessOfChaining(attributeName) {
    const attributeValue = this.$attributes[attributeName]
    if (attributeValue === FieldType.$VALUE_OF_ATTRIBUTES_AFTER_CHAINING)
      throw new Error(`Chaining the attribute '${attributeName}' has no effect`)
  }

  $assertValidityOfAttributeValues(attributes) {
    this.constructor.SUPPORTED_ATTRIBUTES.forEach((entry) => {
      const { name: attributeName } = entry
      const expectedType = FieldType.$EXPECTED_TYPE_OF_ATTRIBUTES
      const attributeValue = attributes[attributeName]

      if (
        typeof attributeValue !== expectedType &&
        attributeValue !== undefined
      )
        throw new TypeError(
          `The attribute '${attributeName}' must be of '${expectedType}' type`
        )
    })
  }

  $effectAttributeChaining(attributeName) {
    const chainingMethod = FieldType.$ATTRIBUTE_SETTING_METHODS.CHAINING
    this.$assertAllowanceOfAttributeSettingMethod(chainingMethod)
    this.$assertEffectivenessOfChaining(attributeName)

    this.$attributes[attributeName] =
      FieldType.$VALUE_OF_ATTRIBUTES_AFTER_CHAINING

    if (this.$ATTRIBUTE_SETTING_METHOD !== chainingMethod)
      this.$ATTRIBUTE_SETTING_METHOD = chainingMethod
    return this
  }

  duplicate() {
    const duplicate = new this.constructor(this.$DETERMINER, this.$attributes)
    duplicate.$ATTRIBUTE_SETTING_METHOD = this.$ATTRIBUTE_SETTING_METHOD
    return duplicate
  }

  getAttribute(attributeName) {
    this.$assertAttributeSupport(attributeName)
    return this.$attributes[attributeName]
  }

  getAttributeSettingMethod() {
    return this.$ATTRIBUTE_SETTING_METHOD.description.toLowerCase()
  }

  getAttributes() {
    const attributeObjectWithDifferentRef = JSON.parse(
      JSON.stringify(this.$attributes)
    )
    return attributeObjectWithDifferentRef
  }

  getDeterminer() {
    return this.$DETERMINER
  }

  isTypeOf(value) {
    const {
      isOptional: fieldIsOptional,
      isZeroSignIdentifier: fieldIdentifiesZeroSigns
    } = this.$attributes

    if (value === undefined) return fieldIsOptional
    return fieldIdentifiesZeroSigns
      ? isSameValue(this.$DETERMINER, value)
      : isSameValueZero(this.$DETERMINER, value)
  }

  setAttribute(attribute, value) {
    const methodCalling = FieldType.$ATTRIBUTE_SETTING_METHODS.METHOD_CALLS
    this.$assertAllowanceOfAttributeSettingMethod(methodCalling)
    this.$assertAttributeSupport(attribute)

    FieldType.$assertAttributeValueValidity(value)
    this.$attributes[attribute] = value
    if (this.$ATTRIBUTE_SETTING_METHOD !== methodCalling)
      this.$ATTRIBUTE_SETTING_METHOD = methodCalling
  }

  setAttributes(attributes, checkBypassSignature) {
    const methodCalling = FieldType.$ATTRIBUTE_SETTING_METHODS.METHOD_CALLS
    this.$assertAllowanceOfAttributeSettingMethod(methodCalling)

    if (checkBypassSignature !== FieldType.$CHECK_BYPASS_SIGNATURE)
      this.$assertValidityOfAttributeValues(attributes)
    const supportedAttributes = this.constructor.SUPPORTED_ATTRIBUTES

    supportedAttributes.forEach((attribute) => {
      const attributeName = attribute.name
      const attributeValueToSet = attributes[attributeName]

      // Skip setting of value is not defined (making attribute unmodified)
      if (attributeValueToSet !== undefined)
        this.$attributes[attributeName] = attributeValueToSet
    })

    if (this.$ATTRIBUTE_SETTING_METHOD !== methodCalling)
      this.$ATTRIBUTE_SETTING_METHOD = methodCalling
  }
}

module.exports = FieldType
