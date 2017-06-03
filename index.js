var path = require('path');//导入node的path库
var fs = require('fs');//导入node的fs库

var durEleArry = new Array();       //存放每个音乐列表的时间DOM，用作异步读取时间并写入时间
var musicSrcArry = new Array();     //存放所有音乐地址的信息，随机播放用
var musicEleArry = new Array();     //用于存放临AudioElement，用作加载音乐读取时间
var mouseDown = false;              //存放当前鼠标按下状态

var dictorySelecter = document.querySelector('.dictorySelecter');//选择音乐路径控件
var fileList = document.querySelector('#fileListTable');//获取音乐播放器列表容器
var musicPlayer = document.querySelector('.musicPlayer');//播放器主体
var processor = document.querySelector('.processor');//红色进度条
var slider = document.querySelector('.slider');//播放器的滑块控制系统
var volumeButton = document.querySelector('.volumeButton');//声音控制按钮
var mousePosition = document.querySelector('#mousePosition');//跟随鼠标文本
var buffer = document.querySelector('.buffer');//缓冲器，暂无用途
var controller = document.querySelector('.controller');//播放器滑块控制器
var playButton = document.querySelector('.playButton');//播放器播放按钮
var musicTimer = document.querySelector('.musicTimer');//播放器当前时间显示

dictorySelecter.addEventListener('change', folderSelectedHandler, false);
musicPlayer.addEventListener('pause', setPlayButtonToPlayHandler);
musicPlayer.addEventListener('play', setPlayButtonToPauseHandler);
musicPlayer.addEventListener('ended', resetPlayerAndRandomPlayNextMusicHandler);
playButton.addEventListener('pointerup', musicPlayAndPauseChangeHandler);
controller.addEventListener('mousedown', dragDropHandler);
window.addEventListener('mousemove', dragDropHandler);
window.addEventListener('mouseup', dragDropHandler);

/**
 * 设置播放按钮到播放状态
 */
function setPlayButtonToPlayHandler() {
  playButton.setAttribute('src', './res/flatLight14.png');
}
/**
 * 设置播放器按钮到暂停状态
 */
function setPlayButtonToPauseHandler() {
  playButton.setAttribute('src', './res/flatLight12.png');
}
/**
 * 重置播放器状态并继续随机播放下一首
 */
function resetPlayerAndRandomPlayNextMusicHandler() {
  controller.style.left = -13 + 'px';
  processor.style.width = 0 + 'px';
  resetMusicTimer();
  musicPlayer.setAttribute('src', musicSrcArry[parseInt(Math.random() * musicSrcArry.length, 10)]);
  musicPlayer.play();
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
function chekMusicFile(fileName) {
  musicFileType = ['mp3','flac','wav','wma'];
}
/**
 * 根据文件列表创建音乐文件列表并添加鼠标双击事件
 * @param {FileList} floder 
 */
function addMusicFiles(floder) {
  fs.readdir(floder[0].path, function (err, fsFiles) {
    fileList.innerHTML = '';
        var files = [];
    for(i in fsFiles){
      if(fs.statSync(floder[0].path + '/' + fsFiles[i]).isFile() && fsFiles[i]){
        files.push(fsFiles[i]);
      }
    }
    console.log(files);
    for (var i = 0; i < files.length; i++) {
      var files_tr = document.createElement('tr');

      fileList.appendChild(files_tr);
      files_tr.innerHTML = `
                          <td class="col0"></td>
                          <td class="col1">` + files[i] + `</td>
                          <td class="col2">` + '???' + `</td>
                          <td class="col3">` + fileinfo(floder[0].path + '/' + files[i]) + `</td>
                          `;
      musicSrcArry.push(floder[0].path + '/' + files[i]);
      var tempAudioElement = document.createElement('audio');
      tempAudioElement.setAttribute('src', floder[0].path + '/' + files[i]);
      tempAudioElement.play();
      tempAudioElement.volume = 0;
      document.body.appendChild(tempAudioElement);
      musicEleArry.push(tempAudioElement);
      durEleArry.push(files_tr.getElementsByClassName('col2')[0]);
      files_tr.addEventListener('dblclick', function () {
        musicPlayer.setAttribute('src', floder[0].path + '/' + this.getElementsByClassName('col1')[0].innerText);
        musicPlayer.play();
        createInterval();
      })
    }
    setTimeout(function () {
      for (index in musicEleArry) {
        durEleArry[index].innerText = secToTimeFormat(musicEleArry[index].duration);
        musicEleArry[index].parentElement.removeChild(musicEleArry[index]);
      }
    }, 2000);
  })
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

var step = 0.05;
var timer = window.setInterval(function () {
  var sw = slider.offsetWidth;
  var w = buffer.offsetWidth;
  buffer.style.width = w + sw * step + 'px';
  if (w + sw * step >= sw) {
    buffer.style.width = sw + 'px';
    window.clearInterval(timer);
  }
}, 100);

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
        mousePosition.style.top = event.clientY + 15 + 'px';
        mousePosition.style.left = event.clientX + 5 + 'px';
        mousePosition.innerText = '(' + event.clientX + ',' + event.clientY + ')';
        if (mouseDown) {
          var halfW = controller.offsetWidth >> 1;
          var offectX = controller.parentElement.offsetWidth * 0.2 - halfW + 88;
          if (event.movementX + controller.offsetLeft <= slider.offsetWidth - halfW && event.movementX + controller.offsetLeft >= 0 - halfW) {
            controller.style.left = event.movementX + controller.offsetLeft + 'px';
            processor.style.width = event.movementX + processor.offsetWidth + 'px';
            musicTimer.innerText = secToTimeFormat(getControllerOffsetPersentPosition() * musicPlayer.duration) + '/' + secToTimeFormat(musicPlayer.duration);
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
/**
 * 返回当前控制器的百分比位置
 */
function getControllerOffsetPersentPosition() {
  return (controller.offsetLeft + controller.offsetWidth / 2) / slider.offsetWidth;
}
