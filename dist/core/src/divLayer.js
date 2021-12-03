var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Store } from 'le5le-store';
import { Lock } from './models/status';
import { images, PenType } from './models/pen';
import { Layer } from './layer';
import { find } from './utils';
var videos = {};
var DivLayer = /** @class */ (function (_super) {
    __extends(DivLayer, _super);
    function DivLayer(parentElem, options, TID) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, TID) || this;
        _this.parentElem = parentElem;
        _this.options = options;
        _this.canvas = document.createElement('div');
        _this.player = document.createElement('div');
        _this.audios = {};
        _this.iframes = {};
        _this.elements = {};
        _this.gifs = {};
        _this.addDiv = function (node) {
            if (node.audio) {
                if (_this.audios[node.id] && _this.audios[node.id].media.src !== node.audio) {
                    _this.audios[node.id].media.src = node.audio;
                }
                setTimeout(function () {
                    _this.setElemPosition(node, (_this.audios[node.id] && _this.audios[node.id].player) || _this.addMedia(node, 'audio'));
                });
            }
            if (node.video) {
                if (videos[node.id] && videos[node.id].media.src !== node.video) {
                    videos[node.id].media.src = node.video;
                }
                setTimeout(function () {
                    _this.setElemPosition(node, (videos[node.id] && videos[node.id].player) || _this.addMedia(node, 'video'));
                });
            }
            if (node.iframe) {
                if (!_this.iframes[node.id]) {
                    _this.addIframe(node);
                    setTimeout(function () {
                        _this.addDiv(node);
                    });
                }
                else {
                    if (_this.iframes[node.id].src !== node.iframe) {
                        _this.iframes[node.id].src = node.iframe;
                    }
                    _this.setElemPosition(node, _this.iframes[node.id]);
                }
            }
            if (node.elementId) {
                if (!_this.elements[node.id]) {
                    _this.elements[node.id] = document.getElementById(node.elementId);
                    if (_this.elements[node.id]) {
                        _this.canvas.appendChild(_this.elements[node.id]);
                    }
                }
                _this.setElemPosition(node, _this.elements[node.id]);
            }
            if (node.gif) {
                if (node.image.indexOf('.gif') < 0) {
                    node.gif = false;
                    _this.canvas.removeChild(_this.gifs[node.id]);
                    _this.gifs[node.id] = undefined;
                }
                else if (node.img) {
                    if (_this.gifs[node.id] && _this.gifs[node.id].src !== node.image) {
                        _this.gifs[node.id].src = node.image;
                    }
                    _this.setElemPosition(node, _this.gifs[node.id] || _this.addGif(node));
                }
            }
            if (node.children) {
                for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    if (child.type === PenType.Line) {
                        continue;
                    }
                    _this.addDiv(child);
                }
            }
        };
        _this.createPlayer = function () {
            _this.player.style.position = 'fixed';
            _this.player.style.outline = 'none';
            _this.player.style.top = '-99999px';
            _this.player.style.height = '40px';
            _this.player.style.padding = '10px 15px';
            _this.player.style.background = 'rgba(200,200,200,.1)';
            _this.player.style.display = 'flex';
            _this.player.style.alignItems = 'center';
            _this.player.style.userSelect = 'initial';
            _this.player.style.pointerEvents = 'initial';
            _this.player.style.zIndex = '1';
            _this.playBtn = document.createElement('i');
            _this.currentTime = document.createElement('span');
            _this.progress = document.createElement('div');
            _this.progressCurrent = document.createElement('div');
            _this.loop = document.createElement('i');
            var fullScreen = document.createElement('i');
            _this.playBtn.className = _this.options.playIcon;
            _this.playBtn.style.fontSize = '18px';
            _this.playBtn.style.lineHeight = '20px';
            _this.playBtn.style.cursor = 'pointer';
            _this.currentTime.style.padding = '0 10px';
            _this.currentTime.innerText = '0 / 0';
            _this.progress.style.position = 'relative';
            _this.progress.style.flexGrow = '1';
            _this.progress.style.top = '0';
            _this.progress.style.height = '4px';
            _this.progress.style.background = '#ccc';
            _this.progress.style.borderRadius = '2px';
            _this.progress.style.overflow = 'hidden';
            _this.progress.style.cursor = 'pointer';
            _this.progressCurrent.style.position = 'absolute';
            _this.progressCurrent.style.left = '0';
            _this.progressCurrent.style.top = '0';
            _this.progressCurrent.style.bottom = '0';
            _this.progressCurrent.style.width = '0';
            _this.progressCurrent.style.background = '#52c41a';
            _this.loop.style.margin = '0 10px';
            _this.loop.style.padding = '2px 5px';
            _this.loop.style.borderRadius = '2px';
            _this.loop.className = _this.options.loopIcon;
            _this.loop.style.fontSize = '18px';
            _this.loop.style.lineHeight = '20px';
            _this.loop.style.cursor = 'pointer';
            fullScreen.className = _this.options.fullScreenIcon;
            fullScreen.style.fontSize = '17px';
            fullScreen.style.lineHeight = '20px';
            fullScreen.style.cursor = 'pointer';
            _this.player.appendChild(_this.playBtn);
            _this.player.appendChild(_this.currentTime);
            _this.player.appendChild(_this.progress);
            _this.progress.appendChild(_this.progressCurrent);
            _this.player.appendChild(_this.loop);
            _this.player.appendChild(fullScreen);
            _this.playBtn.onclick = function () {
                if (_this.media.paused) {
                    _this.media.play();
                    _this.playBtn.className = _this.options.pauseIcon;
                }
                else {
                    _this.media.pause();
                    _this.playBtn.className = _this.options.playIcon;
                }
            };
            _this.progress.onclick = function (e) {
                _this.media.currentTime = (e.offsetX / _this.progress.clientWidth) * _this.media.duration;
            };
            _this.loop.onclick = function () {
                _this.media.loop = !_this.media.loop;
                _this.curNode.playLoop = _this.media.loop;
                if (_this.media.loop) {
                    _this.loop.style.background = '#ddd';
                }
                else {
                    _this.loop.style.background = 'none';
                }
            };
            fullScreen.onclick = function () {
                _this.media.requestFullscreen();
            };
        };
        _this.getMediaCurrent = function () {
            if (!_this.media) {
                return;
            }
            _this.currentTime.innerText =
                _this.formatSeconds(_this.media.currentTime) + ' / ' + _this.formatSeconds(_this.media.duration);
            _this.progressCurrent.style.width =
                (_this.media.currentTime / _this.media.duration) * _this.progress.clientWidth + 'px';
        };
        _this.addMedia = function (node, type) {
            var player = document.createElement('div');
            var current = document.createElement('div');
            var media = document.createElement(type);
            player.id = node.id;
            current.style.position = 'absolute';
            current.style.outline = 'none';
            current.style.left = '0';
            current.style.bottom = '0';
            current.style.height = '2px';
            current.style.background = '#52c41a';
            media.style.position = 'absolute';
            media.style.outline = 'none';
            media.style.left = '0';
            media.style.right = '0';
            media.style.top = '0';
            media.style.bottom = '0';
            if (type === 'video') {
                media.style.width = node.rect.width + 'px';
                media.style.height = node.rect.height + 'px';
            }
            player.style.background = 'transparent';
            if (node.playType === 1) {
                media.autoplay = true;
            }
            media.loop = node.playLoop;
            media.ontimeupdate = function () {
                current.style.width = (media.currentTime / media.duration) * node.rect.width + 'px';
                _this.getMediaCurrent();
                if (_this.media === media) {
                    if (node.playLoop) {
                        media.loop = true;
                        _this.loop.style.background = '#ddd';
                    }
                    else {
                        media.loop = false;
                        _this.loop.style.background = 'none';
                    }
                }
            };
            media.onended = function () {
                Store.set(_this.generateStoreKey('mediaEnd'), node);
                if (_this.media === media) {
                    _this.playBtn.className = _this.options.playIcon;
                }
                _this.play(node.nextPlay);
            };
            media.onloadedmetadata = function () {
                _this.getMediaCurrent();
            };
            media.src = node[type];
            player.appendChild(media);
            player.appendChild(current);
            if (type === 'video') {
                videos[node.id] = {
                    player: player,
                    current: current,
                    media: media,
                };
            }
            else {
                _this.audios[node.id] = {
                    player: player,
                    current: current,
                    media: media,
                };
            }
            _this.canvas.appendChild(player);
            return player;
        };
        _this.setElemPosition = function (node, elem) {
            if (!elem) {
                return;
            }
            elem.style.position = 'absolute';
            elem.style.outline = 'none';
            elem.style.left = node.rect.x + _this.data.x + 'px';
            elem.style.top = node.rect.y + _this.data.y + 'px';
            elem.style.width = node.rect.width + 'px';
            elem.style.height = node.rect.height + 'px';
            elem.style.display = node.visible ? 'inline' : 'none'; // 是否隐藏元素
            if (node.rotate || node.offsetRotate) {
                elem.style.transform = "rotate(".concat(node.rotate + node.offsetRotate, "deg)");
            }
            if (node.video && videos[node.id] && videos[node.id].media) {
                videos[node.id].media.style.width = '100%';
                videos[node.id].media.style.height = '100%';
            }
            if (_this.data.locked > Lock.None || node.locked > Lock.None) {
                elem.style.userSelect = 'initial';
                elem.style.pointerEvents = 'initial';
            }
            else {
                elem.style.userSelect = 'none';
                elem.style.pointerEvents = 'none';
            }
        };
        _this.removeDiv = function (item) {
            if (_this.curNode && item.id === _this.curNode.id) {
                _this.curNode = undefined;
                _this.media = undefined;
                _this.player.style.top = '-99999px';
            }
            if (item.audio) {
                _this.canvas.removeChild(_this.audios[item.id].player);
                _this.audios[item.id] = undefined;
            }
            if (item.video) {
                _this.canvas.removeChild(videos[item.id].player);
                videos[item.id] = undefined;
            }
            if (item.iframe) {
                _this.canvas.removeChild(_this.iframes[item.id]);
                _this.iframes[item.id] = undefined;
            }
            if (item.elementId) {
                _this.canvas.removeChild(_this.elements[item.id]);
                _this.elements[item.id] = undefined;
                item.elementId = '';
            }
            if (item.gif) {
                _this.canvas.removeChild(_this.gifs[item.id]);
                _this.gifs[item.id] = undefined;
            }
            if (item.children) {
                for (var _i = 0, _a = item.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    if (child.type === PenType.Line) {
                        continue;
                    }
                    _this.removeDiv(child);
                }
            }
        };
        if (!_this.options.playIcon) {
            _this.options.playIcon = 't-icon t-play';
        }
        if (!_this.options.pauseIcon) {
            _this.options.pauseIcon = 't-icon t-pause';
        }
        if (!_this.options.fullScreenIcon) {
            _this.options.fullScreenIcon = 't-icon t-full-screen';
        }
        if (!_this.options.loopIcon) {
            _this.options.loopIcon = 't-icon t-loop';
        }
        _this.canvas.style.position = 'absolute';
        _this.canvas.style.left = '0';
        _this.canvas.style.top = '0';
        _this.canvas.style.outline = 'none';
        _this.canvas.style.background = 'transparent';
        parentElem.appendChild(_this.canvas);
        parentElem.appendChild(_this.player);
        _this.createPlayer();
        _this.subcribeDiv = Store.subscribe(_this.generateStoreKey('LT:addDiv'), _this.addDiv);
        _this.subcribeDiv = Store.subscribe(_this.generateStoreKey('LT:removeDiv'), _this.removeDiv);
        _this.subcribePlay = Store.subscribe(_this.generateStoreKey('LT:play'), function (e) {
            _this.playOne(e.pen, e.pause);
        });
        _this.subcribeNode = Store.subscribe(_this.generateStoreKey('LT:activeNode'), function (node) {
            if (!node || (!node.video && !node.audio)) {
                _this.player.style.top = '-99999px';
                return;
            }
            if (node.audio && _this.audios[node.id]) {
                _this.media = _this.audios[node.id].media;
            }
            else if (node.video && videos[node.id]) {
                _this.media = videos[node.id].media;
            }
            else {
                return;
            }
            _this.curNode = node;
            var rect = _this.parentElem.getBoundingClientRect();
            _this.player.style.top = rect.top + _this.parentElem.clientHeight - 40 + 'px';
            _this.player.style.left = rect.left + 'px';
            _this.player.style.width = _this.parentElem.clientWidth + 'px';
            _this.getMediaCurrent();
            if (_this.media.paused) {
                _this.playBtn.className = _this.options.playIcon;
            }
            else {
                _this.playBtn.className = _this.options.pauseIcon;
            }
        });
        document.addEventListener('fullscreenchange', function (e) {
            if (!_this.media) {
                return;
            }
            if (document.fullscreen) {
                _this.media.controls = true;
                _this.media.style.userSelect = 'initial';
                _this.media.style.pointerEvents = 'initial';
            }
            else {
                _this.media.style.userSelect = 'none';
                _this.media.style.pointerEvents = 'none';
                _this.media.controls = false;
            }
        });
        return _this;
    }
    DivLayer.prototype.play = function (idOrTag, pause) {
        var _this = this;
        if (!idOrTag) {
            return;
        }
        var pens = find(idOrTag, this.data.pens);
        pens.forEach(function (item) {
            _this.playOne(item, pause);
        });
    };
    DivLayer.prototype.playOne = function (item, pause) {
        if (item.audio && this.audios[item.id] && this.audios[item.id].media) {
            if (pause) {
                this.audios[item.id].media.pause();
            }
            else if (this.audios[item.id].media.paused) {
                this.audios[item.id].media.play();
            }
        }
        else if (item.video && videos[item.id].media) {
            if (pause) {
                videos[item.id].media.pause();
            }
            else if (videos[item.id].media.paused) {
                videos[item.id].media.play();
            }
        }
    };
    DivLayer.prototype.addIframe = function (node) {
        var iframe = document.createElement('iframe');
        iframe.scrolling = 'no';
        iframe.frameBorder = '0';
        iframe.src = node.iframe;
        this.iframes[node.id] = iframe;
        this.canvas.appendChild(iframe);
        return iframe;
    };
    DivLayer.prototype.addGif = function (node) {
        this.gifs[node.id] = node.img;
        this.canvas.appendChild(node.img);
        return node.img;
    };
    DivLayer.prototype.clear = function (shallow) {
        this.canvas.innerHTML = '';
        this.audios = {};
        videos = {};
        this.iframes = {};
        this.elements = {};
        this.gifs = {};
        if (!shallow) {
            // tslint:disable-next-line:forin
            for (var key in images) {
                delete images[key];
            }
        }
        this.player.style.top = '-99999px';
    };
    DivLayer.prototype.formatSeconds = function (seconds) {
        var h = Math.floor(seconds / 3600);
        var m = Math.floor(seconds / 60) % 60;
        var s = Math.floor(seconds % 60);
        var txt = s + '';
        if (m) {
            txt = m + ':' + s;
        }
        else {
            txt = '0:' + s;
        }
        if (h) {
            txt = h + ':' + m + ':' + s;
        }
        return txt;
    };
    DivLayer.prototype.resize = function (size) {
        if (size) {
            this.canvas.style.width = size.width + 'px';
            this.canvas.style.height = size.height + 'px';
        }
        else {
            if (this.options.width && this.options.width !== 'auto') {
                this.canvas.style.width = this.options.width + 'px';
            }
            else {
                this.canvas.style.width = this.parentElem.clientWidth + 'px';
            }
            if (this.options.height && this.options.height !== 'auto') {
                this.canvas.style.height = this.options.height + 'px';
            }
            else {
                this.canvas.style.height = this.parentElem.clientHeight - 8 + 'px';
            }
        }
    };
    DivLayer.prototype.render = function () {
        for (var _i = 0, _a = this.data.pens; _i < _a.length; _i++) {
            var item = _a[_i];
            if (!item.getTID()) {
                item.setTID(this.TID);
            }
            this.addDiv(item);
        }
    };
    DivLayer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.clear();
        this.subcribeDiv.unsubscribe();
        this.subcribeNode.unsubscribe();
        this.subcribePlay.unsubscribe();
    };
    return DivLayer;
}(Layer));
export { DivLayer };
//# sourceMappingURL=divLayer.js.map