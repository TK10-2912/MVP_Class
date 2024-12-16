import * as React from 'react';

import AuthenticationStore from '@stores/authenticationStore';
import Stores from '@stores/storeIdentifier';
import { inject } from 'mobx-react';
import { RouterPath } from '@src/lib/appconst';

export interface ILogoutProps {
	authenticationStore?: AuthenticationStore;
}

@inject(Stores.AuthenticationStore)
class Logout extends React.Component<ILogoutProps> {
	componentDidMount() {
		this.props.authenticationStore!.logout();
		window.location.href = RouterPath.admin;
	}

	render() {
		return null;
	}
}

export default Logout;
