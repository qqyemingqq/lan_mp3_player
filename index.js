var path = require('path');//导入node的path库
var fs = require('fs');//导入node的fs库

var musicIndex = 0;
var musicInfomation = require("./musicInfo.js");
var musicList = [];
var durEleArry = new Array();       //存放每个音乐列表的时间DOM，用作异步读取时间并写入时间
var musicEleArry = new Array();     //用于存放临AudioElement，用作加载音乐读取时间
var mouseDown = false;              //存放当前鼠标按下状态
var volumeMouseDown = false;
var fr = new FileReader();
var dictorySelecter = document.querySelector('.dictorySelecter');//选择音乐路径控件
var windowTitle = document.querySelector('.windowTitle');//获取窗体名称，控制任务栏显示的歌曲名字
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

dictorySelecter.addEventListener('change', folderSelectedHandler, false);
musicPlayer.addEventListener('pause', setPlayButtonToPlayHandler);
musicPlayer.addEventListener('play', setPlayButtonToPauseHandler);
musicPlayer.addEventListener('ended', resetPlayerAndRandomPlayNextMusicHandler);
playButton.addEventListener('pointerup', musicPlayAndPauseChangeHandler);
nextButton.addEventListener('pointerup', setNextMusicHandler);
previousButton.addEventListener('pointerup', setPreviousMusicHandler);
controller.addEventListener('mousedown', dragDropHandler);
volumeController.addEventListener('mousedown', volumeDragDropHandler);
window.addEventListener('mousemove', dragDropHandler);
window.addEventListener('mousemove', volumeDragDropHandler);
window.addEventListener('mouseup', dragDropHandler);
window.addEventListener('mouseup', volumeDragDropHandler);

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
  if (musicPlayer.getAttribute('src')) {
    if (musicPlayer.paused == false) {
      musicPlayer.pause();
    } else {
      musicPlayer.play();
    }
  }
}
/**
 * 选择文件夹后的处理操作
 * @param {Event} event 
 */
function folderSelectedHandler(event) {
  addMusicFiles(event.target.files);
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
                          <td class="col0"></td>
                          <td class="col1">` + files[i] + `</td>
                          <td class="col2">` + '???' + `</td>
                          <td class="col3">` + fileinfo(floder[0].path + '/' + files[i]) + `</td>
                          `;

      var minfo = new musicInfomation();
      minfo.path = floder[0].path + '/' + files[i];
      minfo.name = files[i];
      minfo.sort = musicIndex;
      minfo.nameElement = files_tr.getElementsByClassName('col1')[0];
      minfo.durationElement = files_tr.getElementsByClassName('col2')[0];
      musicIndex++;
      musicList.push(minfo);

      var tempAudioElement = document.createElement('audio');
      tempAudioElement.setAttribute('src', floder[0].path + '/' + files[i]);
      tempAudioElement.play();
      tempAudioElement.volume = 0;
      document.body.appendChild(tempAudioElement);
      musicEleArry.push(tempAudioElement);
      durEleArry.push(files_tr.getElementsByClassName('col2')[0]);
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
  console.log('src');
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
  var musicDuration = window.setInterval(function () {
    if (musicPlayer.duration && !mouseDown && !musicPlayer.paused) {
      musicTimer.innerText = secToTimeFormat(musicPlayer.currentTime) + '/' + secToTimeFormat(musicPlayer.duration);
      controller.style.left = (musicPlayer.currentTime / musicPlayer.duration) * slider.offsetWidth - controller.offsetWidth / 2 + 'px';
      processor.style.width = (musicPlayer.currentTime / musicPlayer.duration) * slider.offsetWidth + 'px';
      if (musicPlayer.end) {
        window.clearInterval(musicDuration);
      }
    }
  }, 100);
}
/**
 * 传入时间，将时间格式化为：00:00
 * @param {number} time
 */
function secToTimeFormat(time) {
  if (typeof (time) == 'number') {
    var sec = (time % 60).toFixed(0);
    var min = (time / 60).toFixed(0);
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
          }
        }
        break;
      }
    case 'mouseup':
      {
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
//测试代码-----开始
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
//测试代码-----结束
/**
 * 通过url来遍历音乐list中的音乐返回音乐object
 * @param {string} url 
 */
function getMusicObjByMusicUrl(url) {
  var flag = false;
  var o;
  musicList.forEach(function (element) {
    if (url == element.path) {
      console.log(url == element.path);
      flag = true;
      // console.log(element);
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
 * @return {bject}
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
 * @return {object} MusicInfo
 */
function playMusicByMusicUrl(url) {
  musicPlayer.setAttribute('src', url);
  musicPlayer.play();
  setCurrentTitle()
}
/**
 * 通过当前的播放的音乐来设置窗口标题
 */
function setCurrentTitle() {
  windowTitle.innerText = getMusicObjByMusicUrl(musicPlayer.getAttribute('src')).name;
}