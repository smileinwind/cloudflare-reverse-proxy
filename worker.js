export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let actualUrlStr = url.pathname.replace("/proxy/", "").replace("/proxy1/", "") + url.search + url.hash
    if(!actualUrlStr){
      return new Response('https proxy: /proxy/\nhttp proxy: /proxy1/');
    }
    if (!/(http:\/\/|https:\/\/)/.test(url.pathname)) {
      if (url.pathname.includes("/proxy/")) {
        actualUrlStr = "https://" + actualUrlStr;
      } else if (url.pathname.includes("/proxy1/")) {
        actualUrlStr = "http://" + actualUrlStr;
      } else {
        return new Response('https proxy: /proxy/\nhttp proxy: /proxy1/');
      }
    }
    const actualUrl = new URL(actualUrlStr)

    const modifiedRequest = new Request(actualUrl, {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: 'follow'
    });

    const response = await fetch(modifiedRequest);
    let modifiedResponse;
    if (200 == response.status && response.headers.get("content-type").includes("text/html")) {
      let text = await response.text();
      let pattern = /(https?:\/\/)(.*)/;
      let replacement = "$1/proxy.gpt.iyunnan.org.cn/proxy/$2";

      let result = text.replace(pattern, replacement);
      modifiedResponse = new Response(result, response);
    } else {
      modifiedResponse = new Response(response.body, response);
    }
    // 添加允许跨域访问的响应头
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');

    return modifiedResponse;
  },
};
