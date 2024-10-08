/*
Copyright 2024 New Vector Ltd.
Copyright 2019-2023 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

import React from "react";
import { logger } from "matrix-js-sdk/src/logger";

import SettingsTab from "../SettingsTab";
import { SettingsSection } from "../../shared/SettingsSection";
import KeyBackupPanel from "./KeyBackupPanel";
import { _t } from "../../../../../languageHandler";

interface Props {
    closeSettingsFn: () => void;
}

const EncryptionUserSettingsTab: React.FC<Props> = () => {
    return (
        <SettingsTab>
            <SettingsSection heading={_t("settings|encryption|key_storage_title")}>
                <KeyBackupPanel />
            </SettingsSection>
        </SettingsTab>
    );
};

export default EncryptionUserSettingsTab;
