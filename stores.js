var stores = {};

module.exports = {
  getStores: function () { return stores; },
  setStore: function (id, store) { stores[id] = store; },
  getStore: function (id) { return stores[id]; },
};
