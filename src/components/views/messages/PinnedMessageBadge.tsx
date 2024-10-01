/*
 * Copyright 2024 New Vector Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
 * Please see LICENSE files in the repository root for full details.
 *
 */

import React, { JSX } from "react";
import { Icon as PinIcon } from "@vector-im/compound-design-tokens/icons/pin-solid.svg";

import { _t } from "../../../languageHandler.tsx";

/**
 * A badge to indicate that a message is pinned.
 */
export function PinnedMessageBadge(): JSX.Element {
    return (
        <div className="mx_PinnedMessageBadge">
            <PinIcon width="16" />
            {_t("room|pinned_message_badge")}
        </div>
    );
}
