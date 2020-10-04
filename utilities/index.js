module.exports = {
    createResultsCollection(data) {
        let obj = {};
        obj.items = data.length;
        obj.data = data;
        return obj;
    },
    copyToObj(from, to) {
        for (let key in from) {
            if (typeof (from[key]) === 'object' && !Array.isArray(from[key])) {
                let childKeys = Object.keys(from[key]);
                for (let child of childKeys) {
                    user[key][child] = from[key][child];
                }
            } else {
                to[key] = from[key];
            }
        }
        return to;
    }
}