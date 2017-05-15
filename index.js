// const {shell} = require('electron')
// console.log( )
var input_ele = document.getElementById('url_input');
console.log(input_ele);

var url_button = document.getElementById('url_button');
url_button.addEventListener('click', function () { checkUrl(input_ele.value) });

function checkUrl(url) {
    var url1 = String(url);
    console.log(url1);
    if (url1.match(/^\\\\\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) != null) {
        // shell.showItemInFolder('\\10.10.20.42\share')
    }
}
//本地文件写入
var path = require('path');
var _path = path.join(__dirname, '.', '/Musics');
// var path1 = "d:\\ProjectsSpace\\ElectronProjects\\ElectronTest2\\app\\html\\config\\record.txt";
// console.log(_path);//测试路径对不对的
var fs = require('fs');
// fs.readFile(_path, 'utf8', function (err, data) {
// if (err) return console.log(err);
// });

// fs.writeFile(_path, "electron + Javascript", function (err) {
// if (!err)
//     console.log("写入成功！")
// })

fs.readdir(_path, function (err, files) {
    console.log(files)
    var audio = document.getElementById('audio_source');
    for (var i = 0; i < files.length; i++) {
        audio.setAttribute('src', _path + '/' + files[0])
        mySound = new Audio(_path + '\\' + files[i]);
        mySound.controls = true
        mySound.preload = 'meta'
        document.body.appendChild(mySound)
        console.log(mySound.du)
        // mySound.onload = function(){
        //     console.log(this.duration)
        // }
        var fileList = document.querySelector('#fileListTable');
        var files_tr = document.createElement('tr')
        // var files_td = document.createElement('td')
        files_tr.innerHTML =    `
                                <td class="col0">
                                    <image src="./res/pause.png" size="0.3"></image>
                                </td>
                                <td class="col1">`+files[i]+`</td>
                                <td class="col2">`+'123'+`</td>
                                <td class="col3">`+fileinfo(_path + '/' + files[i])+`</td>
                                `
        files_tr.addEventListener('dblclick',function(){console.log(files_tr.getElementsByClassName('col1').innerHTML);;})
        fileList.appendChild(files_tr)
    }
    // if (err) {  
    //     console.log('read dir error');  
    // } else {  
    //     files.forEach(function(item) {  
    //         console.log(item);
    //     });
    // }
})
function fileinfo(dir_str){
    return (fs.statSync(dir_str).size/1024/1024).toFixed(2).toString()+"M"
}