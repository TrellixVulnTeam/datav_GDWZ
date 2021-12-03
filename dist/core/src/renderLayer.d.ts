import { Options } from './options';
import { Canvas } from './canvas';
import { TopologyData } from './models/data';
export declare class RenderLayer extends Canvas {
    parentElem: HTMLElement;
    options: Options;
    offscreen: any;
    data: TopologyData;
    bkImg: HTMLImageElement;
    constructor(parentElem: HTMLElement, options: Options, TID: string);
    loadBkImg(cb?: any): void;
    clearBkImg(): void;
    render: () => void;
    rule(): void;
    grid(): void;
}
