const { exec } = require('../db/mysql')

const getList = (author,keyword) =>{
    let sql =  `select * from blogs where 1=1 `//1=1的意义：如果author和keyword没有也成立
    if (author) {
        sql += `and author='${author}' `
    }
    if (keyword){
        sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc;`

    //返回 promise
    return exec(sql)
    
}

const getDetail = (id) => {
    // //先返回假数据
    // return {
    //         id:1,
    //         title:'标题A',
    //         content:'内容A',
    //         createTime:153552369589,
    //         author:'zhangsan'
    // }

    const sql =`select * from blogs where id ='${id}'`
    return exec(sql).then(rows => {
        return rows[0]  
    })
}

const newBlog = (blogData ={}) =>{
    //blogData 是一个博客对象，包含title content author 属性
    const title = blogData.title
    const content = blogData.content
    const author = blogData.author
    const createTime = Date.now()

    const sql = `
        insert into blogs (title,content,createtime,author)
        values ('${title}','${content}',${createTime},'${author}')
    `
    return exec(sql).then(insertData =>{
        // console.log('insertData is ',insertData)
        return{
            id:insertData.insertId
        }
    })
    // console.log('newBlog blogData...',blogData)

   
}

const updateBlog = (id,blogData = {}) => {
     //id 就是要更新博客的id
     //blogData 是一个博客对象，包含 title content 属性
    const title = blogData.title
    const content = blogData.content

    const sql = `
        update blogs set title='${title}',content='${content}' where id=${id}
    `
    return exec(sql).then(updateData =>{
        // console.log('updateData is ',updateData)
        if(updateData.affectedRows >0){
            return true
        }
        return false
    })
}

const delBlog = (id,author) => {//author保证博客删除安全性的问题
    //id就是要删除的博客
    const sql = `delete from blogs where id='${id}' and author='${author}'`
    return exec(sql).then(delData =>{
        if(delData.affectedRows>0){
            return true
        }
        return false
    })
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}