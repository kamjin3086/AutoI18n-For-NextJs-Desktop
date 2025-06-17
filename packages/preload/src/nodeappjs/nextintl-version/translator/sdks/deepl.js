// 引入 node-fetch 仅在 Node.js 环境中需要
import fetch from 'node-fetch';

/**
 * 使用 DeepL API 进行文本翻译的函数
 *
 * @param {string} text 要翻译的文本
 * @param {string} targetLang 目标语言代码 (如 'DE' - 德语)
 * @param {string} sourceLang 源语言代码 (如 'EN' - 英语, 可选)
 * @returns {Promise<string>} 返回一个 promise，解析为翻译后的文本
 */
async function translateText(text, targetLang, sourceLang = null) {
  const endpoint = 'https://api-free.deepl.com/v2/translate';
  const params = new URLSearchParams({
    auth_key: 'YOUR_API_KEY',   // 替换为你的 DeepL API Key
    text: text,
    target_lang: targetLang,
  });

  if (sourceLang) {
    params.append('source_lang', sourceLang);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: params,
    });
    const data = await response.json();
    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text; // 返回翻译结果
    } else {
      return 'No translation available.'; // 没有翻译结果
    }
  } catch (error) {
    console.error('Error translating text:', error);
    return 'Error in translation API call.';
  }
}


// 示例调用
translateText('Hello, world!', 'DE').then(console.log); // 应输出 "Hallo, Welt!"
