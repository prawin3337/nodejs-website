let utils = {
    transformKeys: (mapObj, obj) =>
        Object.fromEntries(
            Object.entries(obj)
            .map(([k, v]) => [mapObj.get(k) || k, v])
        )
}

module.exports = utils;