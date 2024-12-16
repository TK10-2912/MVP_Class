import * as React from 'react';

import AuthenticationStore from '@stores/authenticationStore';
import Stores from '@stores/storeIdentifier';
import { inject } from 'mobx-react';
import { RouterPath } from '@src/lib/appconst';
import signalRAspNetCoreHelper from '@src/lib/signalRAspNetCoreHelper';
import { stores } from '@src/stores/storeInitializer';

export interface ILogoutProps {
	authenticationStore?: AuthenticationStore;
}

@inject(Stores.AuthenticationStore)
class Logout extends React.Component<ILogoutProps> {
	async componentDidMount() {
		if (stores.sessionStore!.isUserLogin() == true) {
			await signalRAspNetCoreHelper.stopConnection(stores.sessionStore.getUserLogin().id);
		}

		abp.multiTenancy.setTenantIdCookie(undefined);
		this.props.authenticationStore!.logout();

		window.location.href = RouterPath.admin;
	}

	render() {
		return null;
	}
}

export default Logout;
