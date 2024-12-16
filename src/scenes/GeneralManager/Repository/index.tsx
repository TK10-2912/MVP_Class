import AppComponentBase from '@src/components/Manager/AppComponentBase';
import * as React from 'react';
import RepositoryAdmin from './RepositoryAdmin';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import RepositoryUser from './RepositoryUser';
import TabPaneAdmin from './TabPaneAdmin';
import TabPaneUser from './TabPaneUser';
export default class Repository extends AppComponentBase {
    render() {
        return (<>
            {(isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Repository)) ?
                <TabPaneAdmin /> : <TabPaneUser />
            }
        </>)
    }
}