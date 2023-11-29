/*
Copyright 2023 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { uniqueId } from "lodash";
import { MatrixScheduler, MemoryCryptoStore, MemoryStore, RoomMemberEvent } from "matrix-js-sdk/src/matrix";
import Olm from "@matrix-org/olm";

import { getLogger } from "./log";
import type { AddSecretStorageKeyOpts } from "matrix-js-sdk/src/secret-storage";
import type { Credentials, HomeserverInstance } from "../../plugins/utils/homeserver";
import { MatrixBotClient } from "./MatrixBotClient";

interface CreateBotOpts {
    /**
     * A prefix to use for the userid. If unspecified, "bot_" will be used.
     */
    userIdPrefix?: string;
    /**
     * Whether the bot should automatically accept all invites.
     */
    autoAcceptInvites?: boolean;
    /**
     * The display name to give to that bot user
     */
    displayName?: string;
    /**
     * Whether or not to start the syncing client.
     */
    startClient?: boolean;
    /**
     * Whether or not to generate cross-signing keys
     */
    bootstrapCrossSigning?: boolean;
    /**
     * Whether to use the rust crypto impl. Defaults to false (for now!)
     */
    rustCrypto?: boolean;
    /**
     * Whether or not to bootstrap the secret storage
     */
    bootstrapSecretStorage?: boolean;
}

const defaultCreateBotOptions = {
    userIdPrefix: "bot_",
    autoAcceptInvites: true,
    startClient: true,
    bootstrapCrossSigning: true,
} as CreateBotOpts;

export class BotCreator {
    private olmPromise = (async () => {
        globalThis.Olm = Olm;
        await globalThis.Olm.init();
    })();

    private async setupBotClient(
        homeserver: HomeserverInstance,
        credentials: Credentials,
        opts: CreateBotOpts,
    ): Promise<MatrixBotClient> {
        await this.olmPromise;
        opts = Object.assign({}, defaultCreateBotOptions, opts);
        const logger = getLogger(`playwright bot ${credentials.userId}`);

        const keys = {};

        const getCrossSigningKey = (type: string) => {
            return keys[type];
        };

        const saveCrossSigningKeys = (k: Record<string, Uint8Array>) => {
            Object.assign(keys, k);
        };

        // Store the cached secret storage key and return it when `getSecretStorageKey` is called
        let cachedKey: { keyId: string; key: Uint8Array };
        const cacheSecretStorageKey = (keyId: string, keyInfo: AddSecretStorageKeyOpts, key: Uint8Array) => {
            cachedKey = {
                keyId,
                key,
            };
        };

        const getSecretStorageKey = () => Promise.resolve<[string, Uint8Array]>([cachedKey.keyId, cachedKey.key]);

        const cryptoCallbacks = {
            getCrossSigningKey,
            saveCrossSigningKeys,
            cacheSecretStorageKey,
            getSecretStorageKey,
        };

        const cli = new MatrixBotClient({
            baseUrl: homeserver.config.baseUrl,
            userId: credentials.userId,
            deviceId: credentials.deviceId,
            accessToken: credentials.accessToken,
            store: new MemoryStore(),
            scheduler: new MatrixScheduler(),
            cryptoStore: new MemoryCryptoStore(),
            logger: logger,
            cryptoCallbacks,
        });

        if (opts.autoAcceptInvites) {
            cli.on(RoomMemberEvent.Membership, (event, member) => {
                if (member.membership === "invite" && member.userId === cli.getUserId()) {
                    cli.joinRoom(member.roomId);
                }
            });
        }

        if (!opts.startClient) {
            return cli;
        }

        if (opts.rustCrypto) {
            await cli.initRustCrypto({ useIndexedDB: false });
        } else {
            await cli.initCrypto();
            console.log("initialized crypto!");
        }

        cli.setGlobalErrorOnUnknownDevices(false);
        await cli.startClient();

        if (opts.bootstrapCrossSigning) {
            await cli.getCrypto()!.bootstrapCrossSigning({
                authUploadDeviceSigningKeys: async (func) => {
                    await func({
                        type: "m.login.password",
                        identifier: {
                            type: "m.id.user",
                            user: credentials.userId,
                        },
                        password: credentials.password,
                    });
                },
            });
        }

        if (opts.bootstrapSecretStorage) {
            const passphrase = "new passphrase";
            const recoveryKey = await cli.getCrypto().createRecoveryKeyFromPassphrase(passphrase);
            Object.assign(cli, { __playwright_recovery_key: recoveryKey });

            await cli.getCrypto()!.bootstrapSecretStorage({
                setupNewSecretStorage: true,
                setupNewKeyBackup: true,
                createSecretStorageKey: () => Promise.resolve(recoveryKey),
            });
        }

        return cli;
    }

    /**
     * Returns a new Bot instance
     * @param opts create bot options
     */
    async create(homeserver: HomeserverInstance, opts: CreateBotOpts): Promise<MatrixBotClient> {
        opts = Object.assign({}, defaultCreateBotOptions, opts);
        const username = uniqueId(opts.userIdPrefix);
        const password = uniqueId("password_");
        console.log(`getBot: Create bot user ${username} with opts ${JSON.stringify(opts)}`);
        const credentials = await homeserver.registerUser(username, password, opts.displayName);
        const client = await this.setupBotClient(homeserver, credentials, opts);
        Object.assign(client, { __playwright_password: password });
        return client;
    }

    /**
     * Returns a new Bot instance logged in as an existing user
     * @param homeserver the instance on which to register the bot user
     * @param username the username for the bot to log in with
     * @param password the password for the bot to log in with
     * @param opts create bot options
     */
    async login(
        homeserver: HomeserverInstance,
        username: string,
        password: string,
        opts: CreateBotOpts,
    ): Promise<MatrixBotClient> {
        opts = Object.assign({}, defaultCreateBotOptions, { bootstrapCrossSigning: false }, opts);
        console.log(`getBotFromCredentials: log in as ${username} with opts ${JSON.stringify(opts)}`);
        const credentials = await homeserver.loginUser(username, password);
        return this.setupBotClient(homeserver, credentials, opts);
    }
}