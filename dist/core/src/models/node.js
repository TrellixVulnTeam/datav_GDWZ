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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { images, Pen, PenType } from './pen';
import { Line } from './line';
import { Rect } from './rect';
import { Point } from './point';
import { anchorsFns, iconRectFns, textRectFns, drawNodeFns } from '../middles';
import { defaultAnchors } from '../middles/default.anchor';
import { defaultIconRect, defaultTextRect } from '../middles/default.rect';
import { text, iconfont } from '../middles/nodes/text';
import { Store } from 'le5le-store';
import { abs, distance } from '../utils/math';
import { pointInRect } from '../utils/canvas';
import { Direction } from './direction';
// 动画帧不涉及的属性
var animateOutsides = [
    'TID',
    'events',
    'wheres',
    'text',
    'fontFamily',
    'fontSize',
    'lineHeight',
    'fontStyle',
    'fontWeight',
    'textAlign',
    'textBaseline',
    'textBackground',
    'iconFamily',
    'icon',
    'iconSize',
];
var Node = /** @class */ (function (_super) {
    __extends(Node, _super);
    function Node(json, cloneState) {
        var _this = _super.call(this) || this;
        _this.imageRatio = true;
        _this.points = [];
        _this.anchors = [];
        _this.manualAnchors = [];
        _this.rotatedAnchors = [];
        _this.animateDuration = 0;
        _this.animateFrames = [];
        _this.animateFrame = 0;
        var defaultData = {
            zRotate: 0,
            borderRadius: 0,
            imageAlign: 'center',
            gradientAngle: 0,
            gradientRadius: 0.01,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            animateFrame: 0,
            children: [],
        };
        _this.fromData(defaultData, json);
        _this.type = PenType.Node;
        if (!cloneState) {
            delete _this.elementLoaded;
            delete _this.elementRendered;
        }
        delete _this.animateReady;
        // 兼容老数据
        if (json.children && json.children[0] && json.children[0].parentRect) {
            _this.paddingLeft = json.children[0].parentRect.offsetX;
            _this.paddingRight = 0;
            _this.paddingTop = json.children[0].parentRect.offsetY;
            _this.paddingBottom = 0;
        }
        if (json.parentRect) {
            _this.rectInParent = {
                x: json.parentRect.x * 100 + '%',
                y: json.parentRect.y * 100 + '%',
                width: json.parentRect.width * 100 + '%',
                height: json.parentRect.height * 100 + '%',
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0,
                rotate: json.parentRect.rotate,
            };
            _this.paddingTop = json.parentRect.marginY;
            _this.paddingBottom = json.parentRect.marginY;
            _this.paddingLeft = json.parentRect.marginX;
            _this.paddingRight = json.parentRect.marginX;
        }
        // 兼容老数据 end
        if (json.points) {
            _this.points = [];
            json.points.forEach(function (pt) {
                _this.points.push(new Point(pt.x, pt.y));
            });
        }
        if (json.manualAnchors) {
            _this.manualAnchors = [];
            json.manualAnchors.forEach(function (pt) {
                var point = new Point(pt.x, pt.y);
                point.id = json.id;
                _this.manualAnchors.push(point);
            });
        }
        if (cloneState) {
            _this.animateFrames = undefined;
        }
        if (!cloneState && json.animateFrames && json.animateFrames.length) {
            for (var _i = 0, _a = json.animateFrames; _i < _a.length; _i++) {
                var item = _a[_i];
                item.children = undefined;
                if (item.initState) {
                    item.initState = Node.cloneState(item.initState);
                }
                item.state = Node.cloneState(item.state);
            }
            _this.animateFrames = json.animateFrames;
        }
        _this.animateType = json.animateType
            ? json.animateType
            : json.animateDuration
                ? 'custom'
                : '';
        _this.init(cloneState);
        if (json.init && json.img && !json.image) {
            _this.img = json.img;
        }
        if (json.children) {
            _this.children = [];
            json.children.forEach(function (item) {
                var child;
                item.TID = _this.TID;
                switch (item.type) {
                    case PenType.Line:
                        child = new Line(item);
                        child.calcRectByParent(_this);
                        break;
                    default:
                        Node.prototype.calcRectByParent.apply(item, [_this]);
                        child = new Node(item);
                        child.parentId = _this.id;
                        child.init(cloneState);
                        break;
                }
                _this.children.push(child);
            });
        }
        return _this;
    }
    Object.defineProperty(Node.prototype, "dockWatchers", {
        // nodes移动时，停靠点的参考位置
        // dockWatchers: Point[];
        get: function () {
            return __spreadArray([this.rect.center], this.rect.toPoints(), true);
        },
        // 不做任何处理，兼容以前版本中节点属性存在该值的
        set: function (v) {
        },
        enumerable: false,
        configurable: true
    });
    Node.cloneState = function (json) {
        var n = new Node(json, true);
        animateOutsides.forEach(function (item) {
            delete n[item];
        });
        return n;
    };
    Node.prototype.restore = function (state) {
        if (!state && this.animateReady) {
            state = Node.cloneState(this.animateReady);
        }
        if (!state) {
            return;
        }
        for (var key in this) {
            if (state[key] !== undefined &&
                key.indexOf('animate') < 0 &&
                key.indexOf('Animate') < 0) {
                if (animateOutsides.includes(key)) {
                    continue;
                }
                this[key] = state[key];
                if (key === 'rect') {
                    this.rect = new Rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
                }
            }
        }
        this.init(true);
    };
    Node.prototype.checkData = function () {
        this.rect.width = this.rect.width < 0 ? 0 : this.rect.width;
        this.rect.height = this.rect.height < 0 ? 0 : this.rect.height;
        if (!this.rect.calcCenter) {
            this.rect = new Rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        }
    };
    Node.prototype.init = function (cloneState) {
        this.checkData();
        this.calcAbsPadding();
        // Calc rect of text.
        if (textRectFns[this.name]) {
            textRectFns[this.name](this);
        }
        else {
            defaultTextRect(this);
        }
        // Calc rect of icon.
        if (iconRectFns[this.name]) {
            iconRectFns[this.name](this);
        }
        else {
            defaultIconRect(this);
        }
        this.calcAnchors();
        this.elementRendered = false;
        if (!cloneState) {
            this.addToDiv();
        }
    };
    Node.prototype.addToDiv = function () {
        if (this.audio || this.video || this.iframe || this.elementId || this.gif) {
            Store.set(this.generateStoreKey('LT:addDiv'), this);
        }
    };
    Node.prototype.removeFromDiv = function () {
        Store.set(this.generateStoreKey('LT:removeDiv'), this);
    };
    Node.prototype.hasGif = function () {
        if (this.gif) {
            return true;
        }
        if (this.children) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.type === PenType.Node &&
                    item.hasGif &&
                    item.hasGif()) {
                    return true;
                }
            }
        }
        return false;
    };
    Node.prototype.calcAbsPadding = function () {
        this.paddingLeftNum = abs(this.rect.width, this.paddingLeft);
        this.paddingRightNum = abs(this.rect.width, this.paddingRight);
        this.paddingTopNum = abs(this.rect.height, this.paddingTop);
        this.paddingBottomNum = abs(this.rect.height, this.paddingBottom);
    };
    // setChildrenIds() {
    //   if (!this.children) {
    //     return;
    //   }
    //   for (const item of this.children) {
    //     item.id = s8();
    //     switch (item.type) {
    //       case PenType.Node:
    //         (item as Node).setChildrenIds();
    //         break;
    //     }
    //   }
    // }
    Node.prototype.draw = function (ctx) {
        if (!drawNodeFns[this.name]) {
            return;
        }
        // DrawBk
        switch (this.bkType) {
            case 1:
                this.drawBkLinearGradient(ctx);
                break;
            case 2:
                this.drawBkRadialGradient(ctx);
                break;
        }
        switch (this.strokeType) {
            case 1:
                this.strokeLinearGradient(ctx);
                break;
        }
        // Draw shape.
        drawNodeFns[this.name](ctx, this);
        // Draw image.
        if (this.image || (this.img && this.elementId === '')) {
            this.drawImg(ctx);
        }
        else if (this.icon) {
            ctx.save();
            ctx.shadowColor = '';
            ctx.shadowBlur = 0;
            iconfont(ctx, this);
            ctx.restore();
        }
        // Draw text.
        if (this.name !== 'text' && this.text) {
            text(ctx, this);
        }
    };
    Node.prototype.strokeLinearGradient = function (ctx) {
        if (!this.lineGradientFromColor || !this.lineGradientToColor) {
            return;
        }
        var from = new Point(this.rect.x, this.rect.center.y);
        var to = new Point(this.rect.ex, this.rect.center.y);
        if (this.lineGradientAngle % 90 === 0 && this.lineGradientAngle % 180) {
            if (this.lineGradientAngle % 270) {
                from.x = this.rect.center.x;
                from.y = this.rect.y;
                to.x = this.rect.center.x;
                to.y = this.rect.ey;
            }
            else {
                from.x = this.rect.center.x;
                from.y = this.rect.ey;
                to.x = this.rect.center.x;
                to.y = this.rect.y;
            }
        }
        else if (this.lineGradientAngle) {
            from.rotate(this.lineGradientAngle, this.rect.center);
            to.rotate(this.lineGradientAngle, this.rect.center);
        }
        // contributor: https://github.com/sunnyguohua/topology
        var grd = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        grd.addColorStop(0, this.lineGradientFromColor);
        grd.addColorStop(1, this.lineGradientToColor);
        ctx.strokeStyle = grd;
    };
    Node.prototype.drawBkLinearGradient = function (ctx) {
        if (!this.gradientFromColor || !this.gradientToColor) {
            return;
        }
        var from = new Point(this.rect.x, this.rect.center.y);
        var to = new Point(this.rect.ex, this.rect.center.y);
        if (this.gradientAngle % 90 === 0 && this.gradientAngle % 180) {
            if (this.gradientAngle % 270) {
                from.x = this.rect.center.x;
                from.y = this.rect.y;
                to.x = this.rect.center.x;
                to.y = this.rect.ey;
            }
            else {
                from.x = this.rect.center.x;
                from.y = this.rect.ey;
                to.x = this.rect.center.x;
                to.y = this.rect.y;
            }
        }
        else if (this.gradientAngle) {
            from.rotate(this.gradientAngle, this.rect.center);
            to.rotate(this.gradientAngle, this.rect.center);
        }
        // contributor: https://github.com/sunnyguohua/topology
        var grd = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        grd.addColorStop(0, this.gradientFromColor);
        grd.addColorStop(1, this.gradientToColor);
        ctx.fillStyle = grd;
    };
    Node.prototype.drawBkRadialGradient = function (ctx) {
        if (!this.gradientFromColor || !this.gradientToColor) {
            return;
        }
        var r = this.rect.width;
        if (r < this.rect.height) {
            r = this.rect.height;
        }
        r *= 0.5;
        var grd = ctx.createRadialGradient(this.rect.center.x, this.rect.center.y, r * this.gradientRadius, this.rect.center.x, this.rect.center.y, r);
        grd.addColorStop(0, this.gradientFromColor);
        grd.addColorStop(1, this.gradientToColor);
        ctx.fillStyle = grd;
    };
    Node.prototype.drawImg = function (ctx) {
        var _this = this;
        if (this.lastImage !== this.image) {
            this.img = undefined;
            if (this.lastImage && this.lastImage.indexOf('.gif') > 0) {
                Store.set(this.generateStoreKey('LT:addDiv'), this);
            }
        }
        var gif = this.image && this.image.indexOf('.gif') > 0;
        if (!gif) {
            if (this.img) {
                ctx.save();
                ctx.shadowColor = '';
                ctx.shadowBlur = 0;
                var rect = this.getIconRect();
                var x = rect.x;
                var y = rect.y;
                var w = rect.width;
                var h = rect.height;
                if (this.imageWidth) {
                    w = this.imageWidth;
                }
                if (this.imageHeight) {
                    h = this.imageHeight;
                }
                if (this.imgNaturalWidth && this.imgNaturalHeight && this.imageRatio) {
                    if (this.imageWidth) {
                        h = (this.imgNaturalHeight / this.imgNaturalWidth) * w;
                    }
                    else {
                        w = (this.imgNaturalWidth / this.imgNaturalHeight) * h;
                    }
                }
                x += (rect.width - w) / 2;
                y += (rect.height - h) / 2;
                switch (this.imageAlign) {
                    case 'top':
                        y = rect.y;
                        break;
                    case 'bottom':
                        y = rect.ey - h;
                        break;
                    case 'left':
                        x = rect.x;
                        break;
                    case 'right':
                        x = rect.ex - w;
                        break;
                    case 'left-top':
                        x = rect.x;
                        y = rect.y;
                        break;
                    case 'right-top':
                        x = rect.ex - w;
                        y = rect.y;
                        break;
                    case 'left-bottom':
                        x = rect.x;
                        y = rect.ey - h;
                        break;
                    case 'right-bottom':
                        x = rect.ex - w;
                        y = rect.ey - h;
                        break;
                }
                if (this.iconRotate) {
                    ctx.translate(rect.center.x, rect.center.y);
                    ctx.rotate((this.iconRotate * Math.PI) / 180);
                    ctx.translate(-rect.center.x, -rect.center.y);
                }
                if (this.imageHide) {
                    //  在业务层面去自定义绘制图片
                }
                else {
                    ctx.drawImage(this.img, x, y, w, h);
                }
                ctx.restore();
                return;
            }
            else if (images[this.image]) {
                this.img = images[this.image].img;
                this.lastImage = this.image;
                this.imgNaturalWidth = this.img.naturalWidth;
                this.imgNaturalHeight = this.img.naturalHeight;
                this.drawImg(ctx);
                return;
            }
        }
        else if (this.img) {
            if (this.TID && !this.elementLoaded) {
                this.elementLoaded = true;
                Store.set(this.generateStoreKey('LT:addDiv'), this);
            }
            return;
        }
        if (!this.image) {
            return;
        }
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.image;
        img.onload = function () {
            _this.lastImage = _this.image;
            _this.imgNaturalWidth = img.naturalWidth;
            _this.imgNaturalHeight = img.naturalHeight;
            _this.img = img;
            images[_this.image] = {
                img: img,
            };
            Store.set(_this.generateStoreKey('LT:imageLoaded'), true);
            if (!_this.gif && gif) {
                _this.gif = true;
                if (_this.TID) {
                    _this.elementLoaded = true;
                    Store.set(_this.generateStoreKey('LT:addDiv'), _this);
                }
            }
        };
    };
    Node.prototype.calcAnchors = function () {
        var _this = this;
        this.anchors = [];
        if (anchorsFns[this.name]) {
            anchorsFns[this.name](this);
        }
        else {
            defaultAnchors(this);
        }
        if (this.manualAnchors) {
            this.manualAnchors.forEach(function (pt) {
                var x = Math.abs(pt.x - _this.rect.center.x);
                var y = Math.abs(pt.y - _this.rect.center.y);
                if (x > y) {
                    if (pt.x < _this.rect.center.x) {
                        pt.direction = Direction.Left;
                    }
                    else {
                        pt.direction = Direction.Right;
                    }
                }
                else {
                    if (pt.y < _this.rect.center.y) {
                        pt.direction = Direction.Up;
                    }
                    else {
                        pt.direction = Direction.Bottom;
                    }
                }
                _this.anchors.push(pt);
            });
        }
        this.calcRotateAnchors();
    };
    Node.prototype.calcRotateAnchors = function (angle) {
        if (angle === undefined) {
            angle = this.rotate;
        }
        this.rotatedAnchors = [];
        for (var _i = 0, _a = this.anchors; _i < _a.length; _i++) {
            var item = _a[_i];
            this.rotatedAnchors.push(item.clone().rotate(angle, this.rect.center));
        }
    };
    Node.prototype.getTextRect = function () {
        var textRect = this.textRect;
        if (!this.icon && !this.image) {
            textRect = this.fullTextRect;
        }
        return textRect;
    };
    Node.prototype.getIconRect = function () {
        var rect = this.iconRect;
        if (!this.text) {
            rect = this.fullIconRect || this.fullTextRect || this.rect;
        }
        return rect;
    };
    // 根据父节点rect计算自己（子节点）的rect
    Node.prototype.calcRectByParent = function (parent) {
        if (!this.rectInParent) {
            return;
        }
        var parentW = parent.rect.width - parent.paddingLeftNum - parent.paddingRightNum;
        var parentH = parent.rect.height - parent.paddingTopNum - parent.paddingBottomNum;
        var x = parent.rect.x +
            parent.paddingLeftNum +
            abs(parentW, this.rectInParent.x) +
            abs(parentW, this.rectInParent.marginLeft);
        var y = parent.rect.y +
            parent.paddingTopNum +
            abs(parentH, this.rectInParent.y) +
            abs(parentW, this.rectInParent.marginTop);
        var w = abs(parentW, this.rectInParent.width);
        var h = abs(parentH, this.rectInParent.height);
        if (this.rectInParent.marginLeft === undefined &&
            this.rectInParent.marginRight) {
            x -= abs(parentW, this.rectInParent.marginRight);
        }
        if (this.rectInParent.marginTop === undefined &&
            this.rectInParent.marginBottom) {
            y -= abs(parentW, this.rectInParent.marginBottom);
        }
        this.rect = new Rect(x, y, w, h);
        if (!this.rectInParent.rotate) {
            this.rectInParent.rotate = 0;
        }
        var offsetR = parent.rotate + parent.offsetRotate;
        this.rotate = this.rectInParent.rotate + offsetR;
        if (!this.rectInParent.rect) {
            this.rectInParent.rect = this.rect.clone();
        }
    };
    Node.prototype.calcChildrenRect = function () {
        if (!this.children) {
            return;
        }
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var item = _a[_i];
            item.calcRectByParent(this);
            if (item.type === PenType.Node) {
                item.init();
                item.calcChildrenRect();
            }
        }
    };
    Node.prototype.calcRectInParent = function (parent) {
        var parentW = parent.rect.width - parent.paddingLeftNum - parent.paddingRightNum;
        var parentH = parent.rect.height - parent.paddingTopNum - parent.paddingBottomNum;
        this.rectInParent = {
            x: ((this.rect.x - parent.rect.x - parent.paddingLeftNum) * 100) /
                parentW +
                '%',
            y: ((this.rect.y - parent.rect.y - parent.paddingTopNum) * 100) / parentH +
                '%',
            width: (this.rect.width * 100) / parentW + '%',
            height: (this.rect.height * 100) / parentH + '%',
            rotate: this.rectInParent
                ? this.rectInParent.rotate || 0
                : this.rotate || 0,
            rect: this.rect.clone(),
        };
    };
    // getDockWatchers() {
    //   this.dockWatchers = this.rect.toPoints();
    //   this.dockWatchers.unshift(this.rect.center);
    // }
    Node.prototype.initAnimate = function () {
        if (!this.animateFrames) {
            return;
        }
        var passed = 0;
        for (var i = 0; i < this.animateFrames.length; ++i) {
            this.animateFrames[i].start = passed;
            passed += this.animateFrames[i].duration;
            this.animateFrames[i].end = passed;
            this.animateFrames[i].initState = Node.cloneState(i ? this.animateFrames[i - 1].state : this);
            this.animateFrames[i].offsetRect = new Rect(this.animateFrames[i].state.rect.x -
                this.animateFrames[i].initState.rect.x, this.animateFrames[i].state.rect.y -
                this.animateFrames[i].initState.rect.y, this.animateFrames[i].state.rect.width -
                this.animateFrames[i].initState.rect.width, this.animateFrames[i].state.rect.height -
                this.animateFrames[i].initState.rect.height);
        }
        this.animateDuration = passed;
        this.animateReady = Node.cloneState(this);
        this.animatePos = 0;
        this.animateFrame = 0;
    };
    Node.prototype.pauseAnimate = function () {
        this.animateFrame = this._animateFrame;
        this.animatePos = this._animatePos;
        Store.set(this.generateStoreKey('LT:AnimatePlay'), {
            pen: this,
            stop: true,
        });
    };
    Node.prototype.stopAnimate = function () {
        this.animateStart = 0;
        Store.set(this.generateStoreKey('LT:AnimatePlay'), {
            pen: this,
            stop: true,
        });
        this.restore();
        this.initAnimate();
        Store.set(this.generateStoreKey('LT:render'), {
            pen: this,
            stop: true,
        });
    };
    Node.prototype.animate = function (now) {
        var _this = this;
        if (this.animateStart < 1) {
            return;
        }
        var timeline = now - this.animateStart;
        if (this.animateFrame > 0) {
            this.animateFrames.forEach(function (item, index) {
                if (_this.animateFrame < index + 1) {
                    timeline += item.duration;
                }
            });
            timeline += this.animatePos;
        }
        // Finished on animate.
        if (timeline > this.animateDuration) {
            this.animatePos = 0;
            this.animateFrame = 0;
            this.restore();
            if (this.animateCycle > 0 &&
                ++this.animateCycleIndex >= this.animateCycle) {
                this.animateStart = 0;
                this.animateCycleIndex = 0;
                Store.set(this.generateStoreKey('animateEnd'), this);
                if (!this.animateAlone) {
                    Store.set(this.generateStoreKey('LT:rectChanged'), this);
                }
                return;
            }
            this.animateStart = now;
            timeline = 0;
        }
        var rectChanged = false;
        for (var i = 0; i < this.animateFrames.length; ++i) {
            var item = this.animateFrames[i];
            if (timeline >= item.start && timeline < item.end) {
                item.state.dash && (this.dash = item.state.dash);
                item.state.strokeStyle && (this.strokeStyle = item.state.strokeStyle);
                item.state.fillStyle && (this.fillStyle = item.state.fillStyle);
                item.state.text && (this.text = item.state.text);
                item.state.fontColor && (this.fontColor = item.state.fontColor);
                item.state.fontFamily && (this.fontFamily = item.state.fontFamily);
                item.state.fontSize && (this.fontSize = item.state.fontSize);
                item.state.lineHeight && (this.lineHeight = item.state.lineHeight);
                item.state.fontStyle && (this.fontStyle = item.state.fontStyle);
                item.state.fontWeight && (this.fontWeight = item.state.fontWeight);
                item.state.textAlign && (this.textAlign = item.state.textAlign);
                item.state.textBaseline &&
                    (this.textBaseline = item.state.textBaseline);
                item.state.textBackground &&
                    (this.textBackground = item.state.textBackground);
                item.state.iconFamily && (this.iconFamily = item.state.iconFamily);
                item.state.icon && (this.icon = item.state.icon);
                item.state.iconSize && (this.iconSize = item.state.iconSize);
                item.state.iconColor && (this.iconColor = item.state.iconColor);
                this.visible = item.state.visible;
                this._animateFrame = i + 1;
                if (this._animateFrame > this.animateFrame) {
                    this.animateFrame = 0;
                    this.animatePos = 0;
                }
                this._animatePos = timeline - item.start;
                var rate = this._animatePos / item.duration;
                if (item.linear) {
                    if (item.state.rect.x !== item.initState.rect.x) {
                        this.rect.x = item.initState.rect.x + item.offsetRect.x * rate;
                        rectChanged = true;
                    }
                    if (item.state.rect.y !== item.initState.rect.y) {
                        this.rect.y = item.initState.rect.y + item.offsetRect.y * rate;
                        rectChanged = true;
                    }
                    if (item.state.rect.width !== item.initState.rect.width) {
                        this.rect.width =
                            item.initState.rect.width + item.offsetRect.width * rate;
                        rectChanged = true;
                    }
                    if (item.state.rect.height !== item.initState.rect.height) {
                        this.rect.height =
                            item.initState.rect.height + item.offsetRect.height * rate;
                        rectChanged = true;
                    }
                    this.rect.ex = this.rect.x + this.rect.width;
                    this.rect.ey = this.rect.y + this.rect.height;
                    this.rect.calcCenter();
                    if (item.initState.z !== undefined &&
                        item.state.z !== item.initState.z) {
                        this.z =
                            item.initState.z + (item.state.z - item.initState.z) * rate;
                        rectChanged = true;
                    }
                    if (item.state.borderRadius !== item.initState.borderRadius) {
                        this.borderRadius =
                            item.initState.borderRadius +
                                (item.state.borderRadius - item.initState.borderRadius) * rate;
                    }
                    if (item.state.lineWidth !== item.initState.lineWidth) {
                        this.lineWidth =
                            item.initState.lineWidth +
                                (item.state.lineWidth - item.initState.lineWidth) * rate;
                    }
                    if (item.state.rotate !== item.initState.rotate) {
                        this.rotate =
                            item.initState.rotate +
                                (item.state.rotate - item.initState.rotate) * rate;
                        rectChanged = true;
                    }
                    if (item.state.globalAlpha !== item.initState.globalAlpha) {
                        this.globalAlpha =
                            item.initState.globalAlpha +
                                (item.state.globalAlpha - item.initState.globalAlpha) * rate;
                    }
                    if (item.state.lineDashOffset) {
                        if (!this.lineDashOffset) {
                            this.lineDashOffset = item.state.lineDashOffset;
                        }
                        else {
                            this.lineDashOffset += item.state.lineDashOffset;
                        }
                    }
                    if (item.state.value !== item.initState.value) {
                        this.value =
                            (item.initState.value || 0) +
                                ((item.state.value || 0) - (item.initState.value || 0)) * rate;
                    }
                    if (item.state.num !== item.initState.num) {
                        this.num =
                            (item.initState.num || 0) +
                                ((item.state.num || 0) - (item.initState.num || 0)) * rate;
                    }
                    if (item.state.num1 !== item.initState.num1) {
                        this.num1 =
                            (item.initState.num1 || 0) +
                                ((item.state.num1 || 0) - (item.initState.num1 || 0)) * rate;
                    }
                    if (item.state.num2 !== item.initState.num2) {
                        this.num2 =
                            (item.initState.num2 || 0) +
                                ((item.state.num2 || 0) - (item.initState.num2 || 0)) * rate;
                    }
                    if (item.state.num3 !== item.initState.num3) {
                        this.num3 =
                            (item.initState.num3 || 0) +
                                ((item.state.num3 || 0) - (item.initState.num3 || 0)) * rate;
                    }
                    if (item.state.data) {
                        for (var key in item.state.data) {
                            if (typeof item.state.data[key] === 'number') {
                                this.data[key] =
                                    (item.initState.data[key] || 0) +
                                        ((item.state.data[key] || 0) -
                                            (item.initState.data[key] || 0)) *
                                            rate;
                            }
                            else if (item.state.data[key] !== undefined &&
                                item.state.data[key] !== undefined) {
                                this.data[key] = item.state.data[key];
                            }
                        }
                    }
                }
                else {
                    this.rect = item.state.rect;
                    this.lineWidth = item.state.lineWidth;
                    this.rotate = item.state.rotate;
                    this.globalAlpha = item.state.globalAlpha;
                    this.lineDashOffset = item.state.lineDashOffset;
                }
            }
        }
        if (rectChanged) {
            this.init(true);
            if (!this.animateAlone) {
                Store.set(this.generateStoreKey('LT:rectChanged'), this);
            }
        }
    };
    Node.prototype.scale = function (scale, center) {
        if (!center) {
            center = this.rect.center;
        }
        this['oldRect'] = this.rect.clone();
        this.rect.x = center.x - (center.x - this.rect.x) * scale;
        this.rect.y = center.y - (center.y - this.rect.y) * scale;
        this.textOffsetX *= scale;
        this.textOffsetY *= scale;
        this.z *= scale;
        this.rect.width *= scale;
        this.rect.height *= scale;
        this.rect.ex = this.rect.x + this.rect.width;
        this.rect.ey = this.rect.y + this.rect.height;
        this.lineWidth *= scale;
        if (this.imageWidth) {
            this.imageWidth *= scale;
        }
        if (this.imageHeight) {
            this.imageHeight *= scale;
        }
        this.lastImage = undefined;
        this.fontSize *= scale;
        this.iconSize *= scale;
        if (typeof this.paddingLeft === 'number') {
            this.paddingLeft *= scale;
        }
        if (typeof this.paddingTop === 'number') {
            this.paddingTop *= scale;
        }
        if (typeof this.paddingRight === 'number') {
            this.paddingRight *= scale;
        }
        if (typeof this.paddingBottom === 'number') {
            this.paddingBottom *= scale;
        }
        if (this.rectInParent) {
            if (typeof this.rectInParent.x === 'number') {
                this.rectInParent.x *= scale;
            }
            if (typeof this.rectInParent.y === 'number') {
                this.rectInParent.y *= scale;
            }
            if (typeof this.rectInParent.width === 'number') {
                this.rectInParent.width *= scale;
            }
            if (typeof this.rectInParent.height === 'number') {
                this.rectInParent.height *= scale;
            }
            if (typeof this.rectInParent.marginLeft === 'number') {
                this.rectInParent.marginLeft *= scale;
            }
            if (typeof this.rectInParent.marginTop === 'number') {
                this.rectInParent.marginTop *= scale;
            }
            if (typeof this.rectInParent.marginRight === 'number') {
                this.rectInParent.marginRight *= scale;
            }
            if (typeof this.rectInParent.marginBottom === 'number') {
                this.rectInParent.marginBottom *= scale;
            }
        }
        this.rect.calcCenter();
        if (this.animateFrames && this.animateFrames.length) {
            for (var _i = 0, _a = this.animateFrames; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.initState) {
                    if (!item.initState.scale) {
                        item.initState = new Node(item.initState);
                    }
                    item.initState.scale(scale, center);
                }
                if (item.state) {
                    if (!item.state.scale) {
                        item.state = new Node(item.state);
                    }
                    item.state.scale(scale, center);
                }
                if (item.initState && item.state) {
                    item.state.fontSize = item.initState.fontSize;
                }
            }
        }
        this.scalePoints(scale, scale);
        this.elementRendered = false;
        this.init();
        if (this.children) {
            for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
                var item = _c[_b];
                item.scale(scale, center);
            }
        }
        if (this.animateReady && this.animateReady.scale) {
            this.animateReady.scale(scale, center);
        }
    };
    Node.prototype.scalePoints = function (scaleX, scaleY) {
        var _this = this;
        if ((this.points || this.manualAnchors) && this['oldRect']) {
            if (!scaleX) {
                scaleX = this.rect.width / this['oldRect'].width;
            }
            if (!scaleY) {
                scaleY = this.rect.height / this['oldRect'].height;
            }
            if (this.points) {
                this.points.forEach(function (pt) {
                    pt.x = _this.rect.x + (pt.x - _this['oldRect'].x) * scaleX;
                    pt.y = _this.rect.y + (pt.y - _this['oldRect'].y) * scaleY;
                });
            }
            if (this.manualAnchors) {
                this.manualAnchors.forEach(function (pt) {
                    pt.x = _this.rect.x + (pt.x - _this['oldRect'].x) * scaleX;
                    pt.y = _this.rect.y + (pt.y - _this['oldRect'].y) * scaleY;
                });
            }
        }
    };
    Node.prototype.translate = function (x, y) {
        this.rect.x += x;
        this.rect.y += y;
        this.rect.ex = this.rect.x + this.rect.width;
        this.rect.ey = this.rect.y + this.rect.height;
        this.rect.calcCenter();
        if (this.animateReady) {
            this.animateReady.translate(x, y);
        }
        if (this.animateFrames && this.animateFrames.length) {
            for (var _i = 0, _a = this.animateFrames; _i < _a.length; _i++) {
                var frame = _a[_i];
                var initState = frame.initState, state = frame.state;
                if (initState && initState.translate) {
                    initState.translate(x, y);
                }
                if (state && state.translate) {
                    state.translate(x, y);
                }
            }
        }
        if (this.points) {
            this.points.forEach(function (pt) {
                pt.x += x;
                pt.y += y;
            });
        }
        if (this.manualAnchors) {
            this.manualAnchors.forEach(function (pt) {
                pt.x += x;
                pt.y += y;
            });
        }
        this.init();
        if (this.children) {
            for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
                var item = _c[_b];
                item.translate(x, y);
            }
        }
    };
    Node.prototype.initRect = function () {
        this.rect.init();
        if (this.children) {
            this.calcChildrenRect();
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item instanceof Node) {
                    item.initRect();
                }
            }
        }
    };
    Node.prototype.pushPoint = function (pt) {
        var _this = this;
        this.points.push(pt);
        if (!this.rect) {
            this.rect = new Rect(0, 0, 0, 0);
        }
        this.points.forEach(function (p) {
            if (!_this.rect.x || _this.rect.x > p.x) {
                _this.rect.x = p.x;
            }
            if (!_this.rect.y || _this.rect.y > p.y) {
                _this.rect.y = p.y;
            }
            if (_this.rect.ex < p.x) {
                _this.rect.ex = p.x;
            }
            if (_this.rect.ey < p.y) {
                _this.rect.ey = p.y;
            }
        });
        this.rect.width = this.rect.ex - this.rect.x;
        this.rect.height = this.rect.ey - this.rect.y;
    };
    Node.prototype.nearestAnchor = function (pt) {
        var dis = 99999;
        var index = 0;
        for (var i = 0; i < this.rotatedAnchors.length; ++i) {
            var d = distance(pt, this.rotatedAnchors[i]);
            if (dis > d) {
                dis = d;
                index = i;
            }
        }
        return {
            index: index,
            direction: this.rotatedAnchors[index].direction,
        };
    };
    Node.prototype.hitInSelf = function (point, padding) {
        if (padding === void 0) { padding = 0; }
        if (this.rotate % 360 === 0) {
            return this.rect.hit(point, padding);
        }
        var pts = this.rect.toPoints();
        for (var _i = 0, pts_1 = pts; _i < pts_1.length; _i++) {
            var pt = pts_1[_i];
            pt.rotate(this.rotate, this.rect.center);
        }
        return pointInRect(point, pts);
    };
    Node.prototype.hit = function (pt, padding) {
        if (padding === void 0) { padding = 0; }
        var node;
        if (this.hitInSelf(pt, padding)) {
            node = this;
        }
        if (this.children) {
            var len = this.children.length;
            for (var i = len - 1; i > -1; --i) {
                var pen = this.children[i];
                var p = pen.hit(pt, padding);
                if (p) {
                    node = p;
                    break;
                }
            }
        }
        return node;
    };
    Node.prototype.round = function () {
        this.rect.round();
        if (this.children) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var item = _a[_i];
                item.rect.round();
            }
        }
    };
    Node.prototype.clone = function () {
        var n = new Node(this);
        n.setTID(this.TID);
        n.elementRendered = false;
        n.elementLoaded = false;
        if (this.name !== 'div') {
            n.elementId = '';
        }
        return n;
    };
    return Node;
}(Pen));
export { Node };
//# sourceMappingURL=node.js.map