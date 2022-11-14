const BaseFieldType = require("./types/base")
const ProxyNormalizer = require("../lib/proxy-normalizer")

class ReusableField {
  // See comment block below for explanations
  static #SIGNATURES = {
    ATTRIBUTES_ON_TYPE: Symbol("ATTRIBUTES_ON_TYPE")
  }

  // See comment block below for explanations
  static #TYPE_DEFAULT_ATTRIBUTES_CODE = 0

  constructor() {
    throw new Error("'ReusableField' is not constructible")
  }

  static createType(fieldType) {
    if (!(fieldType instanceof BaseFieldType))
      throw new Error("'fieldType' must be an instance of 'BaseFieldType'")

    fieldType.resetAttributes()
    const attributesMap = new Map()
    const signatureForActiveTypeAttributes =
      ReusableField.#SIGNATURES.ATTRIBUTES_ON_TYPE
    const supportedAttributes = fieldType.constructor.getSupportedAttributes(
      fieldType.getDeterminer()
    )

    /**
     * This creates numbers which will be used as selectors for the attributes.
     * The first attribute in the 'supportedAttributes' array will have a selector
     * of '1', the second a selector of '2', the third a selector of '4', and the
     * fourth a selector of '8' and so on. These in binary are '0001', '0010',
     * '0100', and '1000', making them usable to create unions of attributes with
     * the '|' bitwise operator.
     *
     * By default, a reusable field type has an attributes
     * selector of '0' signalling that no attribute is active (set to 'true') on it.
     * If, for example, the second attribute in the array of supported attributes is
     * chained on the type, a union of '0' and '2' ('0 | 2') is created resulting in
     * '2', meaning that the set of active attributes needed is the second attribute
     * only. If, after this, the third attribute is chained, a union of '2' and '4'
     * ('2 | 4') is created resulting in '6' which in binary is '0110', meaning that
     * the set of active attributes needed is the second and third attributes.
     *
     * The selector for attributes activated on a type is attached to it via a signature
     * to avoid recalculating it each time.
     */
    const attributesSelectors = supportedAttributes.reduce(
      (object, attribute, index) => {
        object[attribute] = 2 ** index
        return object
      },
      {}
    )

    const handler = {
      get(target, property) {
        const selectorForChainedAttribute = attributesSelectors[property]
        const propertyIsChainedAttribute =
          selectorForChainedAttribute !== undefined

        if (propertyIsChainedAttribute) {
          const selectorForActiveAttributes =
            target[signatureForActiveTypeAttributes]

          const selectorForAllNeededAttributes =
            /* eslint-disable-next-line no-bitwise */
            selectorForActiveAttributes | selectorForChainedAttribute

          const storedTypeWithNeededAttributesEnabled = attributesMap.get(
            selectorForAllNeededAttributes
          )

          if (storedTypeWithNeededAttributesEnabled !== undefined)
            return storedTypeWithNeededAttributesEnabled

          /**
           * Simulate attribute chaining with duplicated field type to
           * activate necessary attributes
           */
          const newTypeWithNeededAttributesEnabled =
            target.duplicate()[property]
          newTypeWithNeededAttributesEnabled[signatureForActiveTypeAttributes] =
            selectorForAllNeededAttributes

          const proxiedNeededType = new Proxy(
            newTypeWithNeededAttributesEnabled,
            handler
          )
          attributesMap.set(selectorForAllNeededAttributes, proxiedNeededType)
          return proxiedNeededType
        }

        /* eslint-disable-next-line prefer-rest-params */
        return ProxyNormalizer.get(...arguments)
      },

      set(...args) {
        return ProxyNormalizer.set(...args)
      }
    }

    fieldType[signatureForActiveTypeAttributes] =
      ReusableField.#TYPE_DEFAULT_ATTRIBUTES_CODE
    return new Proxy(fieldType, handler)
  }
}

module.exports = ReusableField
