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
 * Copyright 2023 ForgeRock AS.
 */

define([
    "org/forgerock/openam/ui/common/util/object/isPureObject"
], ({ isPureObject }) => {
    describe("isPureObject", () => {
        describe("primitives", () => {
            it("should return false", () => {
                const primitives = [
                    null,
                    undefined,
                    false,
                    42,
                    BigInt(9007199254740991),
                    "",
                    Symbol()
                ];

                primitives.forEach((val) => {
                    const isObj = isPureObject(val);

                    expect(isObj).to.be.false;
                });
            });
        });

        describe("objects", () => {
            it("should return false given complex object types", () => {
                const objects = [
                    new Boolean(true),
                    new Number(42),
                    new String("stub"),
                    Date(),
                    RegExp(),
                    [],
                    () => { }
                ];

                objects.forEach((val) => {
                    const isObj = isPureObject(val);

                    expect(isObj).to.be.false;
                });
            });

            it("should return true given pure objects", () => {
                const pureObjects = [
                    {},
                    {
                        object: {
                            "with": {
                                fields: "stub-field"
                            }
                        }
                    }
                ];

                pureObjects.forEach((val) => {
                    const isObj = isPureObject(val);

                    expect(isObj).to.be.true;
                });
            });
        });
    });
});