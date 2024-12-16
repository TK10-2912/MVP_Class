import * as React from 'react';
import { ExportRepositoryDto } from '@src/services/services_autogen';
import ExportRepositoryUser from './componentUser';
import ExportRepositoryAdmin from './componentAdmin';

export default class ImportRepository extends React.Component {
    render() {
        return (
            <>
                {
                    // 1 == 1
                    //     ?
                    <ExportRepositoryUser />
                    // :
                    // <ExportRepositoryAdmin />
                }
            </>
        )
    }
}