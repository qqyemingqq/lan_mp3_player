function lyricInfo(){

}
lyricInfo.prototype = {
  constructor:lyricInfo,
  time:0,
  words:'',
  
  getTime:function(){
    return this.time;
  },
  getWords:function(){
    return this.words;
  }
}
module.exports=lyricInfo;