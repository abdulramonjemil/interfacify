class BaseFieldType {
  static $EXPECTED_TYPE_OF_ATTRIBUTES = "boolean"
  static $VALUE_OF_ATTRIBUTES_AFTER_CHAINING = true

  static DEFAULT_FIELD_ATTRIBUTES = [
    { name: "isOptional", default: false },
    { name: "isReadonly", default: false }
  ]

  $DETERMINER = null
  $attributes = {} // Will be populated in constructor

  constructor(determiner, attributes) {
    if (new.target === BaseFieldType)
      throw new Error("'BaseFieldType' cannot be constructed directly")

    if (typeof attributes !== "object" && attributes !== undefined)
      throw new TypeError(
        "Attributes of a field type must be in an ordinary object"
      )

    this.$DETERMINER = determiner
    this.$setDefaultAttributes()
    if (attributes !== undefined) this.setAttributes(attributes)
  }

  static $assertAttributeValueValidity(value) {
    const expectedType = BaseFieldType.$EXPECTED_TYPE_OF_ATTRIBUTES
    if (typeof value !== expectedType)
      throw new Error(`Attributes must be of '${expectedType}' type`)
  }

  // Should be overritten in extending classes if needed
  static getSupportedAttributes() {
    return BaseFieldType.DEFAULT_FIELD_ATTRIBUTES
  }

  get isOptional() {
    return this.$effectAttributeChaining("isOptional")
  }

  get isReadonly() {
    return this.$effectAttributeChaining("isReadonly")
  }

  $assertAttributeSupport(attributeName) {
    const attributeIsSupported = Object.hasOwn(this.$attributes, attributeName)
    if (!attributeIsSupported)
      throw new Error(`The attribute '${attributeName}' is not supported`)
  }

  $assertEffectivenessOfChaining(attributeName) {
    const attributeValue = this.$attributes[attributeName]
    if (attributeValue === BaseFieldType.$VALUE_OF_ATTRIBUTES_AFTER_CHAINING)
      throw new Error(`Chaining the attribute '${attributeName}' has no effect`)
  }

  $effectAttributeChaining(attributeName) {
    this.$assertEffectivenessOfChaining(attributeName)
    this.$attributes[attributeName] =
      BaseFieldType.$VALUE_OF_ATTRIBUTES_AFTER_CHAINING
    return this
  }

  $setDefaultAttributes() {
    const determiner = this.$DETERMINER
    const defaultAttributes =
      this.constructor.getSupportedAttributes(determiner)
    defaultAttributes.forEach((attribute) => {
      this.$attributes[attribute.name] = attribute.default
    })
  }

  duplicate() {
    return new this.constructor(this.$DETERMINER, this.$attributes)
  }

  getAttribute(attributeName) {
    this.$assertAttributeSupport(attributeName)
    return this.$attributes[attributeName]
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

  /* eslint-disable-next-line class-methods-use-this */
  isTypeOf() {
    return false
  }

  resetAttributes() {
    this.$setDefaultAttributes()
  }

  setAttribute(attribute, value) {
    this.$assertAttributeSupport(attribute)
    BaseFieldType.$assertAttributeValueValidity(value)
    this.$attributes[attribute] = value
  }

  setAttributes(attributes) {
    if (typeof attributes !== "object")
      throw new TypeError(
        "Attributes of a field type must be in an ordinary object"
      )

    Object.keys(attributes).forEach((attributeName) => {
      this.$assertAttributeSupport(attributeName)
      const attributeValueToSet = attributes[attributeName]
      BaseFieldType.$assertAttributeValueValidity(attributeValueToSet)
      this.$attributes[attributeName] = attributeValueToSet
    })
  }
}

module.exports = BaseFieldType
