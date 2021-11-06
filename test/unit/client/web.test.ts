/**
 * @author WMXPY
 * @namespace SocketClient_Web
 * @description Web
 * @override Unit Test
 */

import { expect } from "chai";
import * as Chance from "chance";
import { SocketClientWeb } from "../../../src";

describe('Given {SocketClientWeb} Class', (): void => {

    const chance: Chance.Chance = new Chance('web-web');

    it('should be able to construct', (): void => {

        const client: SocketClientWeb = SocketClientWeb.create(chance.url());

        expect(client).to.be.instanceOf(SocketClientWeb);
    });
});
