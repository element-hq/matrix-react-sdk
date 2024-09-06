/*
* Copyright 2024 New Vector Ltd.
* Copyright 2024 The Matrix.org Foundation C.I.C.
*
* SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
* Please see LICENSE files in the repository root for full details.
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthType } from "matrix-js-sdk/src/interactive-auth";
import userEvent from "@testing-library/user-event";

import { EmailIdentityAuthEntry } from "../../../../src/components/views/auth/InteractiveAuthEntryComponents";
import { createTestClient } from "../../../test-utils";

describe("<EmailIdentityAuthEntry/>", () => {
    const renderIdentityAuth = () => {
        const matrixClient = createTestClient();

        return render(
            <EmailIdentityAuthEntry
                matrixClient={matrixClient}
                loginType={AuthType.Email}
                onPhaseChange={jest.fn()}
                submitAuthDict={jest.fn()}
                fail={jest.fn()}
                clientSecret="my secret"
                showContinue={true}
                inputs={{ emailAddress: "alice@example.xyz" }}
            />,
        );
    };

    test("should render", () => {
        const { container } = renderIdentityAuth();
        expect(container).toMatchSnapshot();
    });

    test("should clear the requested state when the button tooltip is hidden", async () => {
        renderIdentityAuth();

        // After a click on the resend button, the button should display the resent label
        screen.getByRole("button", { name: "Resend" }).click();
        await waitFor(() => expect(screen.queryByRole("button", { name: "Resent!" })).toBeInTheDocument());
        expect(screen.queryByRole("button", { name: "Resend" })).toBeNull();

        const resentButton = screen.getByRole("button", { name: "Resent!" });
        // Hover briefly the button and wait for the tooltip to be displayed
        await userEvent.hover(resentButton);
        await waitFor(() => expect(screen.getByRole("tooltip", { name: "Resent!" })).toBeInTheDocument());

        // On unhover, it should display again the resend button
        await act(() => userEvent.unhover(resentButton));
        await waitFor(() => expect(screen.queryByRole("button", { name: "Resend" })).toBeInTheDocument());
    });
});
