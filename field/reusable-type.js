const BaseFieldType = require("./types/base")
const ProxyNormalizer = require("../lib/proxy-normalizer")

class ReusableFieldType {
  // See comment block below for explanations
  static #SIGNATURES = {
    SELECTOR_FOR_ACTIVE_TYPE_ATTRIBUTES: Symbol(
      "SELECTOR_FOR_ACTIVE_TYPE_ATTRIBUTES"
    )
  }

  // See comment block below for explanations
  static #SELECTOR_FOR_DEFAULT_ACTIVE_TYPE_ATTRIBUTES = 0

  constructor() {
    throw new Error("'ReusableFieldType' is not constructible")
  }

  static create(fieldType) {
    if (!(fieldType instanceof BaseFieldType))
      throw new Error("'fieldType' must be an instance of 'BaseFieldType'")

    fieldType.resetAttributes()
    const fieldTypesPerAttributesSelector = new Map()
    const signatureForSelectorOfActiveTypeAttributes =
      ReusableFieldType.#SIGNATURES.SELECTOR_FOR_ACTIVE_TYPE_ATTRIBUTES

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
          const selectorForCurrentlyActiveAttributes =
            target[signatureForSelectorOfActiveTypeAttributes]

          const selectorForAllNeededAttributes =
            /* eslint-disable-next-line no-bitwise */
            selectorForCurrentlyActiveAttributes | selectorForChainedAttribute

          const storedTypeWithNeededAttributesActivated =
            fieldTypesPerAttributesSelector.get(selectorForAllNeededAttributes)

          if (storedTypeWithNeededAttributesActivated !== undefined)
            return storedTypeWithNeededAttributesActivated

          /**
           * Simulate attribute chaining with duplicated field type to
           * activate necessary attributes
           */
          const newTypeWithNeededAttributesActivated =
            target.duplicate()[property]
          newTypeWithNeededAttributesActivated[
            signatureForSelectorOfActiveTypeAttributes
          ] = selectorForAllNeededAttributes

          const proxiedVersionOfNeededType = new Proxy(
            newTypeWithNeededAttributesActivated,
            handler
          )

          fieldTypesPerAttributesSelector.set(
            selectorForAllNeededAttributes,
            proxiedVersionOfNeededType
          )
          return proxiedVersionOfNeededType
        }

        /* eslint-disable-next-line prefer-rest-params */
        return ProxyNormalizer.get(...arguments)
      },

      set(...args) {
        return ProxyNormalizer.set(...args)
      }
    }

    fieldType[signatureForSelectorOfActiveTypeAttributes] =
      ReusableFieldType.#SELECTOR_FOR_DEFAULT_ACTIVE_TYPE_ATTRIBUTES
    return new Proxy(fieldType, handler)
  }
}

module.exports = ReusableFieldType
