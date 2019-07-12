const fs = require('fs')
const path = require('path')



//封装一个函数 callback 方式获取一个文件的内容
// function getFileContent(fileName,callback) {
//     const fullFileName = path.resolve(__dirname,'files',fileName)
//     fs.readFile(fullFileName,(err,data)=>{
//         if(err){
//             console.error(err)
//             return
//         }
//         callback(
//             JSON.parse(data.toString())//data打印出来默认为二进制形式，这边将它以对象的形式打印出来
//         )
        
//     })
// }

// //测试 callback-hell回调地狱
// getFileContent('a.json',aData =>{
//     console.log('a data',aData)
//     getFileContent(aData.next, bData =>{
//         console.log('b data',bData)
//         getFileContent(bData.next,cData =>{
//             console.log('c data',cData)
//         })
//     })
// })


//用promise获取文件内容
function getFileContent(fileName){
    return new Promise((resolve,reject) => {
        const fullFileName = path.resolve(__dirname,'files',fileName)
        fs.readFile(fullFileName,(err,data)=>{
            if(err){
                reject(err)
                return
            }
            resolve(
                JSON.parse(data.toString())//data打印出来默认为二进制形式，这边将它以对象的形式打印出来
            )
            
        })
    })

}

getFileContent('a.json').then(aData => {
    console.log('a data',aData)
    return getFileContent(aData.next)
}).then(bData => {
    console.log('b data',bData)
    return getFileContent(bData.next)
}).then(cData => {
    console.log('c data',cData)
})