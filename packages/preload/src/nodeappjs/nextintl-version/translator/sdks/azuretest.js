import {default as axios} from 'axios';
import {v4 as uuidv4} from 'uuid';

const AZURE_SECRET_KEY = '1ceee115d33c4ffb87b27fc9ca600bde';
const AZURE_RESOURCE_LOCATION = 'global';
let key = process.env.AZURE_SECRET_KEY || AZURE_SECRET_KEY;
let endpoint = 'https://api.cognitive.microsofttranslator.com';

// location, also known as region.
// required if you're using a multi-service or regional (not global) resource. It can be found in the Azure portal on the Keys and Endpoint page.
let location = process.env.AZURE_LOCATION || AZURE_RESOURCE_LOCATION;

axios({
  baseURL: endpoint,
  url: '/translate',
  method: 'post',
  headers: {
    'Ocp-Apim-Subscription-Key': key,
    // location required if you're using a multi-service or regional (not global) resource.
    'Ocp-Apim-Subscription-Region': location,
    'Content-type': 'application/json',
    'X-ClientTraceId': uuidv4().toString(),
  },
  params: {
    'api-version': '3.0',
    'from': 'en',
    'to': 'zh',
  },
  data: [{
    'text': 'I would really like to drive your car around the block a few times!',
  }, {
    'text': 'how are you?',
  }],
  responseType: 'json',
}).then(function(response) {
  // const data = JSON.stringify(response.data, null, 4)
  const result = response.data.map((i) => i.translations.map((t) => t.text)[0]);
  console.log(result);
});
