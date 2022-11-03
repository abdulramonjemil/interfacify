const FieldType = require("./default")

class OneOfFieldType extends FieldType {
  constructor(determiner, attributes) {
    if (!Array.isArray(determiner))
      throw new TypeError("'determiner' must be an array")

    if (determiner.length < 2)
      throw new Error(
        "The 'determiner' array must contain two or more elements"
      )

    super(determiner, attributes)
  }

  isTypeOf(value) {
    const { isOptional: fieldIsOptional } = this.getAttributes()
    if (value === undefined) return fieldIsOptional

    const variants = this.getDeterminer()
    return variants.some((member) => {
      if (member instanceof FieldType) return member.isTypeOf(value)
      return member === value
    })
  }
}

module.exports = OneOfFieldType
