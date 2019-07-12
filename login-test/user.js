const mysql = require('mysql')
const { set } = require('../db/redis')
const {SuccessModel,ErrorModel} = require('../model/resModel')

//创建连接对象
const con = mysql.createConnection(MYSQL_CONF)

//开始连接
con.connect()

//统一执行sql的函数
function exec(sql){
    const promise = new Promise((resolve,reject) =>{
        con.query(sql,(err,result)=>{
            if(err){
                reject(err)
                return 
            }
            resolve(result)
        })
    })
    return promise    
}

const login = (username,password) => {
    const sql = `
        select username,realname from users where username='${username}' and password='${password}'
    `
    return exec(sql).then(rows =>{
        return rows[0] || {}
    })
}

const handleUserRouter = (req,res)=>{
    const method = req.method//GET POST

    //登录
    if(method === 'POST' && req.path === '/api/user/login'){
        const {username,password } = req.body
        // const {username,password} = req.query
        const result = login(username,password)
        return  result.then(data =>{
            if(data.username){
                 
                // //操作cookie
                // res.setHeader('Set-Cookie',`username=${data.username};path=/; httpOnly; expires=${getCookieExpires()}`)//httpOnly只允许通过后端来改，不允许通过前端来改
                
                //设置session
                req.session.username = data.username
                req.session.realname = data.realname
                //同步到 redis
                set(req.sessionId, req.session)
                
                console.log('req.session is',req.session)

                return new SuccessModel()
            }else{
                return new ErrorModel('登录失败')
            }
        })
        
    }
}