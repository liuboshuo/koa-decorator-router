import {Controller, RequestMapping, RequestMethod} from '../common/decorator/index'
import TestFun from '../middleware/index'

// 添加Controller前缀
@Controller("/api/test")
export default class TestController {

    // 基本面使用 /api/test/login
    @RequestMapping({
        url: "/login",
        method: RequestMethod.GET, // 定义请求方法
    })
    async login(ctx) {
        ctx.body = {
            code: 0,
            message: "success"
        }
    }

    // 定义有中间件的router  /api/test/test
    @RequestMapping({
        method: RequestMethod.POST, // 定义请求方法
        middleware: [TestFun] // 使用中间件
    })
    async test(ctx) {
        ctx.body = {
            code: 0,
            message: "success"
        }
    }


}
