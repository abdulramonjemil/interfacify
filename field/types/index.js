const ArrayOf = require("./arrayof")
const Base = require("./base")
const Custom = require("./custom")
const Exact = require("./exact")
const InstanceOf = require("./instanceof")
const ObjectOf = require("./objectof")
const OneOf = require("./oneof")
const Primitive = require("./primitive")

const FieldTypes = {
  ArrayOf,
  Base,
  Custom,
  Exact,
  InstanceOf,
  ObjectOf,
  OneOf,
  Primitive
}

module.exports = FieldTypes
