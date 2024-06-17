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
 * Copyright 2016-2020 ForgeRock AS.
 * Portions copyright 2024 Wren Security.
 */

/**
 * @module org/forgerock/openam/ui/admin/services/realm/identities/UsersService
 */
import { map, omitBy, startsWith } from "lodash";

import AbstractDelegate from "org/forgerock/commons/ui/common/main/AbstractDelegate";
import Constants from "org/forgerock/openam/ui/common/util/Constants";
import constructFieldParams from "org/forgerock/openam/ui/admin/services/constructFieldParams";
import constructPaginationParams from "org/forgerock/openam/ui/admin/services/constructPaginationParams";
import fetchUrl from "org/forgerock/openam/ui/common/services/fetchUrl";

const obj = new AbstractDelegate(`${Constants.host}/${Constants.context}/json`);

// FIXME: template operation needs to be implemented
function getTemplate (realm) {
    return obj.serviceCall({
        url: fetchUrl("/users?_action=template", { realm }),
        headers: { "Accept-API-Version": "protocol=2.0,resource=3.0" },
        type: "POST"
    });
}

// FIXME: schema operation needs to be implemented
export function getSchema (realm) {
    return obj.serviceCall({
        url: fetchUrl("/users?_action=schema", { realm }),
        headers: { "Accept-API-Version": "protocol=2.0,resource=3.0" },
        type: "POST"
    });
}

export function getInitialState (realm) {
    return Promise.all([getSchema(realm), getTemplate(realm)]).then((response) => ({
        schema: response[0],
        values: response[1]
    }));
}

// FIXME: pagination does not seem to work at all
export function getAll (realm, additionalParams = {}) {
    const pagination = constructPaginationParams(additionalParams.pagination);
    const fields = constructFieldParams(additionalParams.fields);
    return obj.serviceCall({
        url: fetchUrl(`/users?_queryFilter=true${pagination}${fields}`, { realm }),
        headers: { "Accept-API-Version": "protocol=2.1,resource=3.0" }
    });
}

export function remove (realm, ids) {
    const promises = map(ids, (id) => obj.serviceCall({
        url: fetchUrl(`/users/${encodeURIComponent(id)}`, { realm }),
        headers: { "Accept-API-Version": "protocol=2.1,resource=3.0" },
        suppressSpinner: true,
        type: "DELETE",
        errorsHandlers : { "Forbidden": { status: 403 } }
    }));

    return Promise.all(promises);
}

/**
 * Fetch a list of users from the realm that start with the prefix.
 *
 * @param {string} id User ID prefix.
 * @param {(string|boolean)} [realm=false] Realm.
 * @returns {Promise<Array.<string>>} Promise with list of users.
 */
export function getByIdStartsWith (id, realm = false) {
    return obj.serviceCall({
        url: fetchUrl(`/users?_queryId=${id}*`, { realm }),
        headers: { "Accept-API-Version": "protocol=1.0,resource=1.0" }
    }).then((response) => response.result);
}

// FIXME: pagination does not seem to work at all
export function searchUsers (realm, additionalParams = {}) {
    const pagination = constructPaginationParams(additionalParams.pagination);
    const fields = constructFieldParams(additionalParams.fields);
    const term = additionalParams.pagination?.searchTerm;
    const queryFilter = term ? encodeURIComponent(`_id co "${term}" or cn co "${term}" or mail co "${term}"`) : "true";
    // FIXME: this request does not return anonymous and amadmin, legacy UI displays them
    // Using _queryId=* instead of _queryFilter=true returns amadmin and anonymous user,
    // but also other special identities (amService-URLAccessAgent and dsameuser).
    // Legacy UI seems to use equivalent query to _queryId=* but it filters out special identities (see EntitiesViewBean.java#303)
    return obj.serviceCall({
        url: fetchUrl(`/users?_queryFilter=${queryFilter}${pagination}${fields}`, { realm }),
        headers: { "Accept-API-Version": "protocol=2.1, resource=3.0" }
    });
}

export function get (realm, id) {
    return obj.serviceCall({
        url: fetchUrl(`/users/${encodeURIComponent(id)}`, { realm }),
        headers: { "Accept-API-Version": "protocol=2.1,resource=3.0" }
    });
}

export function update (realm, data, id) {
    const omitReadOnlyProperties = (obj) => omitBy(obj, (prop, key) => startsWith(key, "_"));
    return obj.serviceCall({
        url: fetchUrl(`/users/${encodeURIComponent(id)}`, { realm }),
        type: "PUT",
        headers: {
            "Accept-API-Version": "protocol=2.0,resource=3.0",
            "If-Match": "*"
        },
        // CREST Protocol 2.0 payload must not transmit _rev
        data: JSON.stringify(omitReadOnlyProperties(data))
    });
}

export function create (realm, data, id) {
    return obj.serviceCall({
        url: fetchUrl(`/users/${encodeURIComponent(id)}`, { realm }),
        type: "PUT",
        headers: {
            "Accept-API-Version": "protocol=2.1,resource=3.0",
            "If-None-Match": "*"
        },
        data: JSON.stringify(data)
    });
}
