export declare class Socket {
    url: string;
    cb?: (e: any) => void;
    socket: WebSocket;
    fns: any;
    constructor(url: string, cb?: (e: any) => void);
    init(): void;
    close(): void;
}