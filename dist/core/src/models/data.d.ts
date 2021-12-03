import { Pen } from './pen';
import { Lock } from './status';
import { Rect } from './rect';
export interface TopologyData {
    pens: Pen[];
    lineName: string;
    fromArrow: string;
    toArrow: string;
    lineWidth?: number;
    x: number;
    y: number;
    scale: number;
    locked: Lock;
    bkImage?: string;
    bkImageRect?: Rect;
    bkImageStatic?: boolean;
    bkColor?: string;
    grid?: boolean;
    gridColor?: string;
    gridSize?: number;
    rule?: boolean;
    ruleColor?: string;
    websocket?: string;
    mqttUrl?: string;
    mqttOptions?: {
        clientId?: string;
        username?: string;
        password?: string;
        customClientId?: boolean;
    };
    mqttTopics?: string;
    manualCps?: boolean;
    tooltip?: boolean | number;
    socketEvent?: boolean | number;
    socketFn?: string;
    initJS?: string;
    data?: any;
}
export declare function createData(json?: any, tid?: string): TopologyData;
