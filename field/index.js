const ReusableFieldType = require("./reusable-type")
const FieldTypes = require("./types")

const {
  ArrayOf: ArrayOfFieldType,
  Custom: CustomFieldType,
  Exact: ExactFieldType,
  InstanceOf: InstanceOfFieldType,
  ObjectOf: ObjectOfFieldType,
  OneOf: OneOfFieldType,
  Primitive: PrimitiveFieldType
} = FieldTypes

const Field = {
  Types: {
    // Usable directly -e.g- 'Field.Types.string.isFilled.isOptional'
    any: ReusableFieldType.create(new PrimitiveFieldType("any")),
    array: ReusableFieldType.create(new PrimitiveFieldType("array")),
    bigint: ReusableFieldType.create(new PrimitiveFieldType("bigint")),
    boolean: ReusableFieldType.create(new PrimitiveFieldType("boolean")),
    function: ReusableFieldType.create(new PrimitiveFieldType("function")),
    number: ReusableFieldType.create(new PrimitiveFieldType("number")),
    object: ReusableFieldType.create(new PrimitiveFieldType("object")),
    string: ReusableFieldType.create(new PrimitiveFieldType("string")),
    symbol: ReusableFieldType.create(new PrimitiveFieldType("symbol")),

    // Called as functions -e.g- 'Field.Types.arrayOf(Field.Types.string)'
    arrayOf: ReusableFieldType.provision(ArrayOfFieldType),
    custom: ReusableFieldType.provision(CustomFieldType),
    exact: ReusableFieldType.provision(ExactFieldType),
    instanceOf: ReusableFieldType.provision(InstanceOfFieldType),
    objectOf: ReusableFieldType.provision(ObjectOfFieldType),
    oneOf: ReusableFieldType.provision(OneOfFieldType),
    primitive: ReusableFieldType.provision(PrimitiveFieldType)
  }
}

module.exports = Field
