import { TopologyData } from '@topology/core';
export declare function createCacheTable(): void;
export declare function spliceCache(index: number): void;
export declare function pushCache(data: TopologyData | any, index: number, length: number): void;
export declare function getCache(index: number): Promise<TopologyData>;