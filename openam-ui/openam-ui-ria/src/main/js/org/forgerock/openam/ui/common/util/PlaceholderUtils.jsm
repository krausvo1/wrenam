/*
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
 * Copyright 2022 ForgeRock AS.
 * Portions copyright 2024 Wren Security.
 */

import _ from "lodash";

import { isPureObject } from "org/forgerock/openam/ui/common/util/object/isPureObject";

/**
 * @module org/forgerock/openam/ui/common/util/PlaceholderUtils
 */

/**
 * RegExp to determine if a property is a placeholder
 * must be a string with numbers/letters/fullstops and enclosed by &{}
 */
const PLACEHOLDER_REGEX = new RegExp(/^([\w '"",.:/$£@]+)?(\&\{(([\w])+(\.[\w]+)*)\})([\w '"",.:/$£@]+)?$/);

/**
 * Determines if the given value is a valid placeholder
 * @param {string} value value that is possibly a placeholder
 * @returns {boolean} true if given value is a placeholder
 */
const isPlaceholder = (value) => {
    if (typeof value !== "string") { return false; }

    return PLACEHOLDER_REGEX.test(value);
};

/**
 * Determines if provided object contains a placeholder
 * @param {*} value the object which may contain/be a placeholder
 * @returns {boolean} boolean true if the object contains or is itself a placeholder
 */
const containsPlaceholder = (value) => {
    if (!value) { return false; }

    if (isPureObject(value)) {
        return Object.values(value).some((val) => isPlaceholder(val)); // Note: this does not handle placeholders nested deep within the object
    } else if (Array.isArray(value)) {
        return value.some((val) => isPlaceholder(val));
    }

    return isPlaceholder(value);
};

/**
 * Provides a string list of placeholders contained in the given object/array
 * @param {*} value placeholder object
 * @returns {*} list of string placeholders
 */
const handlePlaceholder = (value) => {
    if (isPureObject(value)) {
        return Object.values(value).filter((el) => isPlaceholder(el));
    } else if (Array.isArray(value)) {
        return value.filter((el) => isPlaceholder(el));
    } else {
        return value;
    }
    // TODO: what should the default return be for non objects/arrays?
};

/**
 * Provides a string list of placeholders contained in the given object/array
 * @param {array} arr array or array of arrays
 * @returns {array} single flattened array
 */
const flattenArr = (arr) => {
    return arr.reduce((flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? flattenArr(toFlatten) : toFlatten);
    }, []);
};

const PLACEHOLDER_TYPES = ["$bool", "$list", "$object", "$string", "$int"];

/**
 * Flattens an object that contains nested placeholders
 * placeholder must belong to one of the fields listed in {PLACEHOLDER_TYPES}
 * @param {*} obj the object containing the nested placeholder
 * @returns {object} a flattened object with placeholder fields at the top level
 */
const flattenPlaceholder = (obj) => {
    if (!isPureObject(obj)) { return obj; }

    const keys = Object.keys(obj);

    keys.forEach((key, index) => {
        const current = obj[key];
        PLACEHOLDER_TYPES.forEach((type) => {
            if (current && current[type]) {
                obj[keys[index]] = current[type];
            }
        });
        if (Array.isArray(obj[keys[index]])) {
            obj[keys[index]] = flattenArr(obj[keys[index]]);
        }
    });
    return obj;
};

/**
 * JSON helper function for displaying placeholder fields as readonly
 * @param {*} values the form data
 * @param {*} origSchema the original JSON object
 * @returns {object} a new object with readonly placeholders
 */
const convertPlaceholderSchemaToReadOnly = (values, origSchema) => {
    const schema = { ...origSchema };
  for (const key in values) { // eslint-disable-line
        let current = values[key];
        if (Array.isArray(current)) {
            current = flattenArr(current);
        }
        if (containsPlaceholder(current)) {
            schema.properties[key].readOnly = true;
            schema.properties[key].originalType = schema.properties[key].type;
            schema.properties[key].originalValue = current;
            schema.properties[key].type = "string";
            schema.properties[key].format = "string";
            if (schema.properties[key].options) {
                schema.properties[key].options.enum_titles.push(values[key]);
                schema.properties[key].enum.push(values[key]);
                schema.properties[key].enumNames.push(values[key]);
            }
        }
    }
    return schema;
};

/**
 * JSON helper function which reverts readonly changes to JSON object for saving
 * @param {*} values the form data
 * @param {*} origSchema the original JSON object
 * @returns {object} an new object without readonly placeholder information ready to save
 */
const revertPlaceholdersToOriginalValue = (values, origSchema) => {
    // values have read-only props, clone the object to be able to overwrite them
    // again
    const reverted = _.cloneDeep(values);
    if (values.raw) {
    for (const key in values.raw) { // eslint-disable-line
            const current = origSchema.raw.properties[key];
            if (current && current.properties) {
        for (const innerKey in current.properties) { // eslint-disable-line
                    const innerCurrent = current.properties[innerKey];
                    if (innerCurrent && innerCurrent.originalValue) {
                        reverted.raw[key][innerKey] = innerCurrent.originalValue;
                    }
                }
            } else if (current && current.originalValue) {
                reverted.raw[key] = current.originalValue;
            }
        }
    } else {
    for (const key in values) { // eslint-disable-line
            const current = origSchema.properties[key];
            if (current && current.originalValue) {
                reverted[key] = current.originalValue;
            }
        }
    }
    return reverted;
};

export {
    isPlaceholder,
    containsPlaceholder,
    handlePlaceholder,
    flattenPlaceholder,
    convertPlaceholderSchemaToReadOnly,
    revertPlaceholdersToOriginalValue,
    PLACEHOLDER_TYPES
};
