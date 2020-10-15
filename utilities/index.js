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
    },
    parseRequest(req) {
        let filter = { ...req.query };
        let expand = filter.expand

        if ('expand' in filter) {
            // remove the expand parameter so it doesn't get used in the filter
            delete filter.expand;
        }

        return { filter, expand }

    }
}