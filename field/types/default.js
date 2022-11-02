const { firstClassExtendsSecond } = require("../../lib/functions")

class FieldType {
  static #ATTRIBUTE_SETTING_METHODS = {
    ANY: Symbol("ANY"),
    CHAINING: Symbol("CHAINING"),
    METHOD_CALLS: Symbol("METHOD_CALLS")
  }

  static #CHECK_BYPASS_SIGNATURE = Symbol("BYPASS_CHECK_SIGNATURE")
  static #EXPECTED_TYPE_OF_ATTRIBUTES = "boolean"
  static #VALUE_OF_ATTRIBUTES_AFTER_CHAINING = true

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
    { name: "isOptional", default: false, isChainable: true },
    { name: "isReadonly", default: false, isChainable: true }
  ]

  #ATTRIBUTE_SETTING_METHOD = FieldType.#ATTRIBUTE_SETTING_METHODS.ANY
  #DETERMINER = null

  #attributes = {} // Will be populated in constructor

  constructor(determiner, attributes) {
    this.#DETERMINER = determiner

    if (typeof attributes !== "object" && attributes !== undefined)
      throw new TypeError("Attributes must be in an object")

    const defaultAttributes = {}
    this.constructor.SUPPORTED_ATTRIBUTES.forEach((attribute) => {
      defaultAttributes[attribute.name] = attribute.default
    })

    this.setAttributes(defaultAttributes, FieldType.#CHECK_BYPASS_SIGNATURE)
    // Attempt to overwrite defaults with supplied values
    if (attributes !== undefined) this.setAttributes(attributes)
  }

  static #assertAttributeValueValidity(attributeName, value) {
    const expectedType = FieldType.#EXPECTED_TYPE_OF_ATTRIBUTES
    if (typeof value !== expectedType)
      throw new Error(
        `The attribute '${attributeName}' must be of '${expectedType}' type`
      )
  }

  /**
   * It defines accessors for field types that cause their attributes
   * to change by chaining. For example, accessing the 'isOptional' property of a field type
   * causes its 'isOptional' attribute to be set to 'true'.
   * The method is called with 'FieldType' itself below to define default chainables.
   *
   * This method is meant to be used by classes that extend 'FieldType'. It
   * defines accessors for chainable attributes on their 'prototype' property.
   */

  static defineChainables(classObject, chainables) {
    if (!firstClassExtendsSecond(classObject, FieldType))
      throw new Error(
        "'defineChinables' can only be called on classes that extend 'FieldType'"
      )

    function validateAndEffectChaining(attributeName) {
      const chainingMethod = FieldType.#ATTRIBUTE_SETTING_METHODS.CHAINING
      this.#assertAllowanceOfAttributeSettingMethod(chainingMethod)
      this.#assertEffectivenessOfChaining(attributeName)
      this.#assertEarlyAccessOfAttribute(attributeName)
      this.#attributes[attributeName] =
        FieldType.#VALUE_OF_ATTRIBUTES_AFTER_CHAINING

      if (this.#ATTRIBUTE_SETTING_METHOD !== chainingMethod)
        this.#ATTRIBUTE_SETTING_METHOD = chainingMethod
      return this
    }

    function preventSettingOfAttribute(attributeName) {
      throw new Error(`The attribute '${attributeName}' cannot be set`)
    }

    const chainableAttributes = chainables || classObject.SUPPORTED_ATTRIBUTES
    chainableAttributes.forEach((attribute) => {
      if (!attribute.isChainable) return
      const attributeName = attribute.name

      Object.defineProperty(classObject.prototype, attributeName, {
        enumerable: true,
        configurable: true,
        get() {
          return validateAndEffectChaining.call(this, attributeName)
        },
        set() {
          preventSettingOfAttribute(attributeName)
        }
      })
    })
  }

  #assertAllowanceOfAttributeSettingMethod(method) {
    const allowedMethod = this.#ATTRIBUTE_SETTING_METHOD
    const methodIsAllowed =
      method === FieldType.#ATTRIBUTE_SETTING_METHODS.ANY ||
      method === allowedMethod
    if (!methodIsAllowed)
      throw new Error(
        `attribute cannot be set by '${method.description.toLowerCase()}'. Use other methods instead`
      )
  }

  #assertAttributeSupport(attributeName) {
    const attributeIsSupported = this.constructor.SUPPORTED_ATTRIBUTES.some(
      (entry) => entry.name === attributeName
    )
    if (!attributeIsSupported)
      throw new Error(`The attribute '${attributeName}' is not supported`)
  }

  #assertEarlyAccessOfAttribute(attributeName) {
    const definitionsOfAttributes = this.constructor.SUPPORTED_ATTRIBUTES
    let attributeIndex = 0 // just a default, will be set later

    definitionsOfAttributes.forEach((definition, index) => {
      const nameOfCurrentAttribute = definition.name
      if (nameOfCurrentAttribute === attributeName) attributeIndex = index

      const currentAttributeIsAccessed =
        this.#attributes[nameOfCurrentAttribute] !== definition.default
      const currentAttrOccursAfterAssertedAttr = index > attributeIndex

      if (currentAttributeIsAccessed && currentAttrOccursAfterAssertedAttr) {
        // The asserted attribute is accessed late
        throw new Error(
          `The attribute '${attributeName}' should be accessed before '${nameOfCurrentAttribute}'`
        )
      }
    })
  }

  #assertEffectivenessOfChaining(attributeName) {
    const attributeValue = this.#attributes[attributeName]
    if (attributeValue === FieldType.#VALUE_OF_ATTRIBUTES_AFTER_CHAINING)
      throw new Error(`Chaining the attribute '${attributeName}' has no effect`)
  }

  #assertValidityOfAttributeValues(attributes) {
    this.constructor.SUPPORTED_ATTRIBUTES.forEach((entry) => {
      const { name: attributeName } = entry
      const expectedType = FieldType.#EXPECTED_TYPE_OF_ATTRIBUTES
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

  duplicate() {
    const duplicate = new this.constructor(this.#DETERMINER, this.#attributes)
    duplicate.#ATTRIBUTE_SETTING_METHOD = this.#ATTRIBUTE_SETTING_METHOD
    return duplicate
  }

  getAttribute(attributeName) {
    this.#assertAttributeSupport(attributeName)
    return this.#attributes[attributeName]
  }

  getAttributeSettingMethod() {
    return this.#ATTRIBUTE_SETTING_METHOD.description.toLowerCase()
  }

  getAttributes() {
    const attributeObjectWithDifferentRef = JSON.parse(
      JSON.stringify(this.#attributes)
    )
    return attributeObjectWithDifferentRef
  }

  getDeterminer() {
    return this.#DETERMINER
  }

  isTypeOf(value) {
    return value === this.#DETERMINER
  }

  setAttribute(attribute, value) {
    const methodCalling = FieldType.#ATTRIBUTE_SETTING_METHODS.METHOD_CALLS
    this.#assertAllowanceOfAttributeSettingMethod(methodCalling)

    this.#assertAttributeSupport(attribute)
    FieldType.#assertAttributeValueValidity(attribute, value)
    this.#attributes[attribute] = value

    if (this.#ATTRIBUTE_SETTING_METHOD !== methodCalling)
      this.#ATTRIBUTE_SETTING_METHOD = methodCalling
  }

  setAttributes(attributes, checkBypassSignature) {
    const methodCalling = FieldType.#ATTRIBUTE_SETTING_METHODS.METHOD_CALLS
    this.#assertAllowanceOfAttributeSettingMethod(methodCalling)

    if (checkBypassSignature !== FieldType.#CHECK_BYPASS_SIGNATURE)
      this.#assertValidityOfAttributeValues(attributes)
    const supportedAttributes = this.constructor.SUPPORTED_ATTRIBUTES

    supportedAttributes.forEach((attribute) => {
      const attributeName = attribute.name
      const attributeValueToSet = attributes[attributeName]

      // Skip setting if value is not defined (making attribute unmodified)
      if (attributeValueToSet !== undefined)
        this.#attributes[attributeName] = attributeValueToSet
    })

    if (this.#ATTRIBUTE_SETTING_METHOD !== methodCalling)
      this.#ATTRIBUTE_SETTING_METHOD = methodCalling
  }

  /**
   * This method is not meant to be called anywhere. It's used as a way to
   * execute code normally in a procedural manner in a class declaration.
   * This is done so that private properties are accessible. The method is
   * also made static so it runs only once.
   */
  static #_ = (() => {
    FieldType.defineChainables(FieldType)
  })()
}

module.exports = FieldType
