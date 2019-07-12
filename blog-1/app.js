//第二层  基础信息的设置和配置  还没有涉及到业务信息的处理
const {get,set} = require('./src/db/redis')
const querystring = require('querystring')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

//获取 cookie 的过期时间
const getCookieExpires = ()=>{
    const d = new Date()
    d.setTime(d.getTime() + (24*60*60*1000))
    console.log('d.toGMTString() is ', d.toGMTString())
    return d.toGMTString()
}

// //seesion数据
// const SESSION_DATA = {}


//用于处理 post data
const getPostData = (req) =>{
    const promise = new Promise((resolve,reject) => {
        if(req.method !== 'POST'){
            resolve({})
            return
        }
        if (req.headers['content-type'] !== 'application/json'){
            resolve({})
            return
        }
        let postData = ''
        req.on('data',chunk =>{
            postData +=  chunk.toString()
        })
        req.on('end',()=>{
            if (!postData) {
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
    
}


const serverHandle = (req,res)=>{  
    //设置返回格式JSON
    res.setHeader('Content-type','application/json')//设置JSON的格式

    //获取path
    const url =req.url
    req.path = url.split('?')[0]

    //解析 query
    req.query = querystring.parse(url.split('?')[1])

    //解析cookie,基础工具
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''//k1=v1;k2=v2;k3=v3;
    cookieStr.split(';').forEach(item => {
        if(!item){
            return 
        }
        const arr = item.split('=')
        const key = arr[0].trim()
        const val= arr[1].trim()
        req.cookie[key] = val
    });
    // console.log('req.cookie is',req.cookie)

    // //解析session
    // let needSetCookie = false//默认判断一下是否需要设置seesion
    // let userId = req.cookie.userid
    // if(userId){
    //     if(!SESSION_DATA[userId]){
    //         SESSION_DATA[userId] ={}
    //     }
    //     req.session = SESSION_DATA[userId]
    // }else{
    //     const needSetCookie = true
    //     userId = `${Date.now()}_${Math.random()}`
    //     SESSION_DATA[userId] = {}
    //     }
    //     req.session = SESSION_DATA[userId]


    //解析session使用redis
    let needSetCookie = false//默认判断一下是否需要设置seesion
    let userId = req.cookie.userid
    if(!userId){//没有userId的情况下
        needSetCookie = true//需要写cookie
        userId = `${Date.now()}_${Math.random()}`//生成一个随机数
        //初始化redis 中的session
         set(userId, {})
    }
    //获取 session 
    req.sessionId = userId
    get(req.sessionId).then(sessionData => {
        if(sessionData == null){
            //初始化session
            set(req.sessionId,{})
            //shezhi  session
            req.session ={}
        }else{
            //设置session
            req.session = sessionData
        }
        // console.log('req.session',req.session)

        //处理post data
        return getPostData(req)
    })
    .then(postData=>{
        req.body = postData

        //处理blog路由
        // const blogData = handleBlogRouter(req,res)
        // if(blogData){
        //     res.end(
        //         JSON.stringify(blogData)
        //     )
        //     return 
        // }

        const blogResult = handleBlogRouter(req,res)
        if (blogResult){
            blogResult.then(blogData => {
                if(needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId};path=/; httpOnly; expires=${getCookieExpires()}`)//httpOnly只允许通过后端来改，不允许通过前端来改
                }
                res.end(
                    JSON.stringify(blogData)
                )
            })
            return
        }

        //处理user路由
        const userResult = handleUserRouter(req,res)
        if(userResult){
            userResult.then(userData =>{
                if(needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId};path=/; httpOnly; expires=${getCookieExpires()}`)//httpOnly只允许通过后端来改，不允许通过前端来改
                }
                res.end(
                    JSON.stringify(userData)
                )
            })
            return
        }

        //未命中路由，返回404
        res.writeHead(404,{"content-type":"text/plain"})
        res.write("404 Not Found\n")
        res.end()
    })
        
}

    module.exports = serverHandle