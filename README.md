# koa使用装饰器动态创建路由（router）

## 前言

在node项目，不管是koa/express路由的使用中，我们创建路由一般都是这样的姿势
```
router.post("/api/test", middleware, handler); // 创建路由
```
比如：

![router.jpg](https://upload-images.jianshu.io/upload_images/2152694-b0152a4431d61a0a.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们一般创建路由的`handler`会单独抽到其它文件也就是所说的`controller`，这样就会多了一步编写router的过程。那么这一步是否可以省略呢？

当然可以，本文带你一步步使用装饰器统一处理构建路由，这样不用在写完某一个`controller`的方法后再进行创建`router`啦，使用装饰器，我们只需要在某一个接口方法上添加路由的装饰就可以进行创建router。那么精彩来啦~

## 项目结构

![项目结构.jpg](https://upload-images.jianshu.io/upload_images/2152694-df22c54e17637d4c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

开始啦，一步步教你使用装饰器构建路由喽！

## 初始化项目

#### 初始化`package.json`

新建一个目录，用`vscode`打开。执行`npm init`初始化创建`package.json`

安装koa项目使用的第三方包：

```
npm install -S  koa koa-router koa-bodyparser koa-compress
```
* koa-router 管理路由
* koa-bodyparser 读取post,put数据转化对象格式
* koa-compress 压缩请求数据提高传输速度

#### 配置babel支持ES6 ES7

因为项目使用装饰器配置路由，必须支持ES7语法，才需要配置babel

本文配置的是babel7版本

下面我带大家一步步配置babel

```
npm install -D @babel/core 
npm install -D @babel/preset-env
npm install -D @babel/plugin-proposal-decorators
npm install -D @babel/register
```
babel7版本 使用的是@babel，7以下是babel-xxx 这点很容易区分

下面介绍一下这些包的功能

* @babel/core babel 核心代码
* @babel/preset-env 编译新版的语法 如：箭头函数，但是并不转换新版api 如：Array.include 转换新版api及兼容浏览器之间的差异（兼容ie）需要 babel-polyfill
* @babel/plugin-proposal-decorators 解析装饰器
* @babel/register 在运行时进行即时编译，不是进行先编译在运行

然后在项目根目录创建.babelrc文件

配置预设，插件
```
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "node": "current"
      }
    }]
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ]
}
```
到此，配置结束。项目比较简单，这些babel配置在本项目已经足够使用，接下来就可以愉快的使用es6，装饰器新语法了

#### 创建node服务
新建`index.js，app.js`启动一个服务

index.js 主要是进行babel注册，以及启动服务的中介文件。
为什么会这样呢？在这个文件进行使用动态编译，但是编译的时候是不会编译index.js文件的，所以，这个文件还是需要使用e5的旧语法
```
require("@babel/register")
require("./app")
```

app.js才会去真正启动node服务

```
import Koa from "koa"
import bodyparser from "koa-bodyparser"
import compress from "koa-compress"

app.use(compress());
app.use(bodyparser());


const PORT = 8081;
app.listen(PORT,()=>{
    console.log(`启动成功! env=${process.env.NODE_ENV}`)
    console.log(`Listening at http://localhost:${PORT}`)
})
```

#### 配置运行命令，启动服务

然后需要添加package.json的执行命令

`"dev":"cross-env NODE_ENV=development nodemon ./index.js"`

这里用到了两个node开发中常用的两个插件`cross-env`，`nodemon`其主要用途如下

安装`npm install -D cross-env nodemon`，安装到`devDependencies`

* cross-env 给项目添加环境变量区分是开发环境和生产环境，一般在执行npm命令前添加环境变量通过

这个地方添加了`NODE_ENV`变量，在程序中可以通过`process.env.NODE_ENV`获取执行命令添加的变量值

* nodemon 可以替代node启动服务，只是nodemon功能丰富，可以监听代码的更改重新启动项目

下面执行`npm run dev`可以看到服务启动成功

![1565227107(1).jpg](https://upload-images.jianshu.io/upload_images/2152694-83c473632302d1c9.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 添加路由装饰器

在项目根目录新建common目录，然后在common目录下新建decorator目录，在这个目录新建index.js

no bi bi ，上代码：

```
/**
 * 请求方法
 */
export const RequestMethod = {
    "GET":"get",
    "POST": "post",
    "PUT": "pust",
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
export function Controller(path=""){
    return function(target){
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
export function RequestMapping({url="",method="",middleware=[]}){
    return function(target,name,descriptor){
        let path = "";
        // 判断有没有定义url
        if(!url){
            // 取方法名作为路径
            path = `/${name}`;
        }else{
            // 自己定义的url
            path = url;
        }
        // 创建router需要的数据 url，method，middleware（可以没有）,最终执行的方法，装饰器队对象的构造函数
        const item = {
            url:path,
            method:method,
            middleware:middleware,
            handler:target[name],
            constructor:target.constructor,
        };
        controllers.push(item);
    }
}
```

## 路由的统一创建

创建router文件夹，再继续创建index.js文件

no bi bi ，上代码：

此文件是统一创建路由的入口文件，需要传入koa实例和koa-router实例进行创建路由和路由装箱

```
import { controllers } from "./../common/decorator"
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
```

然后在 app.js进行初始化路由：

```
initRoutes(app,router)
```


## 使用

创建controler/index.js , middleware/index.js

middleware/index.js的测试代码

```
export default async (ctx,next)=>{
    console.log("middleware")
    await next();
}
```

controler/index.js的测试代码：

```



import {RequestMethod,Controller,RequestMapping } from "./../common/decorator/index"
import TestFun from './../middleware/index'

// 添加Controller前缀
@Controller("/api/test")
export default class TestController {

    // 基本面使用 /api/test/login
    @RequestMapping({
        url:"/login",
        method:RequestMethod.GET, // 定义请求方法
    })
    async login(ctx){
        ctx.body = {
            code:0,
            message:"success"
        }
    }

    // 定义有中间件的router  /api/test/test
    @RequestMapping({
        method:RequestMethod.POST, // 定义请求方法
        middleware: [TestFun] // 使用中间件
    })
    async test(ctx){
        ctx.body = {
            code:0,
            message:"success"
        }
    }

    
}
```
把conttroller/index.js 在 router/index.js导入并导出
```export * from "../controller/index"```
如果还有其它controller，那么只需要在router/index.js添加就可以了~

重启服务

![1565241373(1).jpg](https://upload-images.jianshu.io/upload_images/2152694-78c7232731bd74f1.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 使用postman测试

![1565240592(1).jpg](https://upload-images.jianshu.io/upload_images/2152694-e0744151e94c48ab.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![1565240617(1).jpg](https://upload-images.jianshu.io/upload_images/2152694-cc61204716d0b5a3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

ok，搞定~，以后再也不用写router啦，感觉爽了很多！

代码注释很详细，若有什么不理解或者更好的建议，欢迎各位同学留言交流