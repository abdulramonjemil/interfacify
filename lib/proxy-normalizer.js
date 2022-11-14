const ProxyNormalizer = {
  get(target, property, receiver) {
    const gottenValue = target[property]
    if (typeof gottenValue !== "function") return gottenValue
    return function normalizeThisInMethod(...args) {
      return gottenValue.apply(this === receiver ? target : this, args)
    }
  },

  set(target, property, value) {
    target[property] = value
    return true
  }
}

module.exports = ProxyNormalizer
