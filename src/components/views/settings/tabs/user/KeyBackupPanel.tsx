/*
Copyright 2024 New Vector Ltd.
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.
Copyright 2018 New Vector Ltd

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

import React, { useCallback, useEffect, useState } from "react";
import { KeyBackupInfo } from "matrix-js-sdk/src/crypto-api";
import { logger } from "matrix-js-sdk/src/logger";

import { _t } from "../../../../../languageHandler";
import LabelledToggleSwitch from "../../../elements/LabelledToggleSwitch";
import { useMatrixClientContext } from "../../../../../contexts/MatrixClientContext";
import InlineSpinner from "../../../elements/InlineSpinner";
import Modal from "../../../../../Modal";
import CreateKeyBackupDialog from "../../../../../async-components/views/dialogs/security/CreateKeyBackupDialog";

const KeyBackupPanel: React.FC = () => {
    const cli = useMatrixClientContext();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);
    const [backupInfo, setBackupInfo] = useState<KeyBackupInfo | null>(null);
    const [activeBackupVersion, setActiveBackupVersion] = useState<string | null>(null);

    const loadBackupStatus = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const backupInfo = await cli.getKeyBackupVersion();
            //const backupTrustInfo = backupInfo ? await cli.getCrypto()?.isKeyBackupTrusted(backupInfo) : undefined;

            const activeBackupVersion = (await cli.getCrypto()?.getActiveSessionBackupVersion()) ?? null;

            setLoading(false);
            setBackupInfo(backupInfo);
            setActiveBackupVersion(activeBackupVersion);
        } catch (e) {
            logger.log("Unable to fetch key backup status", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [cli]);

    const startNewBackup = useCallback(() => {
        Modal.createDialogAsync(
            import(
                "../../../../../async-components/views/dialogs/security/CreateKeyBackupDialog"
            ) as unknown as Promise<typeof CreateKeyBackupDialog>,
            {
                onFinished: () => {
                    loadBackupStatus();
                },
            },
            undefined,
            /* priority = */ false,
            /* static = */ true,
        );
    }, [loadBackupStatus]);

    useEffect(() => {
        // async, but handles its own exceptions
        loadBackupStatus();
    }, [loadBackupStatus]);

    const onAllowKeyStorageChange = useCallback(
        (checked: boolean) => {
            if (checked) {
                startNewBackup();
            }
        },
        [startNewBackup],
    );

    if (loading) {
        return <InlineSpinner />;
    }

    if (error) {
        return <p>{_t("settings|encryption|error_loading_key_backup_status")}</p>;
    }

    return (
        <>
            <p>
                {_t("settings|encryption|key_storage_body", undefined, {
                    a: (sub: string) => (
                        <a href="https://element.io/help#encryption5" target="_blank" rel="noreferrer noopener">
                            {sub}
                        </a>
                    ),
                })}
            </p>
            <LabelledToggleSwitch
                label={_t("settings|encryption|allow_key_storage")}
                value={Boolean(backupInfo && activeBackupVersion)}
                onChange={onAllowKeyStorageChange}
            />
        </>
    );
};

export default KeyBackupPanel;
