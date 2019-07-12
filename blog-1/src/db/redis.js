const redis = require('redis')
const {REDIS_CONF} = require('../conf/db')

//创建客户端
const redisClient = redis.createClient(REDIS_CONF.port,REDIS_CONF.host)
redisClient.on('error', err => {
    console.error(err)
})

function set(key,val){
    //注意，key val 必须是字符串，如果val是object形式要将其转换成JSON字符串格式
    if(typeof val === 'object'){
        val = JSON.stringify(val)
    }
    redisClient.set(key,val,redis.print)
}

function get(key){
    return new Promise((resolve,reject) => {
        redisClient.get('myname', (err,val) =>{
            if(err){
                 reject(err)
                return
            }
            if (val == null){ 
                resolve(null)
                return
            }

            //兼容JSON的转换格式
            try{
                resolve(
                    JSON.parse(val)//反推，如果是JSON字符串将其转化成对象，
                                    //如果失败则说明不是JSON字符串，则抛出
                )
            }catch (ex){
                resolve(val)
            }
        })
    })

}

module.exports = {
    set,
    get
}