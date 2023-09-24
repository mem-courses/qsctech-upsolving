const _mainCvs_=document.getElementById("AniamteCanvas");
const _ctx_=_mainCvs_.getContext("2d");

const _TownImgList=[];
for(let q=0;q<TotalFrame;q++){
    const _TownImg=new Image();
    _TownImg.src="./jpgSeq/dayInTown"+((q+1).toString()).padStart(4,"0")+".jpg";
    _TownImg.onload=()=>{
        //放出第一帧
        if(q===0) _ctx_.drawImage(_TownImg,0,0);
        _TownImgList[q]=_TownImg;
    };
}

const _Interval_=50;
let _lastTime_=undefined;
let _currentFrame_=0;
function _TownAnimation(timeStamp){
    const elapsed=timeStamp-((_lastTime_===undefined)?0:_lastTime_);
    if(elapsed>_Interval_ && _TownImgList.length>=TotalFrame &&_apiSet.isPlaying){
        _ctx_.drawImage(_TownImgList[_currentFrame_],0,0);
        _currentFrame_++;
        if(_currentFrame_>=TotalFrame)_currentFrame_=0;
        _lastTime_=timeStamp;
    }
    window.requestAnimationFrame(_TownAnimation);
}


//开始播放的按钮
_apiSet.isPlaying=false;
const StartButton=document.getElementById("StartButton");
StartButton.addEventListener("click",(e)=>{
    StartButton.style.display="none";
    StartButton.style.pointerEvents="none";
    _apiSet.isPlaying=true;
    window.requestAnimationFrame(_TownAnimation);
})

_apiSet.play=()=>{
    _apiSet.isPlaying=true;
}

_apiSet.stop=()=>{
    _apiSet.isPlaying=false;
}

_apiSet.gotoAndStop=(frame)=>{
    if(frame<0) frame=0;
    if(frame>=TotalFrame-1)frame=TotalFrame-2;
    _currentFrame_=frame;
    //因为已经停止，需要自己强制更新。
    _ctx_.drawImage(_TownImgList[frame],0,0);
    _apiSet.isPlaying=false;
}

_apiSet.gotoAndPlay=(frame)=>{
    if(frame<0) frame=0;
    if(frame>=TotalFrame-1)frame=TotalFrame-2;
    _currentFrame_=frame;
    _apiSet.isPlaying=true;
}

_apiSet.getCurrentFrame=()=>{
    return _currentFrame_;
}