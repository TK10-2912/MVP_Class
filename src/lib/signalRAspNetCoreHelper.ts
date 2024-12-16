import AppConsts from './appconst';
import Util from '@utils/utils';
import * as signalR from '@microsoft/signalr';
declare var abp: any;

class SignalRAspNetCoreHelper {
	private connection: signalR.HubConnection | null = null;
	// initSignalR() {
	// 	var encryptedAuthToken = abp.utils.getCookieValue(AppConsts.authorization.encrptedAuthTokenName);

	// 	abp.signalr = {
	// 		autoConnect: true,
	// 		connect: undefined,
	// 		hubs: undefined,
	// 		qs: AppConsts.authorization.encrptedAuthTokenName + '=' + encodeURIComponent(encryptedAuthToken),
	// 		remoteServiceBaseUrl: AppConsts.remoteServiceBaseUrl,
	// 		url: '/migvnotify'
	// 	};

	// 	Util.loadScript(AppConsts.appBaseUrl + '/abp.signalr-client.js');
	// }

	constructor() {
		this.connection = null;
	}

	// Initialize the SignalR connection
	initConnection() {
		if (!this.connection) {

			this.connection = new signalR.HubConnectionBuilder()
				.withUrl(AppConsts.remoteServiceBaseUrl + "migvnotify", )
				.build();
		}
		return this.connection;
	}

	// Start the SignalR connection
	async startConnection(userId: number) {
		if (this.connection && this.connection.state === signalR.HubConnectionState.Disconnected) {
			try {
				let self = this;
				await this.connection.start().then(function () {
					self.connection!.invoke("Register", userId)
						.catch(function (err) {
							return console.error(err.toString());
						});
				}).catch(function (err) {
					return console.error(err.toString());
				});
				console.log("SignalR Connected!");
			} catch (err) {
				console.error("SignalR Connection Error: ", err);
			}
		}
	}

	// Stop the SignalR connection
	async stopConnection(userId: number) {
		if (this.connection) {
			try {
				this.connection!.invoke("UnRegister", userId)
					.catch(function (err) {
						return console.error(err.toString());
					});
				await this.connection.stop().catch(function (err) {
					return console.error(err.toString());
				});
				console.log("SignalR Disconnected.");
			} catch (err) {
				console.error("Error disconnecting SignalR: ", err);
			}
		}
	}

	// Register an event handler for receiving messages
	registerNotificationHandler(methodNames: string[], callbacks) {
		if (this.connection) {
			methodNames.forEach((methodName) => {
				this.connection!.on(methodName, (data) => {					
					// Iterate over the array of callback functions and call each one
					callbacks.forEach((callback) => {
						if (callback) {
							callback(data);  // Call each function
						}
					});
				});
			})
		}
	}


	// Send a message to the server
	async sendMessage(message) {
		if (this.connection) {
			try {
				await this.connection.invoke("SendNotify", message);
				console.log("Message sent: ", message);
			} catch (err) {
				console.error("Error sending message: ", err);
			}
		}
	}
}
export default new SignalRAspNetCoreHelper();
