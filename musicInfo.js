function musicInfo(){

}
musicInfo.prototype = {
  constructor:musicInfo,
  name:"",
  duration:0,
  path:"",
  nameElement:'',
  durationElement:'',
  listElement:'',
  indexElement:'',
  title:'',
  artist:'',
  
  getName:function(){
    return this.name;
  },
  getDuration:function(){
    return this.duration;
  },
  getPath:function(){
    return this.path;
  },
  getNameElement:function(){
    return this.nameElement;
  },
  getDurationElement:function(){
    return this.durationElement;
  },
  getListElement:function(){
    return this.listElement;
  },
}
module.exports=musicInfo;