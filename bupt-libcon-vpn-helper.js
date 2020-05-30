// ==UserScript==
// @name        自动跳转bupt-libcon-vpn
// @namespace   http://blog.icespite.top
// @include     *://*.cnki.*/*
// @include     *://wenku.baidu.com/*
// @grant       none
// @version     1.0
// @author      xianfei
// @description 暂添加知网和百度文库，其他链接可自行include。
// @require https://libcon.bupt.edu.cn/wengine-vpn/js/aes-js.js
// ==/UserScript==
var utf8 = aesjs.utils.utf8;
var hex = aesjs.utils.hex
var AesCfb = aesjs.ModeOfOperation.cfb
var textRightAppend = function (text, mode) {
    var segmentByteSize = mode === 'utf8' ? 16 : 32
    if (text.length % segmentByteSize === 0) {
        return text
    }
    var appendLength = segmentByteSize - text.length % segmentByteSize
    var i = 0
    while (i++ < appendLength) {
        text += '0'
    }
    return text
}
var encrypt = function (text, key, iv) {
    var textLength = text.length
    text = textRightAppend(text, 'utf8')
    var keyBytes = utf8.toBytes(key)
    var ivBytes = utf8.toBytes(iv)
    var textBytes = utf8.toBytes(text)
    var aesCfb = new AesCfb(keyBytes, ivBytes, 16)
    var encryptBytes = aesCfb.encrypt(textBytes)
    return hex.fromBytes(ivBytes) + hex.fromBytes(encryptBytes).slice(0, textLength * 2)
}
var decrypt = function (text, key) {
    var textLength = (text.length - 32) / 2
    text = textRightAppend(text, 'hex')
    var keyBytes = utf8.toBytes(key)
    var ivBytes = hex.toBytes(text.slice(0, 32))
    var textBytes = hex.toBytes(text.slice(32))
    var aesCfb = new AesCfb(keyBytes, ivBytes, 16)
    var decryptBytes = aesCfb.decrypt(textBytes)
    return utf8.fromBytes(decryptBytes).slice(0, textLength)
}
function encrypUrl(protocol, url) {
    var port = "";
    var segments = "";
    if (url.substring(0, 7) == "http://") {
        url = url.substr(7);
    } else if (url.substring(0, 8) == "https://") {
        url = url.substr(8);
    }
    var v6 = "";
    var match = /\[[0-9a-fA-F:]+?\]/.exec(url);
    if (match) {
        v6 = match[0];
        url = url.slice(match[0].length);
    }
    segments = url.split("?")[0].split(":");
    if (segments.length > 1) {
        port = segments[1].split("/")[0]
        url = url.substr(0, segments[0].length) + url.substr(segments[0].length + port.length + 1);
    }

    if (protocol != "connection") {
        var i = url.indexOf('/');
        if (i == -1) {
            if (v6 != "") {
                url = v6;
            }
            url = encrypt(url, "wrdvpnisthebest!", 'wrdvpnisthebest!')
        } else {
            var host = url.slice(0, i);
            var path = url.slice(i);
            if (v6 != "") {
                host = v6;
            }
            url = encrypt(host, "wrdvpnisthebest!", 'wrdvpnisthebest!') + path;
        }
    }
    if (port != "") {
        url = "/" + protocol + "-" + port + "/" + url;
    } else {
        url = "/" + protocol + "/" + url;
    }
    return url;
}
function add_record(url) {
    if (url.indexOf("wrdrecordvisit") == -1) {
        if (url.indexOf("?") != -1) {
            url = url + "&wrdrecordvisit=record"
        } else {
            url = url + "?wrdrecordvisit=record"
        }
    }
    return url;
}
function go() {
    var protocol = "http";
    var url = window.location.href;
    if (protocol == "http" || protocol == "https") {

        if (url.indexOf(".") == -1) {
            url = "www.baidu.com/s?wd=" + url;
        }
    }
    url = encrypUrl(protocol, url)
    if (protocol == "http" || protocol == "https") {
        url = add_record(url)
    }
    return url
}
(function () {
    var a = document.createElement("tbody");
    a.innerHTML += "<p id ='newone'>bupt-libcon-vpn点击跳转</p>";
    document.getElementsByTagName("body")[0].appendChild(a);
    $("#newone").css({
        "position": "fixed",
        "background": "rgb(19, 167, 19)",
        "background-color": "#1E90FF",
        "width": "60px",
        "text-align": "center",
        "height": "50px",
        "box-shadow": "5px 5px 10px rgba(0, 0, 0, 0.2)",
        "transition": "all 0.08s",
        "user-select": "none",
        "top": "50%",
        "left": "25px",
        "transform": "translate3d(-50%, -50%, 0)"
    });
    $("#newone").click(function () {
        console.log(go())
        window.location.href = 'https://libcon.bupt.edu.cn' + go();
    });
})()
