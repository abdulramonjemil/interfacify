const FieldType = require("./default")

class OneOfFieldType extends FieldType {
  constructor(determiner, attributes) {
    if (!Array.isArray(determiner))
      throw new TypeError("'determiner' must be an array")

    if (determiner.length < 2)
      throw new Error(
        "The 'determiner' array must contain two or more elements"
      )

    if (new Set(determiner).size !== determiner.length)
      throw new Error("The 'determiner' array cannot contain duplicate types")

    super(determiner, attributes)
  }

  isTypeOf(value) {
    const { isOptional: fieldIsOptional } = this.getAttributes()
    if (value === undefined) return fieldIsOptional

    const variants = this.getDeterminer()
    return variants.some((member) => {
      if (member instanceof FieldType) return member.isTypeOf(value)
      if (Number.isNaN(member)) return Number.isNaN(value)
      return member === value
    })
  }
}

module.exports = OneOfFieldType
