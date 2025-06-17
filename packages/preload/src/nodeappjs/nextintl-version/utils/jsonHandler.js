//将内容转为有效的json field
export function toValidJsonField(inputString) {
  const randomLetter = String.fromCharCode(Math.floor(Math.random() * 26) + (Math.random() > 0.5 ? 65 : 97));
  if (inputString) {
    // 移除不是字母、数字或下划线的所有字符
    let validField = inputString.replace(/[^a-zA-Z0-9_]/g, '');

    // 如果结果字符串为空，生成一个随机字母
    if (validField.length === 0) {
      validField = randomLetter;
    }

    //如果长度大于N，则只使用前N位
    const N = 24;
    if (validField.length > N) {
      validField = validField.substring(0, N);
    }

    return validField;
  } else {
    return randomLetter;
  }
}

/**
 * 求出前一个json比后一个json多出来的部分
 * @param json1
 * @param json2
 * @returns {{}}
 */
export function diffJson(json1, json2) {
  const result = {};

  for (const key in json1) {
    if (json2[key] === undefined) {
      // 如果第二个 JSON 中不存在当前键，直接添加到结果中
      result[key] = json1[key];
    } else if (typeof json1[key] === 'object' && json1[key] !== null && typeof json2[key] === 'object' && json2[key] !== null) {
      // 如果两个键对应的值都是对象，则递归比较
      const nestedDiff = diffJson(json1[key], json2[key]);
      if (Object.keys(nestedDiff).length !== 0) {
        result[key] = nestedDiff;
      }
    } else if (json1[key] !== json2[key]) {
      // 如果两个键对应的值不相等，则添加到结果中
      result[key] = json1[key];
    }
  }

  return result;
}

/**
 * 将元数据转换为结构化数据
 * @param metadataList
 * @returns {{}}
 */
export function transformMetadataByLocaleJson(metadataList) {
  const structuredData = {};

  metadataList.forEach(item => {
    const {parentJsonKey, modifiedJsonKey, modifiedJsonValue} = item;

    // Initialize the parent key object if it does not exist
    if (!structuredData[parentJsonKey]) {
      structuredData[parentJsonKey] = {};
    }

    // Assign the modified JSON value to the correct key in the parent object
    structuredData[parentJsonKey][modifiedJsonKey] = modifiedJsonValue;
  });

  return structuredData;
}


// 示例使用
// const inputStr = "sora!@#cool man$ nice %^@ overrune&*()12.3";
// console.log(toValidJsonField(inputStr));
// console.log(toValidJsonField("!@#$%^&*()")); // 应该输出一个随机字母
