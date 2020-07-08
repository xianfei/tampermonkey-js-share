// ==UserScript==
// @name         Bupt WebVPN Optimization
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  for automatically input uid and pwd（请在浏览器中取消对webvpn.bupt.edu.cn的密码自动填充）
// @author       Xianfei
// @match        https://webvpn.bupt.edu.cn/*
// @grant        none
// ==/UserScript==

// 你的教务系统学号和密码
var jwglID = '替换为你的学号';
var jwglPwd = '替换为你的教务系统密码';

// 你的信息门户（包括任何通过auth.bupt.edu.cn认证的网站）学号和密码
var authID = jwglID;
var authPwd = '替换为你的信息门户密码';

// 你的WebVPN密码（连接校园网密码）
var webVpnID = jwglID;
var webVpnPwd = '替换为你的校园网密码';

// 自动填充延时(或频率) 如果与浏览器自动填充有冲突请更改此项
var fillDelay = 100;

// 使用循环填充代替仅填充一次 如果与浏览器自动填充有冲突请更改此项
var loopFill = false;

// 下方为程序代码(看不懂的话就不要动啦~)
(function () {
    'use strict';

    // for webvpn login
    if (window.location.pathname == "/login") {
        if (loopFill) {
            setInterval(() => {
                document.getElementById('user_name').value = webVpnID
                document.getElementsByName("password")[0].value = webVpnPwd
            }, fillDelay);
        } else {
            setTimeout(() => {
                document.getElementById('user_name').value = webVpnID
                document.getElementsByName("password")[0].value = webVpnPwd
            }, fillDelay);
        }
    }

    // for jwgl login
    if (window.location.pathname.indexOf('jsxsd') != -1 && document.title.indexOf("登录") != -1) {
        if (loopFill) {
            setInterval(() => {
                document.getElementById('userAccount').value = jwglID
                document.getElementById('userPassword').value = jwglPwd
            }, fillDelay);
        } else {
            setTimeout(() => {
                document.getElementById('userAccount').value = jwglID
                document.getElementById('userPassword').value = jwglPwd
            }, fillDelay);
        }
    }

    // for auth system login
    if (document.title.indexOf("统一身份认证") != -1) {
        if (loopFill) {
            setInterval(() => {
                document.getElementById('username').value = authID
                document.getElementById('password').value = authPwd
            }, fillDelay);
        } else {
            setTimeout(() => {
                document.getElementById('username').value = authID
                document.getElementById('password').value = authPwd
            }, fillDelay);
        }
    }

    // for main page (add link for jwgl.bupt.edu.cn/jsxsd)
    if (window.location.pathname == "/") {
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
        var jwUrl = encrypUrl("http", "jwgl.bupt.edu.cn/jsxsd");
        $('#group-1').append("<div onclick=\"window.location.href='" + jwUrl + "'\"  class=\"layui-col-xs12 layui-col-sm6 layui-col-md4 layui-col-lg3\" style=\"padding: 10px 10px 10px 0px;\">\n                                    <div class=\"vpn-content-block-panel\"\n                                        data-url=" + jwUrl + "\n                                        data-search=\"新教务系统_my.bupt.edu.cn\"\n                                        data-type=\"vpn\"\n                                        title=\"新教务系统\"\n                                    >\n                                        <div class=\"vpn-content-block-panel__image\">\n                                            \n                                                <div>\n                                                    <span>教</span>\n                                                </div>\n                                            \n                                        </div>\n                                        \n                                        <div class=\"vpn-content-block-panel__content\">\n                                            <p>新教务系统</p>\n                                            <p class=\"vpn-content-block-panel__url\">jwgl.bupt.edu.cn/jsxsd</p>\n                                        </div>\n                                        \n                                    </div>\n                                </div>")
    }

})();