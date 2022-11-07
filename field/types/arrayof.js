const BaseFieldType = require("./base")

class ArrayOfFieldType extends BaseFieldType {
  isTypeOf(value) {
    const { isOptional: fieldIsOptional } = this.getAttributes()
    if (value === undefined) return fieldIsOptional

    if (!Array.isArray(value)) return false
    const determiner = this.getDeterminer()

    const isValidValue =
      determiner instanceof BaseFieldType
        ? determiner.isTypeOf.bind(determiner)
        : (item) => item === determiner
    return value.every(isValidValue)
  }
}

module.exports = ArrayOfFieldType
