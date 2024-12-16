import './App.css';

import * as React from 'react';

import Router from '@components/Router';
import SessionStore from '@stores/sessionStore';
import SignalRAspNetCoreHelper from '@lib/signalRAspNetCoreHelper';
import Stores from '@stores/storeIdentifier';
import { inject } from 'mobx-react';

export interface IAppProps {
	sessionStore?: SessionStore;
}

@inject(Stores.SessionStore)
class App extends React.Component<IAppProps> {
	async componentDidMount() {
		const session = this.props.sessionStore;
		await session!.getCurrentLoginInformations();

		if (session!.isUserLogin() == true) {

			//if (session!.currentLogin!.application!.features!['SignalR.AspNetCore']) {
			SignalRAspNetCoreHelper.initSignalR();
			//}
			let user = session!.getUserLogin();
			//if (user.us_type==eUserType.Manager.num) {
			// session!.getInformationsToManager();
			//}
			abp.event.on('abp.notifications.received', function (mess) { // Register for connect event
				console.log("Hi everybody," + JSON.stringify(mess)); // Send a message to the server
			});
		}
	}

	public render() {
		return <Router />;
	}
}

export default App;
