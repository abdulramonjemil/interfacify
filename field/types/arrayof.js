const FieldType = require("./default")

class ArrayOfFieldType extends FieldType {
  isTypeOf(value) {
    const { isOptional: fieldIsOptional } = this.getAttributes()
    if (value === undefined) return fieldIsOptional

    if (!Array.isArray(value)) return false
    const determiner = this.getDeterminer()
    const determinerCanValidate = determiner instanceof FieldType

    const isValidValue = determinerCanValidate
      ? determiner.isTypeOf
      : (item) => item === determiner
    return value.every(isValidValue)
  }
}

module.exports = ArrayOfFieldType
