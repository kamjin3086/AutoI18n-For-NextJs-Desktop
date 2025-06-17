export function associateBy(array, keySelector) {
    return array.reduce((accumulator, currentElement) => {
        // 使用 keySelector 函数获取当前元素的键
        const key = keySelector(currentElement);
        // 将当前元素添加到累加器对象中，使用获取的键
        accumulator[key] = currentElement;
        return accumulator;
    }, {});
}

export function groupBy(array, keySelector) {
    return array.reduce((accumulator, currentElement) => {
        // 使用 keySelector 函数获取当前元素的键
        const key = keySelector(currentElement);
        // 如果累加器对象中还没有这个键，初始化为空数组
        if (!accumulator[key]) {
            accumulator[key] = [];
        }
        // 将当前元素添加到对应键的数组中
        accumulator[key].push(currentElement);
        return accumulator;
    }, {});
}
