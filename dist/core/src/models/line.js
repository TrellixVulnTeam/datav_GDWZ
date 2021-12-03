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
import { Pen, PenType } from './pen';
import { Point } from './point';
import { drawLineFns, drawArrowFns } from '../middles';
import { getBezierPoint } from '../middles/lines/curve';
import { Store } from 'le5le-store';
import { lineLen, curveLen } from '../utils/canvas';
import { text } from '../middles/nodes/text';
import { Rect } from './rect';
import { abs } from '../utils/math';
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(json) {
        var _this = _super.call(this) || this;
        var defaultData = {
            name: 'curve',
            fromArrow: '',
            toArrow: '',
            controlPoints: [],
            fromArrowSize: 5,
            toArrowSize: 5,
            borderWidth: 0,
            borderColor: '#000000',
            animateColor: '',
            animateSpan: 1,
            animateFromSize: 0,
            animateToSize: 0,
            animateDotSize: 3,
            textBackground: '#ffffff'
        };
        _this.fromData(defaultData, json);
        _this.type = PenType.Line;
        if (json.from) {
            _this.from = new Point(json.from.x, json.from.y, json.from.direction, json.from.anchorIndex, json.from.id, json.autoAnchor);
        }
        if (json.to) {
            _this.to = new Point(json.to.x, json.to.y, json.to.direction, json.to.anchorIndex, json.to.id, json.autoAnchor);
        }
        // 暂时兼容老数据
        if (json.name === 'mind' && (!json.controlPoints || json.controlPoints.length > 2)) {
            json.controlPoints = undefined;
            _this.calcControlPoints(true);
        }
        // end
        else if (json.controlPoints) {
            _this.controlPoints = [];
            for (var _i = 0, _a = json.controlPoints; _i < _a.length; _i++) {
                var item = _a[_i];
                _this.controlPoints.push(new Point(item.x, item.y, item.direction, item.anchorIndex, item.id));
            }
        }
        if (json.children) {
            _this.children = [];
            json.children.forEach(function (item) {
                _this.children.push(new Line(item));
            });
        }
        return _this;
    }
    Line.prototype.setFrom = function (from, fromArrow) {
        if (fromArrow === void 0) { fromArrow = ''; }
        this.from = from;
        this.fromArrow = fromArrow;
        this.textRect = undefined;
    };
    Line.prototype.setTo = function (to, toArrow) {
        if (toArrow === void 0) { toArrow = 'triangleSolid'; }
        this.to = to;
        this.toArrow = toArrow;
        this.textRect = undefined;
    };
    Line.prototype.calcControlPoints = function (force) {
        if (this.name !== 'line' && this.manualCps && !force) {
            return;
        }
        this.textRect = undefined;
        if (this.from && this.to && drawLineFns[this.name]) {
            drawLineFns[this.name].controlPointsFn(this);
        }
    };
    Line.prototype.draw = function (ctx) {
        if (this.animateDot) {
            ctx.fillStyle = ctx.strokeStyle;
            if (this.animateType === 'dot') {
                ctx.beginPath();
                ctx.arc(this.animateDot.x, this.animateDot.y, this.animateDotSize, 0, 2 * Math.PI, false);
                ctx.fill();
                return;
            }
            else if (this.animateType === 'comet') {
                var bulles = this.getBubbles();
                ctx.save();
                for (var _i = 0, bulles_1 = bulles; _i < bulles_1.length; _i++) {
                    var item = bulles_1[_i];
                    ctx.globalAlpha = item.a;
                    ctx.beginPath();
                    ctx.arc(item.pos.x, item.pos.y, item.r, 0, 2 * Math.PI, false);
                    ctx.fill();
                }
                ctx.restore();
            }
        }
        if (!this.isAnimate && this.borderWidth > 0 && this.borderColor) {
            ctx.save();
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }
            ctx.lineWidth = this.lineWidth + this.borderWidth;
            ctx.strokeStyle = this.borderColor;
            if (drawLineFns[this.name]) {
                drawLineFns[this.name].drawFn(ctx, this);
            }
            ctx.restore();
        }
        switch (this.strokeType) {
            case 1:
                this.strokeLinearGradient(ctx);
                break;
        }
        if ((!this.isAnimate || this.animateType !== 'comet') && drawLineFns[this.name]) {
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }
            drawLineFns[this.name].drawFn(ctx, this);
        }
        var scale = Store.get(this.generateStoreKey('LT:scale')) || 1;
        if (this.fromArrow && drawArrowFns[this.fromArrow]) {
            ctx.save();
            ctx.beginPath();
            ctx.lineDashOffset = 0;
            ctx.setLineDash([]);
            ctx.fillStyle = this.fromArrowColor || ctx.strokeStyle;
            ctx.strokeStyle = ctx.fillStyle;
            var f = this.to;
            if (this.name === 'curve') {
                f = getBezierPoint(0.95 - this.lineWidth / 100, this.to, this.controlPoints[1], this.controlPoints[0], this.from);
            }
            else if (this.name !== 'line' && this.controlPoints.length) {
                f = this.controlPoints[0];
            }
            drawArrowFns[this.fromArrow](ctx, f, this.from, this.fromArrowSize * scale);
            ctx.restore();
        }
        if (this.toArrow && drawArrowFns[this.toArrow]) {
            ctx.save();
            ctx.beginPath();
            ctx.lineDashOffset = 0;
            ctx.setLineDash([]);
            ctx.fillStyle = this.toArrowColor || ctx.strokeStyle;
            ctx.strokeStyle = ctx.fillStyle;
            var f = this.from;
            if (this.name === 'curve') {
                f = getBezierPoint(0.95 - this.lineWidth / 100, this.from, this.controlPoints[0], this.controlPoints[1], this.to);
            }
            else if (this.name === 'mind') {
                f = getBezierPoint(0.96 - this.lineWidth / 100, this.from, this.controlPoints[0], this.controlPoints[1], this.to);
            }
            else if (this.name !== 'line' && this.controlPoints.length) {
                f = this.controlPoints[this.controlPoints.length - 1];
            }
            drawArrowFns[this.toArrow](ctx, f, this.to, this.toArrowSize * scale);
            ctx.restore();
        }
        if (this.text && !this.isAnimate) {
            if (!this.textRect) {
                this.calcTextRect();
            }
            text(ctx, this);
        }
    };
    Line.prototype.pointIn = function (pt) {
        return drawLineFns[this.name].pointIn(pt, this);
    };
    Line.prototype.getLen = function () {
        switch (this.name) {
            case 'line':
                return lineLen(this.from, this.to);
            case 'polyline':
                if (!this.controlPoints || !this.controlPoints.length) {
                    return lineLen(this.from, this.to);
                }
                var len = 0;
                var curPt = this.from;
                for (var _i = 0, _a = this.controlPoints; _i < _a.length; _i++) {
                    var pt = _a[_i];
                    len += lineLen(curPt, pt);
                    curPt = pt;
                }
                len += lineLen(curPt, this.to);
                return len | 0;
            case 'curve':
            case 'mind':
                return curveLen(this.from, this.controlPoints[0], this.controlPoints[1], this.to);
            default:
                if (drawLineFns[this.name].getLength) {
                    return drawLineFns[this.name].getLength(this);
                }
        }
        return 0;
    };
    Line.prototype.strokeLinearGradient = function (ctx) {
        if (!this.lineGradientFromColor || !this.lineGradientToColor) {
            return;
        }
        var from = this.from;
        var to = this.to;
        // contributor: https://github.com/sunnyguohua/topology
        var grd = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        grd.addColorStop(0, this.lineGradientFromColor);
        grd.addColorStop(1, this.lineGradientToColor);
        ctx.strokeStyle = grd;
    };
    Line.prototype.calcTextRect = function () {
        if (!this.from || this.to) {
            this.textRect = undefined;
            return;
        }
        var center = this.getCenter();
        var width = Math.abs(this.from.x - this.to.x);
        if (width < 100) {
            width = 100;
        }
        if (this.text && !this.text.split) {
            this.text += '';
        }
        var height = this.lineHeight *
            this.fontSize *
            (this.textMaxLine || (this.text && this.text.split('\n').length) || 1);
        this.textRect = new Rect(center.x - width / 2, center.y - height / 2, width, height);
    };
    Line.prototype.getTextRect = function () {
        // calc every time just in case text line is changed.
        this.calcTextRect();
        return this.textRect;
    };
    Line.prototype.getCenter = function () {
        var center = new Point(this.from.x, this.from.y);
        switch (this.name) {
            case 'line':
                center = this.getLineCenter(this.from, this.to);
                break;
            case 'polyline':
                var i = Math.round(this.controlPoints.length / 2);
                center = this.getLineCenter(this.controlPoints[i - 1] || this.from, this.controlPoints[i] || this.to);
                break;
            case 'curve':
                center = getBezierPoint(0.5, this.to, this.controlPoints[1], this.controlPoints[0], this.from);
                break;
            default:
                if (drawLineFns[this.name].getCenter) {
                    center = drawLineFns[this.name].getCenter(this);
                }
        }
        return center;
    };
    Line.prototype.getLineCenter = function (from, to) {
        return new Point((from.x + to.x) / 2, (from.y + to.y) / 2);
    };
    Line.prototype.getPointByPos = function (pos) {
        if (pos <= 0) {
            return this.from;
        }
        switch (this.name) {
            case 'line':
                return this.getLinePtByPos(this.from, this.to, pos);
            case 'polyline':
                if (!this.controlPoints || !this.controlPoints.length) {
                    return this.getLinePtByPos(this.from, this.to, pos);
                }
                else {
                    var points = [].concat(this.controlPoints, this.to);
                    var curPt = this.from;
                    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
                        var pt = points_1[_i];
                        var l = lineLen(curPt, pt);
                        if (pos > l) {
                            pos -= l;
                            curPt = pt;
                        }
                        else {
                            return this.getLinePtByPos(curPt, pt, pos);
                        }
                    }
                    return this.to;
                }
            case 'curve':
                return getBezierPoint(pos / this.getLen(), this.from, this.controlPoints[0], this.controlPoints[1], this.to);
            default:
                if (drawLineFns[this.name].getPointByPos) {
                    return drawLineFns[this.name].getPointByPos(pos, this);
                }
        }
        return null;
    };
    Line.prototype.getPointByReversePos = function (pos) {
        if (pos <= 0) {
            return this.to;
        }
        switch (this.name) {
            case 'line':
                return this.getLinePtByPos(this.to, this.from, pos);
            case 'polyline':
                if (!this.controlPoints || !this.controlPoints.length) {
                    return this.getLinePtByPos(this.to, this.from, pos);
                }
                else {
                    var points_3 = [];
                    this.controlPoints.forEach(function (item) {
                        points_3.unshift(item);
                    });
                    points_3.unshift(this.to);
                    var curPt = this.to;
                    for (var _i = 0, points_2 = points_3; _i < points_2.length; _i++) {
                        var pt = points_2[_i];
                        var l = lineLen(curPt, pt);
                        if (pos > l) {
                            pos -= l;
                            curPt = pt;
                        }
                        else {
                            return this.getLinePtByPos(curPt, pt, pos);
                        }
                    }
                    return this.from;
                }
            case 'curve':
                return getBezierPoint(pos / this.getLen(), this.to, this.controlPoints[1], this.controlPoints[0], this.from);
            default:
                if (drawLineFns[this.name].getPointByReversePos) {
                    return drawLineFns[this.name].getPointByReversePos(pos, this);
                }
        }
        return null;
    };
    Line.prototype.getLinePtByPos = function (from, to, pos) {
        var length = lineLen(from, to);
        if (pos <= 0) {
            return from;
        }
        if (pos >= length) {
            return to;
        }
        var x, y;
        x = from.x + (to.x - from.x) * (pos / length);
        y = from.y + (to.y - from.y) * (pos / length);
        return new Point(x, y);
    };
    Line.prototype.calcRectInParent = function (parent) {
        var parentW = parent.rect.width - parent.paddingLeftNum - parent.paddingRightNum;
        var parentH = parent.rect.height - parent.paddingTopNum - parent.paddingBottomNum;
        this.rectInParent = {
            x: ((this.from.x - parent.rect.x - parent.paddingLeftNum) * 100) / parentW + '%',
            y: ((this.from.y - parent.rect.y - parent.paddingTopNum) * 100) / parentH + '%',
            width: 0,
            height: 0,
            rotate: 0,
        };
    };
    // 根据父节点rect计算自己（子节点）的rect
    Line.prototype.calcRectByParent = function (parent) {
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
        if (this.rectInParent.marginLeft === undefined && this.rectInParent.marginRight) {
            x -= abs(parentW, this.rectInParent.marginRight);
        }
        if (this.rectInParent.marginTop === undefined && this.rectInParent.marginBottom) {
            y -= abs(parentW, this.rectInParent.marginBottom);
        }
        this.translate(x - this.from.x, y - this.from.y);
    };
    Line.prototype.initAnimate = function () {
        this.animateStart = 0;
        this.animateDot = undefined;
        this.animatePos = 0;
    };
    Line.prototype.pauseAnimate = function () {
        Store.set(this.generateStoreKey('LT:AnimatePlay'), {
            pen: this,
            stop: true,
        });
    };
    Line.prototype.stopAnimate = function () {
        var _this = this;
        this.pauseAnimate();
        this.initAnimate();
        setTimeout(function () {
            Store.set(_this.generateStoreKey('LT:render'), {
                pen: _this,
                stop: true,
            });
        }, 50);
    };
    Line.prototype.animate = function (now) {
        this.animatePos += this.animateSpan;
        switch (this.animateType) {
            case 'beads':
                if (this.animateReverse) {
                    this.lineDashOffset = this.animatePos;
                }
                else {
                    this.lineDashOffset = -this.animatePos;
                }
                var len = this.lineWidth;
                if (len < 5) {
                    len = 5;
                }
                if (this.animateLineDash) {
                    this.lineDash = this.animateLineDash;
                }
                else {
                    this.lineDash = [len, len * 2];
                }
                break;
            case 'dot':
            case 'comet':
                this.lineDash = undefined;
                var pos = void 0;
                if (this.animateReverse) {
                    pos = this.getPointByReversePos(this.animatePos + this.animateToSize);
                }
                else {
                    pos = this.getPointByPos(this.animatePos + this.animateFromSize);
                }
                this.animateDot = pos;
                break;
            default:
                if (this.animateReverse) {
                    this.lineDash = [0, this.length - this.animatePos + 1, this.animatePos];
                }
                else {
                    this.lineDash = [this.animatePos, this.length - this.animatePos + 1];
                }
                break;
        }
        if (this.animatePos > this.length + this.animateSpan - this.animateFromSize - this.animateToSize) {
            if (++this.animateCycleIndex >= this.animateCycle && this.animateCycle > 0) {
                this.animateStart = 0;
                this.initAnimate();
                Store.set(this.generateStoreKey('animateEnd'), this);
                return;
            }
            this.animatePos = this.animateSpan;
        }
    };
    Line.prototype.getBubbles = function () {
        var bubbles = [];
        for (var i = 0; i < 30 && this.animatePos - i > 0; ++i) {
            if (this.animateReverse) {
                bubbles.push({
                    pos: this.getPointByReversePos(this.animatePos - i * 2 + this.animateToSize),
                    a: 1 - i * 0.03,
                    r: this.lineWidth - i * 0.01,
                });
            }
            else {
                bubbles.push({
                    pos: this.getPointByPos(this.animatePos - i * 2 + this.animateFromSize),
                    a: 1 - i * 0.03,
                    r: this.lineWidth - i * 0.01,
                });
            }
        }
        return bubbles;
    };
    Line.prototype.round = function () {
        this.from.round();
        this.to.round();
    };
    Line.prototype.translate = function (x, y) {
        if (this.from) {
            this.from.x += x;
            this.from.y += y;
            this.to.x += x;
            this.to.y += y;
            if (this.text) {
                this.textRect = undefined;
            }
            for (var _i = 0, _a = this.controlPoints; _i < _a.length; _i++) {
                var pt = _a[_i];
                pt.x += x;
                pt.y += y;
            }
        }
        if (this.children) {
            for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
                var item = _c[_b];
                item.translate(x, y);
            }
        }
        Store.set(this.generateStoreKey('pts-') + this.id, undefined);
    };
    Line.prototype.scale = function (scale, center) {
        if (this.from) {
            this.from.x = center.x - (center.x - this.from.x) * scale;
            this.from.y = center.y - (center.y - this.from.y) * scale;
            this.to.x = center.x - (center.x - this.to.x) * scale;
            this.to.y = center.y - (center.y - this.to.y) * scale;
            this.lineWidth *= scale;
            this.borderWidth *= scale;
            this.fontSize *= scale;
            if (this.text) {
                this.textRect = undefined;
            }
            this.textOffsetX *= scale;
            this.textOffsetY *= scale;
            for (var _i = 0, _a = this.controlPoints; _i < _a.length; _i++) {
                var pt = _a[_i];
                pt.x = center.x - (center.x - pt.x) * scale;
                pt.y = center.y - (center.y - pt.y) * scale;
            }
        }
        if (this.children) {
            for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
                var item = _c[_b];
                item.scale(scale, center);
            }
        }
        Store.set(this.generateStoreKey('pts-') + this.id, undefined);
    };
    Line.prototype.hit = function (pt, padding) {
        if (padding === void 0) { padding = 0; }
        if (this.from.hit(pt, padding) || this.to.hit(pt, padding)) {
            return this;
        }
    };
    Line.prototype.clone = function () {
        return new Line(this);
    };
    return Line;
}(Pen));
export { Line };
//# sourceMappingURL=line.js.map