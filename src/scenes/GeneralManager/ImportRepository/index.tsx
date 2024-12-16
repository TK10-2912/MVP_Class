import * as React from 'react';
import ImportRepositoryAdmin from './ImportRepositoryAdmin';
import ImportRepositoryUser from './ImportRepositoryUser';

export default class ImportRepository extends React.Component {
    render() {
        return (
            <>
                {
                    <ImportRepositoryAdmin />
                }
            </>
        )
    }
}