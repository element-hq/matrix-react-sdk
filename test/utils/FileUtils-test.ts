/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

import { MediaEventContent } from "matrix-js-sdk/src/types";

import { downloadLabelForFile } from "../../src/utils/FileUtils.ts";

describe("FileUtils", () => {
    describe("downloadLabelForFile", () => {
        it.each([
            [
                "File",
                {
                    input: {
                        msgtype: "m.file",
                        body: "Test",
                    } as MediaEventContent,
                    output: "Download file",
                },
            ],
            [
                "Image",
                {
                    input: {
                        msgtype: "m.image",
                        body: "Test",
                    } as MediaEventContent,
                    output: "Download image",
                },
            ],
            [
                "Video",
                {
                    input: {
                        msgtype: "m.video",
                        body: "Test",
                    } as MediaEventContent,
                    output: "Download video",
                },
            ],
            [
                "Audio",
                {
                    input: {
                        msgtype: "m.audio",
                        body: "Test",
                    } as MediaEventContent,
                    output: "Download audio",
                },
            ],
        ])("should correctly label %s", (_d, { input, output }) => expect(downloadLabelForFile(input)).toBe(output));
    });
});
