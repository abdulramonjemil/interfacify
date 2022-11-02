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

module.exports = Field
