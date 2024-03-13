/**
 * The contents of this file are subject to the terms of the Common Development and
 * Distribution License (the License). You may not use this file except in compliance with the
 * License.
 *
 * You can obtain a copy of the License at legal/CDDLv1.0.txt. See the License for the
 * specific language governing permission and limitations under the License.
 *
 * When distributing Covered Software, include this CDDL Header Notice in each file and include
 * the License file at legal/CDDLv1.0.txt. If applicable, add the following below the CDDL
 * Header, with the fields enclosed by brackets [] replaced by your own identifying
 * information: "Portions copyright [year] [name of copyright owner]".
 *
 * Copyright 2015-2016 ForgeRock AS.
 * Portions copyright 2024 Wren Security.
 */

import _ from "lodash";

/**
 * @module org/forgerock/openam/ui/common/util/object/isPureObject
 */

const COMPLEX_OBJECT_LIST = [Boolean, Number, String, RegExp, Date];

export const isPureObject = (value) => {
    if (!value) {
        return false;
    }

    const isComplexObject = (val) => COMPLEX_OBJECT_LIST.some((type) => val instanceof type);

    if (typeof value === "function" ||
        isComplexObject(value) ||
        Array.isArray(value)) {
        return false;
    }

    return _.isObject(value);
};
