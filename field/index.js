const FieldTypes = require("./types")

function createReusablePrimitiveFieldType(type) {
  const createdFieldType = new FieldTypes.Primitive(type)

  return new Proxy(createdFieldType, {
    // get(target, property) {
    //   const propertyIsFieldTypeAttribute =
    //     SORTED_FIELD_ATTRIBUTES.includes(property)
    //   if (propertyIsFieldTypeAttribute) {
    //     assertEarlyAccessOfFieldTypeAttribute(target, property)
    //   }
    // }
  })
}

const Field = {}

Field.Types = {
  bigint: createReusablePrimitiveFieldType("bigint"),
  boolean: createReusablePrimitiveFieldType("boolean"),
  function: createReusablePrimitiveFieldType("function"),
  number: createReusablePrimitiveFieldType("number"),
  object: createReusablePrimitiveFieldType("object"),
  string: createReusablePrimitiveFieldType("string"),
  symbol: createReusablePrimitiveFieldType("symbol")
}

module.exports = Field
