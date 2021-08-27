/**
 * 请求方法
 */
export const RequestMethod = {
    "GET": "get",
    "POST": "post",
    "PUT": "put",
    "DELETE": "delete",
    "OPTION": "option",
    "PATCH": "patch"
}

/**
 * 定义注册的路由数组
 */
export const controllers = [];

/**
 * 给controller添加装饰
 * @param {*} path
 */
export function RestController(path = "") {
    return function (target) {
        // 给controller类添加路由前缀
        console.log(target)
        target.prefix = path;
    }
}

/**
 * 给controller类的方法添加装饰
 * url 可选
 * method 请求方法
 * middleware 中间件
 */
export function RequestMapping({url = "", method = "", middleware = []}) {
    return function (target, name, descriptor) {
        let path;
        // 判断有没有定义url
        if (!url) {
            // 取方法名作为路径
            path = `/${name}`;
        } else {
            // 自己定义的url
            path = url;
        }
        // 创建router需要的数据 url，method，middleware（可以没有）,最终执行的方法，装饰器队对象的构造函数
        const item = {
            url: path,
            method: method,
            middleware: middleware,
            handler: target[name],
            constructor: target.constructor,
        };
        controllers.push(item);
    }
}

export function GetMapping(value = "", middleware = []) {
    return RequestMapping({url: value, method: RequestMethod.GET, middleware: middleware})
}

export function PostMapping(value = "", middleware = []) {
    return RequestMapping({url: value, method: RequestMethod.POST, middleware: middleware})
}

export function PutMapping(value = "", middleware = []) {
    return RequestMapping({url: value, method: RequestMethod.PUT, middleware: middleware})
}

export function DeleteMapping(value = "", middleware = []) {
    return RequestMapping({url: value, method: RequestMethod.DELETE, middleware: middleware})
}

export function PatchMapping(value = "", middleware = []) {
    return RequestMapping({url: value, method: RequestMethod.PATCH, middleware: middleware})
}
