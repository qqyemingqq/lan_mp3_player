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
    audio.setAttribute('src', _path + '/' + files[0])
    fs.stat(_path + '/' + files[0], function (err, stat) {
        console.log(stat);
    });
    // if (err) {  
    //     console.log('read dir error');  
    // } else {  
    //     files.forEach(function(item) {  
    //         console.log(item);
    //     });
    // }
})

