import FieldType from "./field-type/index"
import PrimitiveFieldType from "./field-type/primitive"

const SORTED_FIELD_ATTRIBUTE_ENTRIES = FieldType.ATTRIBUTE_ENTRIES.map(
  (entry) => entry.name
)

const SORTED_FIELD_ATTRIBUTES = SORTED_FIELD_ATTRIBUTE_ENTRIES.sort()

/**
 * This forces attributes to be set in alphabetical order (e.g
 * 'fieldType.isOptional.isReadonly'). 'O' in 'isOptional' comes before
 * 'R' in 'isReadonly'
 */
function assertEarlyAccessOfFieldTypeAttribute(fieldType, attribute) {
  const attributeIndex = SORTED_FIELD_ATTRIBUTES.findIndex(
    (value) => value === attribute
  )

  let attributeIsAccessedLate = false
  let attributeThatShouldBeAccessedLate = null

  for (let i = attributeIndex + 1; i < SORTED_FIELD_ATTRIBUTES.length; i++) {
    const currentAttribute = SORTED_FIELD_ATTRIBUTES[i]
    const valueOfcurrentAttribute = fieldType.getAttribute(currentAttribute)
    // const defaultValueOfCurrentAttribute = ""
    const currentAttributeIsAccessed = valueOfcurrentAttribute === true
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

function createReusablePrimitiveFieldType(type) {
  const createdFieldType = new PrimitiveFieldType(type)

  return new Proxy(createdFieldType, {
    get(target, property) {
      const propertyIsFieldTypeAttribute =
        SORTED_FIELD_ATTRIBUTES.includes(property)
      if (propertyIsFieldTypeAttribute) {
        assertEarlyAccessOfFieldTypeAttribute(target, property)
      }
    }
  })
}

const Field = {}

Field.Types = {
  string: createReusablePrimitiveFieldType("string"),
  number: createReusablePrimitiveFieldType("number"),
  boolean: createReusablePrimitiveFieldType("boolean"),
  symbol: createReusablePrimitiveFieldType("symbol"),
  bigint: createReusablePrimitiveFieldType("bigint"),
  function: createReusablePrimitiveFieldType("function"),
  object: createReusablePrimitiveFieldType("object")
}

Field.Indexes = {
  string: "string",
  number: "string",
  symbol: "string",
  template: "string"
}

export default Field
