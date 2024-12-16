import * as React from 'react';

import { Route, Switch } from 'react-router-dom';

import ProtectedRoute from '@components/Router/ProtectedRoute';
import UserLayout from '@components/Layout/UserLayout';
import AppLayout from '@components/Layout/AppLayout';
import { RouterPath } from '@src/lib/appconst';

const Router = () => {
	return (
		<Switch>
			<Route path={RouterPath.g_} render={(props: any) => <UserLayout {...props} />} />
			<ProtectedRoute path={RouterPath.admin} render={(props: any) => <AppLayout {...props} exact />} />
		</Switch>
	);
};

export default Router;
