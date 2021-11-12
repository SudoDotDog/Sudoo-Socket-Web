/**
 * @author WMXPY
 * @namespace SocketClient_Web
 * @description Web
 */

import { ICloseEvent, IMessageEvent, w3cwebsocket as WebSocketClient } from "websocket";
import { encodeBasicAuthorizationTokenWeb, fixWebSocketUrl } from "@sudoo/socket-util";
import { ClientCloseHandler, ClientConnectHandler, ClientErrorHandler, SocketClientOptions } from "./declare";
import { SocketClientMessageHandler } from "./message-handler";

export class SocketClientWeb {

    public static create(url: string, options: SocketClientOptions = {}): SocketClientWeb {

        const client: SocketClientWeb = new SocketClientWeb(fixWebSocketUrl(url), options);
        return client;
    }

    private readonly _url: string;
    private readonly _options: SocketClientOptions;

    private readonly _connectListeners: Set<ClientConnectHandler>;
    private readonly _errorListeners: Set<ClientErrorHandler>;
    private readonly _closeListeners: Set<ClientCloseHandler>;

    private readonly _defaultMessageHandler: SocketClientMessageHandler;
    private readonly _messageHandlers: Set<SocketClientMessageHandler>;

    private _client: WebSocketClient | null;

    private constructor(url: string, options: SocketClientOptions) {

        this._url = url;
        this._options = options;

        this._connectListeners = new Set<ClientConnectHandler>();
        this._errorListeners = new Set<ClientErrorHandler>();
        this._closeListeners = new Set<ClientCloseHandler>();

        this._defaultMessageHandler = SocketClientMessageHandler.create();
        this._messageHandlers = new Set<SocketClientMessageHandler>();

        this._client = null;
    }

    public get isConnected(): boolean {
        return this._client !== null;
    }
    public get defaultMessageHandler(): SocketClientMessageHandler {
        return this._defaultMessageHandler;
    }

    public connect(): Promise<void> {

        return new Promise((resolve: () => void, reject: (error: Error) => void) => {

            this._client = new WebSocketClient(
                this._url,
                this._options.protocol,
                this._options.origin,
                this._buildHeaders(),
            );

            this._client.onerror = (error: Error): void => {

                this._errorListeners.forEach((listener: ClientErrorHandler) => {
                    listener(error);
                });

                if (this._client !== null) {
                    this._client.close();
                    this._client = null;
                }
                reject(error);
                return;
            };

            this._client.onopen = (): void => {

                this._connectListeners.forEach((listener: ClientConnectHandler) => {
                    listener();
                });
                resolve();
                return;
            };

            this._client.onmessage = (message: IMessageEvent): void => {

                if (typeof message.data === 'string') {

                    this._emitUTF8Message(message.data);
                } else {

                    this._emitArrayBufferData(message.data as any as ArrayBuffer);
                }
            };

            this._client.onclose = (event: ICloseEvent): void => {

                this._closeListeners.forEach((listener: ClientCloseHandler) => {
                    listener(event.code, event.reason);
                });
                this._client = null;
            };
        });
    }

    public sendJSON<T = any>(data: T): void {

        if (this._client === null) {
            throw new Error('[Sudoo-Socket-Client] Not Connected');
        }

        this._client.send(JSON.stringify(data));
    }

    public sendArrayBuffer(arrayBuffer: ArrayBuffer): void {

        if (this._client === null) {
            throw new Error('[Sudoo-Socket-Client] Not Connected');
        }

        this._client.send(arrayBuffer);
    }

    public sendUTF8(data: string): void {

        if (this._client === null) {
            throw new Error('[Sudoo-Socket-Client] Not Connected');
        }

        this._client.send(data);
    }

    public close(code?: number, description?: string): this {

        if (this._client) {
            this._client.close(code, description);
        }
        return this;
    }

    public createAddAndGetMessageHandler(): SocketClientMessageHandler {

        const handler: SocketClientMessageHandler = SocketClientMessageHandler.create();
        this._messageHandlers.add(handler);
        return handler;
    }

    public addMessageHandler(handler: SocketClientMessageHandler): this {

        this._messageHandlers.add(handler);
        return this;
    }

    public removeMessageHandler(handler: SocketClientMessageHandler): this {

        this._messageHandlers.delete(handler);
        return this;
    }

    public addConnectListener(listener: ClientConnectHandler): this {

        this._connectListeners.add(listener);
        return this;
    }

    public removeConnectListener(listener: ClientConnectHandler): this {

        this._connectListeners.delete(listener);
        return this;
    }

    public addErrorListener(listener: ClientErrorHandler): this {

        this._errorListeners.add(listener);
        return this;
    }

    public removeErrorListener(listener: ClientErrorHandler): this {

        this._errorListeners.delete(listener);
        return this;
    }

    public addCloseListener(listener: ClientCloseHandler): this {

        this._closeListeners.add(listener);
        return this;
    }

    public removeCloseListener(listener: ClientCloseHandler): this {

        this._closeListeners.delete(listener);
        return this;
    }

    private _emitUTF8Message(message: string): this {

        const messageHandlers: SocketClientMessageHandler[] = this._getMessageHandlers();
        for (const messageHandler of messageHandlers) {
            messageHandler.emitUTF8Message(message);
        }
        return this;
    }

    private _emitArrayBufferData(message: ArrayBuffer): this {

        const messageHandlers: SocketClientMessageHandler[] = this._getMessageHandlers();
        for (const messageHandler of messageHandlers) {
            messageHandler.emitArrayBufferMessage(message);
        }
        return this;
    }

    private _getMessageHandlers(): SocketClientMessageHandler[] {

        return [
            this._defaultMessageHandler,
            ...this._messageHandlers,
        ];
    }

    private _buildHeaders(): Record<string, string> {

        const headers: Record<string, string> = {};

        if (typeof this._options.authorization !== 'undefined') {

            switch (this._options.authorization.type) {

                case 'basic': {

                    headers.Authorization = `Basic ${encodeBasicAuthorizationTokenWeb(
                        this._options.authorization.username,
                        this._options.authorization.password,
                    )}`;
                    break;
                }
                case 'bearer': {

                    headers.Authorization = `Bearer ${this._options.authorization.token}`;
                    break;
                }
                case 'plain': {

                    headers.Authorization = `Plain ${this._options.authorization.token}`;
                    break;
                }
            }
        }
        return headers;
    }
}
