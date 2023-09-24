const DialogBox=document.getElementsByClassName("chatBox")[0];

const serverPath="http://localhost:9998";

//制造一个对话框（纯函数）
let isLeftTurn=true;
function getNewChatCloud(speaker,content){
    const ret=document.createElement("div");
    ret.setAttribute("class",(isLeftTurn)?"chatCloudLeft":"chatCloudRight");
    const nameDiv=document.createElement("div");
    nameDiv.setAttribute("class","chatName");
    nameDiv.innerText=speaker;
    ret.appendChild(nameDiv);
    const contentDiv=document.createElement("div");
    contentDiv.setAttribute("class",(isLeftTurn)?"chatContentLeft":"chatContentRight");
    contentDiv.innerText=content;
    ret.appendChild(contentDiv);

    isLeftTurn=!isLeftTurn;
    return ret;
}

//一个队列，先进(出现)先出(退隐)
const chatcloudLump=[];
const MaxDialogNum=6;

//cloud：class为chatCloud的div元素，将其透明后销毁
function fadeChatCloud(cloud){
    if(cloud.parentElement===null) return;
    cloud.style.opacity=0;
    setTimeout(() => {
        cloud.parentElement.removeChild(cloud);
        let index=chatcloudLump.indexOf(cloud);
        if(index!==-1) chatcloudLump.splice(index,1);
    }, 550);
}

//载入一个新的对话框到DialogBox中
//如果没有名字，则名字缺省为“左A右B”
function loadCloudToList(speaker,content){
    if(speaker===undefined) speaker=(isLeftTurn)?"A":"B";
    const newCloud = getNewChatCloud(speaker,content);
    newCloud.style.opacity=0;
    newCloud.style.maxHeight="0px";
    DialogBox.appendChild(newCloud);
    //延迟才能进行载入时的动画
    setTimeout(
        ()=>{
            newCloud.style.maxHeight="450px";
            newCloud.style.opacity=1;
        }
    ,10);

    chatcloudLump.unshift(newCloud);
    if(chatcloudLump.length>MaxDialogNum){
        const oldCloud=chatcloudLump.pop();
        fadeChatCloud(oldCloud);
    }
    return newCloud;
}

//载入一次对话到DialogBox中
const DialogInterval=1000;
let isDialogActive=false;
const waitingList=[];

function loadDialogsToList(dialogInfo){
    //true为谈话者A，false为B
    let curSpeaker=true;
    //index表示谈到第几句话
    let index=0;
    //对话框是否正在被占用，如是，则新对话加入等待列表，不要打断现有对话
    isDialogActive=true;
    //根据一句话的长度，判断需要等待个几轮才说完开始下一句话
    let wordBufferNum=0;
    const dialogsInterval=setInterval(()=>{
        if(index>0){
            const wordlen=dialogInfo.dialogs[index-1].length;
            if(wordBufferNum*5<wordlen){
                wordBufferNum++;
                return;
            }
            wordBufferNum=0;
        }
        if(index>=dialogInfo.dialogs.length){
            clearInterval(dialogsInterval);
            if(waitingList.length===0){
                //如果没有其他对话，7秒钟后对话全部消失，取消占用状态
                setTimeout(()=>{
                    for(let one of chatcloudLump) fadeChatCloud(one);
                    isDialogActive=false;
                },7000);
            }else{
                //如果还有其他对话，2秒钟后对话全部消失，再过2秒钟后继续下一段对话，保持占用状态
                setTimeout(()=>{
                    for(let one of chatcloudLump) fadeChatCloud(one);
                    setTimeout(()=>{
                        loadDialogsToList(waitingList.pop());
                    },2000);
                },2000);
            }
            return;
        }
        loadCloudToList(
            dialogInfo[((curSpeaker)?"A":"B")],
            dialogInfo.dialogs[index]
        );
        index++;
        curSpeaker=!curSpeaker;
    },DialogInterval);
}


function addOneDialogsIntoQueue(dialogInfo){
    //把消息加入等待列表，和直接开启对话，二者等价
    if(isDialogActive){
        waitingList.unshift(dialogInfo);
    }else{
        loadDialogsToList(dialogInfo);
    }
}



function triggerAchievement(type){
    //每次开始时尝试连接
    fetch(serverPath+"/"+type,{method:"GET"})
    .then((res)=>{
        return res.json();
    }).then((obj)=>{
        if(obj.judge){
            addOneDialogsIntoQueue(obj.dialogInfo);
            //特殊的操作会开启背景音乐
            if(type===APIName.Combo){
                playBGM("./src/FallCherryBlossom.mp3");
            }else if(type===APIName.JudgeSystemTime){
                if(obj.isMorning){
                    playBGM("./src/BrightDew.mp3");
                }else{
                    playBGM("./src/StarsShimmer.mp3");
                }
            }
        }
    }).catch((err)=>{
        if(type===APIName.Connect){
            addSpecialCloud("穿越者","没有连接到服务器,但没关系,不过是没办法听到些只言碎语罢了;请继续加油,完成你的使命!",5000)
            console.info("没有连接到服务器,但没关系,不过是没办法听到些只言碎语罢了;请继续加油,完成你的使命！\n——求是潮");
        }else if(type===APIName.Combo){
            addSpecialCloud("穿越者","终于,小镇的时间不再飞逝,每个人都把握住自己的年华;抛弃无数的顾虑抓住当下,对于过往也从未感到遗憾。我要替居民们,对您说声感谢！感谢您,默默付出的创世主！");
        }
    });
}

//控制背景音乐播放
let currentBGM=null;
function playBGM(src){
    if(currentBGM!==null){
        currentBGM.pause();
        currentBGM=null;
    }
    currentBGM=new Audio(src);
    currentBGM.volume=0.05;
    currentBGM.play();
    currentBGM.loop=false;
}

//时序密码combo判定
let comboMatchIndex=0;
let isComboMatchReady=true;
const ComboMatchBufferTime=5000;

function comboJudgeEntry(hour){
    if(!isComboMatchReady || hasRequest.combo) return;
    if(hour===ComboCode[0]){
        //关闭入口，关闭时序接收
        isComboMatchReady=false;
        //comboJudgeContinual()会先等待五秒，之后开启下一轮判别,0表示成功匹配的下标
        comboJudgeContinual(0);
    }
}

//只有在成功时才继续调用此方法，由多个定时器组成，每五秒判断当前时间是否符合预期
function comboJudgeContinual(correctIndex){
    if(correctIndex>=ComboCode.length-1){
        //完成所有的匹配（最后一步），触发成就
        addSpecialCloud("报时人",`时间凝滞在${ComboCode[correctIndex]}点,是时候了`,4000);
        hasRequest.combo=true;
        triggerAchievement(APIName.Combo);
        return;
    }
    //仅完成一步，先在五秒钟后判别下一步
    setTimeout(()=>{
        //如果五秒后的钟表时间匹配下一时序，则继续，否则退出匹配
        const hour=parseInt(getTime().slice(0,2));
        if(hour===ComboCode[correctIndex+1]){
            //成功,继续
            comboJudgeContinual(correctIndex+1);
        }else{
            //失败，重新准备接收时序
            isComboMatchReady=true;
            addSpecialCloud("报时人","时间似乎没有规律,处于混沌之中了",4000);
        }
    },ComboMatchBufferTime);
    //放出成功匹配信息,并在四秒钟后清除这奇特的信息
    addSpecialCloud("报时人",`时间凝滞在${ComboCode[correctIndex]}点,这似乎预示着什么`,4000);

    console.log("now match:",getTime(),"now index",correctIndex);
}


function addSpecialCloud(speaker,content,lastTime){
    let newCloud=loadCloudToList(speaker,content);
    setTimeout(()=>{
        fadeChatCloud(newCloud);
    },lastTime);
}



//初次连接判定。
triggerAchievement(APIName.Connect);

//系统时间判定。
setTimeout(()=>{
    triggerAchievement(APIName.JudgeSystemTime);}
,4000);