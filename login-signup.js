const path = require('path')
const fs = require('fs')
const db = require('./db')
//0=add login
//1=remove logout

function updateStatus(type,token){
    if(type == 1){
        console.log('logging out')
        db.getDb().collection('logstatus').remove({'token':token})
    }
    else{
        db.getDb().collection('logstatus').insertOne({'token':token,'value':1})
        console.log('logging in',token)
    }
}
function createspace(token) {
    db.getDb().collection('collection').insertOne({'token':token,'value':[]})
    db.getDb().collection('people').insertOne({'token':token,'value':[]})
    fs.mkdir(path.join(__dirname,'serverimages',token),(err)=>{
        if(err)console.log(err)
    })
    fs.mkdir(path.join(__dirname,'serverfiles',token),(err)=>{
        if(err)console.log(err)
    })

}
const userLogin = function(req,res){
    let email = req.query.email
    let password = req.query.password
    db.getDb().collection('users').findOne({'email':email, 'value.password':password},(err,result)=>{
        if(result){
            console.log(`${email} logged in`)
            updateStatus(0,result.value.token)
            res.send({'status':true,'name':result.value.name,'token':result.value.token,'email':email,'password':result.value.password})
            console.log('loggein')
        }
    })
}
const userlogout = function (req,res) {
    let token=req.query.token
    updateStatus(1,token)
    console.log(token,'logged out')
    res.send('success')
}

const userSignup = function(req,res){
    let email = req.query.email
    db.getDb().collection('users').findOne({'email':email},(err,result)=>{
        console.log(result)
        if(result){
            console.log('error email alreasy exist')
            res.send({'status':false})
        }
        else{
            console.log('signing up',email)
            let password = req.query.password
            let name = req.query.name
            console.log(email,password,name)
            let token = Math.floor(Math.random()*1000).toString()+'abc'+Math.floor(Math.random()*1000).toString()
            db.getDb().collection('users').insertOne({'email':email,'value':{'name':name,'password':password,'token':token,"space":0}})
            updateStatus(0,token)
            createspace(token)
            res.send({'status':true,'token':token,'name':name,'email':email,'password':password})
        }
    })
}

const edituser = (req,res)=>{
    let name = req.body.val
    let type = req.query.type
    let email =req.body.email
    if(type == 'name'){
        db.getDb().collection('users').findOneAndUpdate({'email':email},{$set:{'value.name':name}})
        res.send({'status':true})
    }
    else{
        db.getDb().collection('users').findOneAndUpdate({'email':email},{$set:{'value.password':name}})
        res.send({'status':true})
    }
}
module.exports = {userLogin,userSignup,userlogout,edituser}
