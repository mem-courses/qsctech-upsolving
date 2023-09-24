const _apiSet={
    play:null,
    stop:null,
    gotoAndPlay:null,
    gotoAndStop:null,
    getCurrentFrame:null,
    isPlaying:true,
}

const TotalFrame=252;

const StartFrameHour=15;

const APIName=Object.freeze({
    Connect:"connect",
    GetTime:"getTime",
    SetTime:"setTime",
    FreezeTime:"freezeTime",
    JudgeSystemTime:"systemTime",
    Combo:"combo",
});

//需要匹配的时序密码
const ComboCode=Object.freeze([
    6,9,12,15,18,21
])


//在js中也判断,只发一次请求,减少请求数量。
let hasRequest={
	getTime:false,
	setTime:false,
	freezeTime:false,
	combo:false,
};
