import Koa from "koa"
import koaBody from "koa-body"
import compress from "koa-compress"
import initRoutes from "./router"

import Router from "@koa/router";

const app = new Koa();
const router = new Router();


app.use(compress());

// TODO a warning from PyCharm here
// Argument type Koa.Middleware<{}, {}> is not assignable to parameter type Function
app.use(koaBody({
    multipart: true,
    // Patch request body to Node's ctx.req
    patchNode: true
}));

initRoutes(app, router)

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`启动成功! env=${process.env.NODE_ENV}`)
    console.log(`Listening at http://localhost:${PORT}`)
})
