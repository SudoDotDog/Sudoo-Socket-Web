/**
 * @author WMXPY
 * @namespace SocketClient_Web
 * @description Message Handler
 */

import { ClientArrayBufferMessageHandler, ClientJSONMessageHandler, ClientUTF8MessageHandler } from "./declare";

export class SocketClientMessageHandler {

    public static create(): SocketClientMessageHandler {

        return new SocketClientMessageHandler();
    }

    private readonly _utf8MessageListeners: Set<ClientUTF8MessageHandler>;
    private readonly _jsonMessageListeners: Set<ClientJSONMessageHandler>;
    private readonly _bufferMessageListeners: Set<ClientArrayBufferMessageHandler>;

    private constructor() {

        this._utf8MessageListeners = new Set();
        this._jsonMessageListeners = new Set();
        this._bufferMessageListeners = new Set();
    }

    public emitUTF8Message(message: string): void {

        // eslint-disable-next-line no-useless-catch
        try {

            this._emitUTF8OrJsonMessage(message);
            return;
        } catch (error) {

            throw error;
        }
    }

    public emitArrayBufferMessage(message: ArrayBuffer): void {

        // eslint-disable-next-line no-useless-catch
        try {

            this._bufferMessageListeners.forEach((listener: ClientArrayBufferMessageHandler) => {

                listener(message);
            });
            return;
        } catch (error) {

            throw error;
        }
    }

    public addUTF8MessageListener(listener: ClientUTF8MessageHandler): this {

        this._utf8MessageListeners.add(listener);
        return this;
    }

    public removeUTF8MessageListener(listener: ClientUTF8MessageHandler): this {

        this._utf8MessageListeners.delete(listener);
        return this;
    }

    public addJSONMessageListener(listener: ClientJSONMessageHandler): this {

        this._jsonMessageListeners.add(listener);
        return this;
    }

    public removeJSONMessageListener(listener: ClientJSONMessageHandler): this {

        this._jsonMessageListeners.delete(listener);
        return this;
    }

    public addBufferMessageListener(listener: ClientArrayBufferMessageHandler): this {

        this._bufferMessageListeners.add(listener);
        return this;
    }

    public removeBufferMessageListener(listener: ClientArrayBufferMessageHandler): this {

        this._bufferMessageListeners.delete(listener);
        return this;
    }

    private _emitUTF8OrJsonMessage(message: string): this {

        try {

            const parsed: string = JSON.parse(message);
            this._jsonMessageListeners.forEach((listener: ClientJSONMessageHandler) => {

                listener(parsed);
            });
        } catch (error) {

            this._utf8MessageListeners.forEach((listener: ClientUTF8MessageHandler) => {

                listener(message);
            });
        }
        return this;
    }
}
