import * as React from 'react';

import { Redirect, Route } from 'react-router-dom';

import { isGranted } from '@lib/abpUtility';
import { RouterPath } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';

declare var abp: any;

const ProtectedRoute = ({ path, component: Component, permission, render, ...rest }: any) => {
	const user= stores.sessionStore;
	return (
		<Route
			{...rest}
			render={props => {
				if (user.isUserLogin()==false )
					return (
						<Redirect
							to={{
								pathname: RouterPath.g_login,
								state: { from: props.location },
							}}
						/>
					);
				
				
				if (permission && !isGranted(permission)) {
					return (
						<Redirect
							to={{
								pathname: RouterPath.g_exception,
								state: { from: props.location },
							}}
						/>
					);
				}


				return Component ? <Component {...props} /> : render(props);
			}}
		/>
	);
};

export default ProtectedRoute;
