import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import ProtectedRoute from '@components/Router/ProtectedRoute';
import UserLayout from '@components/Layout/UserLayout';
import AppLayout from '@components/Layout/AppLayout';
import { RouterPath } from '@src/lib/appconst';
import AppLayoutMobile from '../Layout/AppLayoutMobile';


const Router = () => {
	const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1200);

	React.useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 1200);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<Switch>
			<Route path={RouterPath.g_} render={(props: any) => <UserLayout {...props} />} />
			<ProtectedRoute
				path={RouterPath.admin}
				render={(props: any) =>
					isMobile ? (
						<AppLayoutMobile {...props} exact />
					) : (
						<AppLayout {...props} exact />
					)
				}
			/>		
		</Switch>
	);
};

export default Router;
