var path = require('path');//导入node的path库
var fs = require('fs');//导入node的fs库
var { ipcRenderer, shell } = require('electron');
ipcRenderer.send('put-in-tray');
var musicIndex = 0; var jsmediatags = require("jsmediatags");
var musicInfomation = require("./musicInfo.js");
var lyricInfo = require("./lyricInfo.js");
var findLyric = false;
var musicList = [];
var soundID = 0;
var currentLyric = [];
var durEleArry = new Array();       //存放每个音乐列表的时间DOM，用作异步读取时间并写入时间
var musicEleArry = new Array();     //用于存放临AudioElement，用作加载音乐读取时间
var mouseDown = false;              //存放当前鼠标按下状态
var volumeMouseDown = false;
var dictorySelecter = document.querySelector('.dictorySelecter');//选择音乐路径控件
var windowTitle = document.querySelector('.windowTitle');//获取窗体名称，控制任务栏显示的歌曲名字
var dirUrl = document.querySelector('.dirUrl');//获取显示的路径
var fileList = document.querySelector('#fileListTable');//获取音乐播放器列表容器
var musicPlayer = document.querySelector('.musicPlayer');//播放器主体
var processor = document.querySelector('.processor');//红色进度条
var slider = document.querySelector('.slider');//播放器的滑块控制系统
var volumeButton = document.querySelector('.volumeButton');//声音控制按钮
// var mousePosition = document.querySelector('#mousePosition');//跟随鼠标文本
var buffer = document.querySelector('.buffer');//缓冲器，暂无用途
var controller = document.querySelector('.controller');//播放器滑块控制器

var previousButton = document.querySelector('.previousButton');//播放器上一首按钮
var playButton = document.querySelector('.playButton');//播放器播放按钮
var nextButton = document.querySelector('.nextButton');//播放器下一首按钮

var musicTimer = document.querySelector('.musicTimer');//播放器当前时间显示

var volumeProcessor = document.querySelector('.volumeProcessor');//音量进度条
var volumeController = document.querySelector('.volumeController');//音量控制器
var volumeSlider = document.querySelector('.volumeSlider');//音量控制器

var crossButton = document.querySelector('.crossButton');//音量控制器
var minusButton = document.querySelector('.minusButton');//音量控制器

var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var geci = document.querySelector('.geci');//歌词
geci.style.right = 0 + 'px';
geci.style.top = parseInt(canvas.getBoundingClientRect().top) + 'px';

dictorySelecter.addEventListener('change', folderSelectedHandler, false);
musicPlayer.addEventListener('pause', setPlayButtonToPlayHandler);
musicPlayer.addEventListener('play', setPlayButtonToPauseHandler);
musicPlayer.addEventListener('ended', resetPlayerAndRandomPlayNextMusicHandler);
playButton.addEventListener('pointerup', musicPlayAndPauseChangeHandler);
nextButton.addEventListener('pointerup', setNextMusicHandler);
previousButton.addEventListener('pointerup', setPreviousMusicHandler);
controller.addEventListener('mousedown', dragDropHandler);
volumeController.addEventListener('mousedown', volumeDragDropHandler);
minusButton.addEventListener('mousedown', () => { ipcRenderer.send('hide-window'); });
crossButton.addEventListener('mousedown', () => { ipcRenderer.send('window-all-closed'); });
window.addEventListener('mousemove', dragDropHandler);
window.addEventListener('mousemove', volumeDragDropHandler);
window.addEventListener('mouseup', dragDropHandler);
window.addEventListener('mouseup', volumeDragDropHandler);

ipcRenderer.on('ControlPlayer', (event, arg) => {
  console.log(arg);
  switch (arg) {
    case 'next':
      setNextMusicHandler();
      break;
    case 'previous':
      setPreviousMusicHandler();
      break;
    case 'stop':
      musicPlayAndPauseChangeHandler();
      break;
    case 'ramdom':
      resetPlayerAndRandomPlayNextMusicHandler();
      break;

    default:
      break;
  }
})
/**
 * 播放上一首
 */
function setPreviousMusicHandler() {
  var m = getMusicObjByMusicUrl(musicPlayer.getAttribute('src'));
  if (m.sort == 0) {
    playMusicByMusicUrl(getMusicObjBySort(musicList.length - 1).path);
  } else {
    playMusicByMusicUrl(getMusicObjBySort(m.sort - 1).path);
  }
}

/**
 * 播放下一首
 */
function setNextMusicHandler() {
  var m = getMusicObjByMusicUrl(musicPlayer.getAttribute('src'));
  if (m.sort == musicList.length - 1) {
    playMusicByMusicUrl(getMusicObjBySort(0).path);
  } else {
    playMusicByMusicUrl(getMusicObjBySort(m.sort + 1).path);
  }
}

/**
 * 设置播放按钮到播放状态
 */
function setPlayButtonToPlayHandler() {
  playButton.setAttribute('src', './res/play.png');
}
/**
 * 设置播放器按钮到暂停状态
 * 设置窗体名称
 */
function setPlayButtonToPauseHandler() {
  playButton.setAttribute('src', './res/pause.png');
}
/**
 * 重置播放器状态并继续随机播放下一首
 */
function resetPlayerAndRandomPlayNextMusicHandler() {
  controller.style.left = -13 + 'px';
  processor.style.width = 0 + 'px';
  resetMusicTimer();
  playMusicByMusicUrl(musicList[parseInt(Math.random() * musicList.length, 10)].path);
}
/**
 * 播放器暂停和播放按钮控制切换
 */
function musicPlayAndPauseChangeHandler() {
  var _src = musicPlayer.getAttribute('src');
  if (_src) {
    if (musicPlayer.paused == false) {
      musicPlayer.pause();
    } else {
      musicPlayer.play();
      setTagFromFileToSearchLyric(_src);
      findLyric = false;
    }
  }
}
/**
 * 选择文件夹后的处理操作
 * @param {Event} event 
 */
function folderSelectedHandler(event) {
  addMusicFiles(event.target.files);
  dirUrl.innerText = event.target.files[0].path;
  // currentLyric=[];
  geci.innerText = '';
  dirUrl.addEventListener('click', () => {
    shell.showItemInFolder(dirUrl.innerText)
  })
  this.select();
  window.parent.document.body.focus();
}
/**
 * 检查支持的文件类型，不支持的过滤不显示
 * @param {string} fileName 
 */
function chekMusicFile(fileName) {
  acess = false;
  musicFileType = ['mp3', 'flac', 'wav', 'wma'];
  musicFileType.forEach(function (element) {
    if (fileName.indexOf(element) > 0) {
      acess = true;
    }
  }, this);
  return acess;
}
/**
 * 根据文件列表创建音乐文件列表并添加鼠标双击事件
 * @param {FileList} floder 
 */
function addMusicFiles(floder) {
  musicList = [];
  fs.readdir(floder[0].path, function (err, fsFiles) {
    fileList.innerHTML = '';
    var files = [];
    for (i in fsFiles) {
      if (fs.statSync(floder[0].path + '/' + fsFiles[i]).isFile() && chekMusicFile(fsFiles[i])) {
        files.push(fsFiles[i]);
      }
    }
    for (var i = 0; i < files.length; i++) {
      var files_tr = document.createElement('tr');


      fileList.appendChild(files_tr);
      files_tr.innerHTML = `
                          <td class="col0">` + (parseInt(musicIndex) + 1) + `</td>
                          <td class="col1">` + files[i] + `</td>
                          <td class="col2">` + '???' + `</td>
                          <td class="col3">` + fileinfo(floder[0].path + '/' + files[i]) + `</td>
                          `;

      var minfo = new musicInfomation();
      minfo.path = floder[0].path + '/' + files[i];
      minfo.name = files[i];
      minfo.sort = musicIndex;
      minfo.indexElement = files_tr.getElementsByClassName('col0')[0];
      minfo.nameElement = files_tr.getElementsByClassName('col1')[0];
      minfo.durationElement = files_tr.getElementsByClassName('col2')[0];
      minfo.listElement = files_tr;
      musicIndex++;
      musicList.push(minfo);
      // console.log(minfo);
      files_tr.addEventListener('dblclick', function () {
        var _src = floder[0].path + '/' + this.getElementsByClassName('col1')[0].innerText;
        playMusicByMusicUrl(_src);
        createInterval();
      })
    }
    musicList.forEach(function (element) {
      getDurationFromMusic(element);
    })
  })
}

/**
 * 通过音乐对象来异步获取时间长度并刷新显示
 * @param {object} mObj 
 */
function getDurationFromMusic(mObj) {
  var promise = new Promise(function (resolve, reject) {
    var aE = document.createElement('audio');
    aE.setAttribute('src', mObj.path);
    document.body.appendChild(aE);
    aE.addEventListener('loadeddata', function () {
      resolve(this);
    })
    // aE.play();
  });
  promise.then(function (date) {
    mObj.duration = date.duration;
    mObj.durationElement.innerText = secToTimeFormat(date.duration);
    destorySelf(date);
  })
}

function addAudioElement() {
  // TODO
}
function setAudioDuration(audioEle) {
  return audioEle.duration;
}

function destorySelf(element) {
  element.parentElement.removeChild(element);
}

/**
 * 添加定时器，控制播放器的控制滑块的位置以及当前播放的时间
 * 音乐结束时删除自己
 */
function createInterval() {
  mO = getMusicObjByMusicUrl(musicPlayer.getAttribute('src'));
  var musicDuration = window.setInterval(function () {
    if (musicPlayer.duration && !mouseDown && !musicPlayer.paused) {
      musicTimer.innerText = secToTimeFormat(musicPlayer.currentTime) + '/' + secToTimeFormat(musicPlayer.duration);
      controller.style.left = (musicPlayer.currentTime / musicPlayer.duration) * slider.offsetWidth - controller.offsetWidth / 2 + 'px';
      processor.style.width = (musicPlayer.currentTime / musicPlayer.duration) * slider.offsetWidth + 'px';
      if (!findLyric) {
        searchLyric(mO.title, mO.artist);
        findLyric = true;
      }
      geci.innerText = displayLyric(currentLyric);
      if (musicPlayer.end) {
        window.clearInterval(musicDuration);
      }
    }
  }, 500);
}
/**
 * 传入时间，将时间格式化为：00:00
 * @param {number} time
 */
function secToTimeFormat(time) {
  if (typeof (time) == 'number') {
    var sec = (time % 60) << 0;
    var min = (time / 60) << 0;
    if (min < 10) min = '0' + min;
    if (sec < 10) sec = '0' + sec;
    return (min + ':' + sec)
  }
}
/**
 * 传入音乐文件地址，通过node的fs库获取文件大小，并转成“M”单位
 * @param {string} dir_str 
 */
function fileinfo(dir_str) {
  return (fs.statSync(dir_str).size / 1024 / 1024).toFixed(2).toString() + "M";
}
/**
 * 初始化计时器显示
 */
function resetMusicTimer() {
  musicTimer.innerText = '00:00/00:00';
}

/**
 * 处理控制器被鼠标移动的时候其他DOM的刷新
 * @param {MouseEvent} event 
 */
function dragDropHandler(event) {
  switch (event.type) {
    case 'mousedown':
      {
        mouseDown = true;
        break;
      }
    case 'mousemove':
      {
        if (mouseDown) {
          var halfW = controller.offsetWidth >> 1;
          if (event.movementX + controller.offsetLeft <= slider.offsetWidth - halfW && event.movementX + controller.offsetLeft >= 0 - halfW) {
            controller.style.left = event.movementX + controller.offsetLeft + 'px';
            processor.style.width = event.movementX + processor.offsetWidth + 'px';
            if (musicPlayer.getAttribute('src') && mouseDown) {
              musicTimer.innerText = secToTimeFormat(getControllerOffsetPersentPosition() * musicPlayer.duration) + '/' + secToTimeFormat(musicPlayer.duration);
            }
          }
        }
        break;
      }
    case 'mouseup':
      {
        if (musicPlayer.getAttribute('src') && mouseDown) {
          musicPlayer.currentTime = getControllerOffsetPersentPosition() * musicPlayer.duration;
        }
        mouseDown = false;
        break;
      }
  }
}
function volumeDragDropHandler(event) {
  switch (event.type) {
    case 'mousedown':
      {
        volumeMouseDown = true;
        break;
      }
    case 'mousemove':
      {
        if (volumeMouseDown) {
          var halfW = volumeController.offsetWidth >> 1;
          if (event.movementX + volumeController.offsetLeft <= volumeSlider.offsetWidth - halfW && event.movementX + volumeController.offsetLeft >= 0 - halfW) {
            volumeController.style.left = event.movementX + volumeController.offsetLeft + 'px';
            volumeProcessor.style.width = event.movementX + volumeProcessor.offsetWidth + 'px';
            musicPlayer.volume = getVolumeControllerOffsetPersentPosition();
          }
        }
        break;
      }
    case 'mouseup': {
      volumeMouseDown = false;
      break;
    }
  }
}
/**
 * 返回当前控制器的百分比位置
 */
function getControllerOffsetPersentPosition() {
  return (controller.offsetLeft + controller.offsetWidth / 2) / slider.offsetWidth;
}
/**
 * 
 */
function getVolumeControllerOffsetPersentPosition() {
  var value = (volumeController.offsetLeft + volumeController.offsetWidth / 2) / volumeSlider.offsetWidth;
  if (value > 1) {
    return 1;
  } else if (value < 0) {
    return 0;
  } else {
    return value;
  }
}
/**
 * 通过url来遍历音乐list中的音乐返回音乐object
 * @param {string} url 
 */
function getMusicObjByMusicUrl(url) {
  var flag = false;
  var o;
  musicList.forEach(function (element) {
    if (url == element.path) {
      flag = true;
      o = element;
    }
  });
  if (flag == true) {
    return o;
  }
}
/**
 * 通过url来遍历音乐list中的音乐返回音乐object
 * @param {number} sortID 
 * @return {object} musicInfo
 */
function getMusicObjBySort(sortID) {
  var flag = false;
  var o;
  musicList.forEach(function (element) {
    if (sortID == element.sort) {
      flag = true;
      o = element;
    }
  });
  if (flag == true) {
    return o;
  }
}
/**
 * 通过url来遍历音乐list中的音乐返回音乐object
 * @param {string} url 
 */
function playMusicByMusicUrl(url) {
  var o = getMusicObjByMusicUrl(musicPlayer.getAttribute('src'));
  if (o) {
    o.indexElement.innerText = o.sort + 1;
    o.listElement.style.backgroundColor = '';
  }
  musicPlayer.setAttribute('src', url);
  musicPlayer.play();
  findLyric = false;
  o = getMusicObjByMusicUrl(url);
  setTagFromFileToSearchLyric(o.path)
  o.indexElement.innerText = '♫';
  o.listElement.style.backgroundColor = '#c8c6c5'
  setCurrentTitle()
}
/**
 * 通过当前的播放的音乐来设置窗口标题
 */
function setCurrentTitle() {
  windowTitle.innerText = getMusicObjByMusicUrl(musicPlayer.getAttribute('src')).name;
}

var audioCtx = new AudioContext();
var source = audioCtx.createMediaElementSource(musicPlayer);
var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;
var ratio = (window.devicePixelRatio || 1) / (canvasCtx.backingStorePixelRatio || 1);//获取当前设备设备像素比
source.connect(analyser);
analyser.connect(audioCtx.destination);
visualize(analyser);

function visualize(analyser) {
  cheight = canvas.height;
  cwidth = canvas.width;
  meterWidth = 8 //频谱条宽度
  gap = 2 //频谱条间距
  capHeight = 2
  capStyle = '#fff'
  meterNum = (776 / (gap + meterWidth)) << 0  //频谱条数量
  capYPositionArray = []; //将上一画面各帽头的位置保存到这个数组
  ctx = canvas.getContext('2d')
  gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(1, '#000f00');
  gradient.addColorStop(0.5, '#ff0');
  gradient.addColorStop(0, '#f00');
  var test = '#000';
  var key = true;
  var drawMeter = function () {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var step = (0.5 + array.length / meterNum) << 0; //计算采样步长
    arr = [];
    for (var j = 0; j < meterNum; j++) {
      var n = 0;
      for (var i = 0; i < step; i++) {
        n += array[j * step + i];
      }
      arr.push((n / step) << 0);
    }
    array = arr;
    var previousArray;//上一帧频谱条位置
    for (var i = 0; i < meterNum; i++) {
      var value = array[i]; //获取当前能量值    * step
      if (value >= cheight) {
        value = cheight;
      }
      if (capYPositionArray.length < (0.5 + meterNum) << 0) {
        capYPositionArray.push(value); //初始化保存帽头位置的数组，将第一个画面的数据压入其中
      };
      ctx.fillStyle = capStyle;
      //开始绘制帽头
      if (value < capYPositionArray[i]) { //如果当前值小于之前值
        ctx.clearRect(i * (meterWidth + gap), cheight - (capYPositionArray[i]), meterWidth * ratio, capHeight * ratio); //则使用前一次保存的值来绘制帽头
        ctx.fillRect(i * (meterWidth + gap), cheight - (--capYPositionArray[i]), meterWidth * ratio, capHeight * ratio); //则使用前一次保存的值来绘制帽头
      } else {
        ctx.fillRect(i * (meterWidth + gap), cheight - value, meterWidth * ratio, capHeight * ratio); //否则使用当前值直接绘制
        capYPositionArray[i] = value;
      };
      //开始绘制频谱条
      ctx.fillStyle = gradient;
      if (previousArray != undefined) {
        var shangValue = previousArray[i]
        if (shangValue < value) {
          //继续绘制
          ctx.fillRect(i * (meterWidth + gap), cheight - value + capHeight, meterWidth * ratio, value - shangValue);
        } else if (shangValue > value) {
          //擦除操作
          ctx.clearRect(i * (meterWidth + gap), cheight - shangValue + capHeight, meterWidth * ratio, shangValue - value);
        } else if (shangValue == value) {
          //不绘制
        }
      } else {
        ctx.fillRect(i * (meterWidth + gap), cheight - value + capHeight, meterWidth * ratio, cheight * ratio);
      }
      // ctx.clearRect(i * (meterWidth + gap), cheight - capYPositionArray[i] + capHeight, meterWidth * ratio, cheight - value + capHeight);
      // ctx.fillStyle = test;
      // ctx.fillRect(i * (meterWidth + gap), cheight - value + capHeight, meterWidth * ratio, cheight * ratio);
      // ctx.fillStyle = gradient;
      // ctx.fillRect(i * (meterWidth + gap), cheight - value + capHeight, meterWidth * ratio, cheight * ratio);
    }
    previousArray = array;
    requestAnimationFrame(drawMeter);
  }
  requestAnimationFrame(drawMeter);
}

var lyric;
/**
 * 获取歌词文件
 * @param {string} str 
 */
function readLyricString(id) {
  loadSound(id);
  function loadSound(id) {
    var request = new XMLHttpRequest();
    // http://ttlyrics.com/api/download/?id=1276065271
    url = 'http://ttlyrics.com/api/download/?id=' + id
    request.open('GET', url, true);
    request.responseType = 'text';
    request.onload = function () {
      var lyric = request.response;
      currentLyric = decodeLyricString(lyric);
    }
    request.send();
  }
}

// 
function searchLyric(title, artist = '') {
  if (title == '' || title == undefined) return;
  var request = new XMLHttpRequest();
  url = 'http://ttlyrics.com/api/search/common/?title=' + title + '&artist=' + artist
  // console.log(url);
  request.open('GET', url, true);
  request.responseType = 'text';
  request.onload = function () {
    // var re = new RegExp('lrc.+?'+title + '.+?' + artist + '.+? id="(.+?)"');
    var re = new RegExp('title="' + title + '" artist=".+?' + artist + '" id="(.+?)".+?/>');
    var findOut = false;
    (request.response).split('lrc').forEach(function (s) {
      var result = s.match(re);
      if (result != null && !findOut) {
        readLyricString(result[1]);
        findOut = true;
      }

    }, this);
    // soundID = (request.response).match(re)[1];
  }
  request.send();
}

/**
 * 解析歌词返回歌词数组
 * @param {string} arr 
 * @return {[]}
 */
function decodeLyricString(str) {
  lyr = [];
  var arr = str.split('\n');
  arr.pop(arr.length - 1);
  arr.forEach((value) => {
    var t = lyricTimeToSec(value.match(/\[\d+:\d+\.\d+\]/g));
    console.log(value);
    if (t != null) {
      var word = value.replace(/\[\d+:\d+\.\d+\]/g, '');
      t.forEach(function (val) {
        var li = new lyricInfo();
        li.time = val;
        li.words = word;
        lyr.push(li);
      }, this);
    }
  })
  return lyr;
}


function lyricTimeToSec(arr) {
  if (arr != null) {
    var time = [];
    arr.forEach(function (value) {
      var a = value.match(/\d+/g);
      time.push(toTime(a));
    });
  }
  function toTime(arr) {
    var fen = parseInt(arr[0]) * 60;
    var miao = parseInt(arr[1]);
    var fmiao = parseInt('0.' + arr[2]);
    return fen + miao + fmiao
  }
  return time;
}

/**
 * 返回当前的歌词
 * @param {[]} lyricArray 
 */
function displayLyric(lyricArray) {
  var singleWord = '';
  var deltaTime = 99999;
  if (lyricArray.length <= 0) {
    singleWord = '获取歌词中';
  } else {
    lyricArray.forEach(function (val) {
      if (musicPlayer.currentTime - val.time >= 0 && deltaTime > musicPlayer.currentTime - val.time) {
        deltaTime = musicPlayer.currentTime - val.time;
        singleWord = val.words;
      }
    }, this);

  }
  return singleWord;
}


function setTagFromFileToSearchLyric(path) {
  jsmediatags.read(path, {
    onSuccess: function (tag) {
      searchLyric(tag.tags.TIT2.data, tag.tags.TPE1.data);
    },
    onError: function (error) {
      console.log(error);
    }
  });
}