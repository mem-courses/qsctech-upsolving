//如果开启DEBUG,则会不会记录已完成的内容，会重复发送已经完成的成就和对话，
const DEBUG=false;
//使用fs操作文件
const fs=require('fs');
//选择express搭建web服务器
const express=require('express');
const bodyParser = require('body-parser');
const { json } = require('body-parser');
const app=express();

const METAFileName="./dialogMETA.json";
const DialogFileName="./AllDialogs.b64";

//json对话数据,用URI编码
const dialogs=JSON.parse(
    decodeURIComponent(
        (Buffer.from(
            fs.readFileSync(DialogFileName,"binary")
        ,"base64").toString("utf-8"))
    )
);

//动态的任务状态数据
const dialogsMETA=JSON.parse(fs.readFileSync(METAFileName,"utf-8"));

//服务器侦听的端口号
const listenHost=9998;

//匹配所有请求的中间件,要用next走接下来匹配到的中间件

//扩大请求的大小
app.use(bodyParser.json({limit:"10mb"}));
app.use(bodyParser.urlencoded({limit:"10mb",extended:true}));
app.use(json("10mb"));


app.use(function(req,res,next){
    //本次允许前端不挂在http端口，使得访问同源,但cors必须小心设置
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, x-requested-with");
    res.header("Access-Allowed-Methods", "POST,GET");
    next();
});

//必须引用一个静态的中间件函数json,才能用body-parser解析请求体
app.use(express.json());

//建立连接
app.get("/connect",function(req,res){
    
    res.status(200).send(JSON.stringify(
        createResponse("hasConnect","firstConnect")
    ));
    console.log("/connect:Connect with the world creator!");
});

app.get("/getTime",function(req,res){
    res.status(200).send(JSON.stringify(
        createResponse("hasGetTime","firstGetTime")
    ));
});

app.get("/setTime",function(req,res){
    //尚未获得时间，无法触发对话
    if(!dialogsMETA.hasGetTime){
        res.status(200).send(JSON.stringify(
            {judge:false}
        ));
        return;
    }
    res.status(200).send(JSON.stringify(
        createResponse("hasSetTime","firstSetTime")
    ));
});

app.get("/freezeTime",function(req,res){
    res.status(200).send(JSON.stringify(
        createResponse("hasStop","firstStop")
    ));
});

app.get("/combo",function(req,res){
    res.status(200).send(JSON.stringify(
        createResponse("hasCombo","firstCombo")
    ));
});


app.get("/systemTime",function(req,res){
    const time=new Date();
    const hour=time.getHours();
    const curDay=time.getDate();
    console.log(`时间：${hour}天数：${curDay}`);
    let diaInfo={};
    let needHello=false;
    let isMorning=true;
    //如果是新的一天，就刷新提醒状态
    if(curDay !== dialogsMETA.curDay){
        dialogsMETA.hasGoodMorning=false;
        dialogsMETA.hasGoodNight=false;
        dialogsMETA.curDay=curDay;
        changeMETA();
    }
    //判断时间
    if((!dialogsMETA.hasGoodMorning) && (hour>=6 && hour<=10) ){
        needHello=true;
        if(!DEBUG) dialogsMETA.hasGoodMorning=true;
        diaInfo=dialogs.goodMorning;
    }else if((!dialogsMETA.hasGoodNight) && (hour>=23 || hour<=3)){
        needHello=true;
        if(!DEBUG) dialogsMETA.hasGoodNight=true;
        diaInfo=dialogs.goodNight;
        isMorning=false;
    }
    //文本插值
    let retString=JSON.stringify({
        judge:needHello,
        dialogInfo:diaInfo,
        isMorning:isMorning,
    });
    retString=retString.replace("$HOUR$",hour.toString());
    retString=retString.replace("$DATE$",curDay.toString());
    res.status(200).send(retString);

});

//侦听端口
let server=app.listen(listenHost,function(){
    let host = server.address().address;
    let port = server.address().port;
    console.log("对话册的服务器访问地址为http://%s:%s",host,port);
});


function createResponse(METAKeyName,dialogsKeyName){
    let isFirst=false;
    if(!dialogsMETA[METAKeyName]){
        isFirst=true;
        if(!DEBUG){
            dialogsMETA[METAKeyName]=true;
            changeMETA();
        }
    }
    return {
        judge:isFirst,
        dialogInfo:((isFirst)?dialogs[dialogsKeyName]:{}),
    };
}


function changeMETA(){
    fs.writeFile(METAFileName,JSON.stringify(dialogsMETA),
    {encoding:"utf-8",
    flag:"w"},()=>{
        console.log("changeMETA():updata META file");
    });
}


/*
const tempDialog=Buffer.from(encodeURIComponent(JSON.stringify(dialogs)),"utf-8");
fs.writeFile("./AllDialogs.b64",tempDialog.toString("base64"),{encoding:"binary",flag:"w"},()=>{
    console.log("finish dialogs to binary!");
});
*/
