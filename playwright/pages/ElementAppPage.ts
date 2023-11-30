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

import { type Locator, type Page } from "@playwright/test";

import { Settings } from "./settings";
import { Client } from "./client";

export class ElementAppPage {
    public constructor(private readonly page: Page) {}

    public settings = new Settings(this.page);
    public client: Client = new Client(this.page);

    /**
     * Open the top left user menu, returning a Locator to the resulting context menu.
     */
    public async openUserMenu(): Promise<Locator> {
        return this.settings.openUserMenu();
    }

    /**
     * Open room creation dialog.
     */
    public async openCreateRoomDialog(): Promise<Locator> {
        await this.page.getByRole("button", { name: "Add room", exact: true }).click();
        await this.page.getByRole("menuitem", { name: "New room", exact: true }).click();
        return this.page.locator(".mx_CreateRoomDialog");
    }

    /**
     * Close dialog currently open dialog
     */
    public async closeDialog(): Promise<void> {
        return this.settings.closeDialog();
    }

    /**
     * Opens the given room by name. The room must be visible in the
     * room list, but the room list may be folded horizontally, and the
     * room may contain unread messages.
     *
     * @param name The exact room name to find and click on/open.
     */
    public async viewRoomByName(name: string): Promise<void> {
        // We look for the room inside the room list, which is a tree called Rooms.
        //
        // There are 3 cases:
        // - the room list is folded:
        //     then the aria-label on the room tile is the name (with nothing extra)
        // - the room list is unfolder and the room has messages:
        //     then the aria-label contains the unread count, but the title of the
        //     div inside the titleContainer equals the room name
        // - the room list is unfolded and the room has no messages:
        //     then the aria-label is the name and so is the title of a div
        //
        // So by matching EITHER title=name OR aria-label=name we find this exact
        // room in all three cases.
        return this.page
            .getByRole("tree", { name: "Rooms" })
            .locator(`[title="${name}"],[aria-label="${name}"]`)
            .first()
            .click();
    }

    /**
     * Get the composer element
     * @param isRightPanel whether to select the right panel composer, otherwise the main timeline composer
     */
    public async getComposer(isRightPanel?: boolean): Promise<Locator> {
        const panelClass = isRightPanel ? ".mx_RightPanel" : ".mx_RoomView_body";
        return this.page.locator(`${panelClass} .mx_MessageComposer`);
    }

    /**
     * Open the message composer kebab menu
     * @param isRightPanel whether to select the right panel composer, otherwise the main timeline composer
     */
    public async openMessageComposerOptions(isRightPanel?: boolean): Promise<Locator> {
        const composer = await this.getComposer(isRightPanel);
        await composer.getByRole("button", { name: "More options", exact: true }).click();
        return this.page.getByRole("menu");
    }
}