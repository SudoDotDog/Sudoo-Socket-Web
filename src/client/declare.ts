/**
 * @author WMXPY
 * @namespace SocketClient_Web
 * @description Declare
 */

export type ClientConnectHandler = () => void;
export type ClientErrorHandler = (error: Error) => void;
export type ClientCloseHandler = (code: number, reason: string) => void;

export type ClientUTF8MessageHandler = (message: string) => void;
export type ClientJSONMessageHandler<T = any> = (message: T) => void;
export type ClientArrayBufferMessageHandler = (message: ArrayBuffer) => void;

export type SocketClientAuthorizationOption = {

    readonly type: 'bearer';
    readonly token: string;
} | {

    readonly type: 'basic';
    readonly username: string;
    readonly password: string;
} | {

    readonly type: 'plain';
    readonly token: string;
};

export type SocketClientOptions = {

    readonly authorization?: SocketClientAuthorizationOption;
    readonly origin?: string;
    readonly protocol?: string;
};
