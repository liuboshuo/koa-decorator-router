import { controllers } from "./../common/decorator"
export * from "../controller/index"

/**
 * 初始化路由
 */
export default (app,router) => {
    controllers.forEach((item) => {
        // 获取每个路由的前缀
        const prefix = item.constructor.prefix; 
        let url = item.url;
        if(prefix) url = `${prefix}${url}`; // 组合真正链接
        console.log(item.method,url); // 打印请求的路由method,url
        router[item.method](url, ...item.middleware, item.handler); // 创建路由
    });
    app.use(router.routes()).use(router.allowedMethods()) // 路由装箱
}