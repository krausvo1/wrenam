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
 * Copyright 2017-2019 ForgeRock AS.
 */

import { t } from "i18next";
import React from "react";
import { Tab, Tabs } from "react-bootstrap";

import ListGroupsContainer from "./groups/list/ListGroupsContainer";
import ListUsersContainer from "./users/list/ListUsersContainer";
import PageHeader from "components/PageHeader";
import withRouter from "org/forgerock/commons/ui/common/components/hoc/withRouter";
import withRouterPropType from "org/forgerock/commons/ui/common/components/hoc/withRouterPropType";

const Identities = () => {
    return (
        <div>
            <PageHeader title={ t("console.identities.title") } />
            <Tabs animation={ false } defaultActiveKey={ 1 } id="identities" mountOnEnter unmountOnExit>
                <Tab eventKey={ 1 } title={ t("console.identities.tabs.0") }>
                    <ListUsersContainer />
                </Tab>
                <Tab eventKey={ 2 } title={ t("console.identities.tabs.1") }>
                    <ListGroupsContainer />
                </Tab>
            </Tabs>
        </div>
    );
};

Identities.propTypes = {
    router: withRouterPropType
};

export default withRouter(Identities);
