import {default as axios} from 'axios';
import {v4 as uuidv4} from 'uuid';

let key = import.meta.env.VITE_AZURE_SECRET_KEY;
let endpoint = 'https://api.cognitive.microsofttranslator.com';

// location, also known as region.
// required if you're using a multi-service or regional (not global) resource. It can be found in the Azure portal on the Keys and Endpoint page.
let location = import.meta.env.VITE_AZURE_LOCATION;

async function translate(inputs, source, target) {
  const inputsData = inputs.map((i) => {
    return {'text': i};
  });

  try {
    console.debug('Translate input: ', JSON.stringify(inputsData));
  } catch (e) {
    console.error(e);
  }
  const result = await axios({
    baseURL: endpoint, url: '/translate', method: 'post', headers: {
      'Ocp-Apim-Subscription-Key': key, // location required if you're using a multi-service or regional (not global) resource.
      'Ocp-Apim-Subscription-Region': location,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString(),
    }, params: {
      'api-version': '3.0', 'from': source, 'to': target,
    }, data: inputsData, responseType: 'json',
  });
  return result;
}

export default async function translateBatch(inputs, source, target) {
  let result = [];
  if (inputs.length === 0) {
    return [];
  }
  try {
    const response = await translate(inputs, source, target);
    if (response && response.data) {
      result = response.data.map((i) => i.translations[0].text);
    }
  } catch (err) {
    // 错误处理
    console.error('error', err);
    throw err; // 重新抛出错误，以便调用者可以捕获
  }
  return result;
}
