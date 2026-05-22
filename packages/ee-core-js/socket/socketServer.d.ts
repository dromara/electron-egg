import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
export declare class SocketServer {
    socket: import("socket.io").Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    config: any;
    init(): Promise<void>;
    connect(): void;
}

