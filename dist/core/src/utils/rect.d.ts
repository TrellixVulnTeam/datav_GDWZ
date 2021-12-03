import { Point } from '../models/point';
import { Pen } from '../models/pen';
import { Rect } from '../models/rect';
/**
 * 不包含画布偏移量
 * */
export declare function getRect(pens: Pen[]): Rect;
export declare function getBboxOfPoints(points: Point[]): {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
export declare function rectInRect(source: Rect, target: Rect): boolean;
/**
 * 合并大小全部传入的 rects
 * */
export declare function getMoreRect(...rects: Rect[]): Rect;
