import Koa from "koa"
import bodyparser from "koa-bodyparser"
import compress from "koa-compress"
import Router from "koa-router"
import initRoutes from "./router"

const app = new Koa();
const router = new Router();


app.use(compress());
app.use(bodyparser());

initRoutes(app, router)

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`启动成功! env=${process.env.NODE_ENV}`)
    console.log(`Listening at http://localhost:${PORT}`)
})
