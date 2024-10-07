/*
Copyright 2024 New Vector Ltd.
Copyright 2022 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

import React, { MouseEventHandler, ReactNode } from "react";
import { FormattingFunctions, AllActionStates, ActionState } from "@vector-im/matrix-wysiwyg";
import classNames from "classnames";

import { Icon as BoldIcon } from "../../../../../../res/img/element-icons/room/composer/bold.svg";
import { Icon as ItalicIcon } from "../../../../../../res/img/element-icons/room/composer/italic.svg";
import { Icon as UnderlineIcon } from "../../../../../../res/img/element-icons/room/composer/underline.svg";
import { Icon as StrikeThroughIcon } from "../../../../../../res/img/element-icons/room/composer/strikethrough.svg";
import { Icon as QuoteIcon } from "../../../../../../res/img/element-icons/room/composer/quote.svg";
import { Icon as InlineCodeIcon } from "../../../../../../res/img/element-icons/room/composer/inline_code.svg";
import { Icon as LinkIcon } from "../../../../../../res/img/element-icons/room/composer/link.svg";
import { Icon as BulletedListIcon } from "../../../../../../res/img/element-icons/room/composer/bulleted_list.svg";
import { Icon as NumberedListIcon } from "../../../../../../res/img/element-icons/room/composer/numbered_list.svg";
import { Icon as CodeBlockIcon } from "../../../../../../res/img/element-icons/room/composer/code_block.svg";
import { Icon as IndentIcon } from "../../../../../../res/img/element-icons/room/composer/indent_increase.svg";
import { Icon as UnIndentIcon } from "../../../../../../res/img/element-icons/room/composer/indent_decrease.svg";
import { _t } from "../../../../../languageHandler";
import AccessibleButton, { ButtonEvent } from "../../../elements/AccessibleButton";
import { openLinkModal } from "./LinkModal";
import { useComposerContext } from "../ComposerContext";
import { KeyboardShortcut } from "../../../settings/KeyboardShortcut";
import { KeyCombo } from "../../../../../KeyBindingsManager";

interface ButtonProps {
    icon: ReactNode;
    actionState: ActionState;
    onClick: MouseEventHandler<HTMLButtonElement>;
    label: string;
    keyCombo?: KeyCombo;
}

function Button({ label, keyCombo, onClick, actionState, icon }: ButtonProps): JSX.Element {
    return (
        <AccessibleButton
            element="button"
            onClick={onClick as (e: ButtonEvent) => void}
            aria-label={label}
            className={classNames("mx_FormattingButtons_Button", {
                mx_FormattingButtons_active: actionState === "reversed",
                mx_FormattingButtons_Button_hover: actionState === "enabled",
                mx_FormattingButtons_disabled: actionState === "disabled",
            })}
            title={actionState === "disabled" ? undefined : label}
            caption={
                keyCombo && (
                    <KeyboardShortcut value={keyCombo} className="mx_FormattingButtons_Tooltip_KeyboardShortcut" />
                )
            }
            placement="top"
        >
            {icon}
        </AccessibleButton>
    );
}

interface FormattingButtonsProps {
    composer: FormattingFunctions;
    actionStates: AllActionStates;
}

export function FormattingButtons({ composer, actionStates }: FormattingButtonsProps): JSX.Element {
    const composerContext = useComposerContext();
    const isInList = actionStates.unorderedList === "reversed" || actionStates.orderedList === "reversed";
    return (
        <div className="mx_FormattingButtons">
            <Button
                actionState={actionStates.bold}
                label={_t("composer|format_bold")}
                keyCombo={{ ctrlOrCmdKey: true, key: "b" }}
                onClick={() => composer.bold()}
                icon={<BoldIcon className="mx_FormattingButtons_Icon" />}
            />
            <Button
                actionState={actionStates.italic}
                label={_t("composer|format_italic")}
                keyCombo={{ ctrlOrCmdKey: true, key: "i" }}
                onClick={() => composer.italic()}
                icon={<ItalicIcon className="mx_FormattingButtons_Icon" />}
            />
            <Button
                actionState={actionStates.underline}
                label={_t("composer|format_underline")}
                keyCombo={{ ctrlOrCmdKey: true, key: "u" }}
                onClick={() => composer.underline()}
                icon={<UnderlineIcon className="mx_FormattingButtons_Icon" />}
            />
            <Button
                actionState={actionStates.strikeThrough}
                label={_t("composer|format_strikethrough")}
                onClick={() => composer.strikeThrough()}
                icon={<StrikeThroughIcon className="mx_FormattingButtons_Icon" />}
            />
            <Button
                actionState={actionStates.unorderedList}
                label={_t("composer|format_unordered_list")}
                onClick={() => composer.unorderedList()}
                icon={<BulletedListIcon className="mx_FormattingButtons_Icon" />}
            />
            <Button
                actionState={actionStates.orderedList}
                label={_t("composer|format_ordered_list")}
                onClick={() => composer.orderedList()}
                icon={<NumberedListIcon className="mx_FormattingButtons_Icon" />}
            />
            {isInList && (
                <Button
                    actionState={actionStates.indent}
                    label={_t("composer|format_increase_indent")}
                    onClick={() => composer.indent()}
                    icon={<IndentIcon className="mx_FormattingButtons_Icon" />}
                />
            )}
            {isInList && (
                <Button
                    actionState={actionStates.unindent}
                    label={_t("composer|format_decrease_indent")}
                    onClick={() => composer.unindent()}
                    icon={<UnIndentIcon className="mx_FormattingButtons_Icon" />}
                />
            )}
            <Button
                actionState={actionStates.quote}
                label={_t("action|quote")}
                onClick={() => composer.quote()}
                icon={<QuoteIcon className="mx_FormattingButtons_Icon" />}
            />
            <Button
                actionState={actionStates.inlineCode}
                label={_t("composer|format_inline_code")}
                keyCombo={{ ctrlOrCmdKey: true, key: "e" }}
                onClick={() => composer.inlineCode()}
                icon={<InlineCodeIcon className="mx_FormattingButtons_Icon" />}
            />
            <Button
                actionState={actionStates.codeBlock}
                label={_t("composer|format_code_block")}
                onClick={() => composer.codeBlock()}
                icon={<CodeBlockIcon className="mx_FormattingButtons_Icon" />}
            />
            <Button
                actionState={actionStates.link}
                label={_t("composer|format_link")}
                onClick={() => openLinkModal(composer, composerContext, actionStates.link === "reversed")}
                icon={<LinkIcon className="mx_FormattingButtons_Icon" />}
            />
        </div>
    );
}
