exports.chunkenator = (array, size, fn) => {
    let groups = [],
        result = [];

    for (const value of array) {
        const group = fn(value);
        if (!groups[group]) groups[group] = [];
        if (!groups[group].length) result.push(groups[group]);
        groups[group].push(value);
        if (groups[group].length === size) groups[group] = [];
    }

    return result;
};