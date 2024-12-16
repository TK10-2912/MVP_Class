import './App.css';

import * as React from 'react';

import Router from '@components/Router';
import SessionStore from '@stores/sessionStore';
import Stores from '@stores/storeIdentifier';
import { inject } from 'mobx-react';
import signalRAspNetCoreHelper from '@lib/signalRAspNetCoreHelper';
import { stores } from './stores/storeInitializer';

export interface IAppProps {
	sessionStore?: SessionStore;
}

@inject(Stores.SessionStore)
class App extends React.Component<IAppProps> {
	async componentDidMount() {
		const session = this.props.sessionStore;
		await stores.settingStore.getAll();
		await session!.getCurrentLoginInformations();

		if (session!.isUserLogin() == true) {

			//if (session!.currentLogin!.application!.features!['SignalR.AspNetCore']) {
			// SignalRAspNetCoreHelper.initSignalR();
			//}
			let user = session!.getUserLogin();

			//if (user.us_type==eUserType.Manager.num) {
			// session!.getInformationsToManager();
			//}
			// abp.event.on('abp.notifications.received', function(mess) { // Register for connect event
			// 	console.log("Hi everybody,"+JSON.stringify(mess)); // Send a message to the server
			// });
			// const connection = new signalR.HubConnectionBuilder()
			// 	.withUrl(AppConsts.remoteServiceBaseUrl + "migvnotify")
			// 	.build();

			// connection.start().then(function () {
			// 	connection.invoke("Register").catch(function (err) {
			// 		return console.error(err.toString());
			// 	});
			// }).catch(function (err) {
			// 	return console.error(err.toString());
			// });

			// connection.on("notifyForUser", function (message) {
			// 	console.log("Received message: " + message);
			// });
			await signalRAspNetCoreHelper.initConnection();
			await signalRAspNetCoreHelper.startConnection(user.id);

		}
	}
	
	public render() {
		return <Router />;
	}
}

export default App;
