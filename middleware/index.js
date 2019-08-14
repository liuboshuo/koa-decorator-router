export default async (ctx,next)=>{
    console.log("middleware")
    await next();
}