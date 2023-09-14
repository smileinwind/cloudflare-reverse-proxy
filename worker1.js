export default {
  async fetch(request, env, ctx) {
    const rmap = env.ray_cookie;
    const url = new URL(request.url);
    let actualUrlStr = url.pathname.replace("/proxy/", "").replace("/proxy1/", "") + url.search + url.hash
    if (!actualUrlStr) {
      return new Response('https proxy: /proxy/\nhttp proxy: /proxy1/');
    }
    if (!/(http:\/\/|https:\/\/)/.test(url.pathname)) {
      if (url.pathname.includes("/proxy/")) {
    
        actualUrlStr = "https://" + actualUrlStr;
      } else if (url.pathname.includes("/proxy1/")) {

        actualUrlStr = "http://" + actualUrlStr;
      } else if (url.pathname.includes("https://")) {
        actualUrlStr = actualUrlStr.replace("/http","http");
        console.log(actualUrlStr);
      }else {
        // let referer = request.headers.get("Referer");
        // let index =  referer.indexOf("workers.dev/proxy/")
        // if (referer && index>0) {
        //   let refererPath =  referer.substring(index+"workers.dev/proxy/".length).split("/")[0];
        //   if (referer.includes("/proxy/")) {
        //     actualUrlStr = "https://"+ refererPath + actualUrlStr;
        //     console.log(actualUrlStr);
        //   } else if (referer.includes("/proxy1/")) {
        //     actualUrlStr = "http://"+ refererPath + actualUrlStr;
        //   }
        // }
        // else

        const ray = request.headers.get("Cf-Ray");
        const v = await rmap.get("host");
        var result;
        if (v) {
          actualUrlStr = v + actualUrlStr;
          result = true;
        } else {
          // const headerValue = request.headers.get("Cookie");
          
          // if (headerValue && headerValue.includes("my-proxy-domain")) {
          //   let cookies = headerValue.split(";");
          //   cookies.forEach((value) => {
          //     if (value.includes("my-proxy-domain")){
          //       var vv = value.split("=")[1].replace(" ", "")
          //       actualUrlStr = vv  + actualUrlStr;
          //       rmap.put(ray,vv)
          //       result =true;
          //     }
          //   });
          // }
        }
        if(!result){
  
        return new Response('https proxy: /proxy/\nhttp proxy: /proxy1/');
        }
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
    var type = response.headers.get("Content-Type") || response.headers.get("content-type");
    if (200 == response.status && type.includes("text/html")) {
      let text = await response.text();
      let pattern = /(https?:\/\/)(.*)/;
      let replacement = "$1/proxy.gpt.iyunnan.org.cn/proxy/$2";

      let result = text.replace(pattern, replacement);
      //.replace( / src=["/']| srcset=["/']/g, 'src="./' +response.url);
      modifiedResponse = new Response(result, response);
      //modifiedResponse.headers.append("Set-Cookie", 'path=/;secure; HttpOnly domain=.dengsuperpeng.workers.dev; my-proxy-domain=' + response.url);
      // const ray = modifiedResponse.headers.get("Cf-Ray");
      const parsedUrl = new URL(response.url);
      parsedUrl.pathname="/";
      parsedUrl.search=""
      rmap.put("host", parsedUrl.toString());
     
      
    } else {
      modifiedResponse = new Response(response.body, response);
    }
    // 添加允许跨域访问的响应头
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    // modifiedResponse.headers.set('Cache-Contro', 'max-age=3600, public');

    modifiedResponse.headers.set('X-Frame-Options', 'allow-from https://proxy.iyunnan.org.cn/');


    return modifiedResponse;
  },
};
