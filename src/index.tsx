import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as moment from 'moment';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';
import Utils from './utils/utils';
import abpUserConfigurationService from './services/abpUserConfigurationService';
import { stores } from './stores/storeInitializer';
import registerServiceWorker from './registerServiceWorker';
import { AppConsts } from './lib/appconst';
import momenttimezone from 'moment-timezone';
import './index.css';

declare var abp: any;

Utils.setLocalization();
// let params = new URLSearchParams(window.location.search);
// const _token = params.get('token');
// const _path = params.get('path');
// if(_token){
//   const token = String(_token);	
//   abp.auth.setToken(token, new Date(new Date().getTime() + 1000 * 86400));
//   if(abp.session.userId){
//     if(_path){
//       const path = decodeURIComponent(_path);
//       HistoryHelper.redirect(path)
//     }
//   }
// }
abpUserConfigurationService.getAll().then(async data => {

	Utils.extend(true, abp, data.data.result);
	abp.clock.provider = Utils.getCurrentClockProvider(data.data.result.clock.provider);

	momenttimezone.tz.setDefault('Asia/Ho_Chi_Minh');
	moment.locale('vi');
	//moment.locale('en');
	// moment.locale(abp.localization.currentLanguage.name);

	if (abp.clock.provider.supportsMultipleTimezone) {
		//moment.tz.setDefault(abp.timing.timeZoneInfo.iana.timeZoneId);
	}


	if (abp.session.userId) {
		const session = stores.sessionStore;
		if (session !== undefined) {

			await session!.getCurrentLoginInformations();
			if (session!.isUserLogin()) {
				if (session!.getUserLogin() !== undefined) {
					// let user = session!.getUserLogin();

				}
				let _releaseDate = abp.utils.getCookieValue(AppConsts.authorization.releaseDate);
				if (!!_releaseDate) {
					if (_releaseDate !== session!.currentLogin.application!.releaseDate!.toString()) {
						abp.utils.deleteCookie(AppConsts.authorization.initSheetData);
						abp.utils.deleteCookie(AppConsts.authorization.releaseDate);
						abp.utils.setCookieValue(AppConsts.authorization.releaseDate, session!.currentLogin.application!.releaseDate!.toString(), new Date(new Date().getTime() + 5 * 365 * 86400000), abp.appPath, true);
					}
				}
			}
		}
	}


	ReactDOM.render(
		<Provider {...stores}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</Provider>,
		document.getElementById('root') as HTMLElement
	);

	registerServiceWorker();
});
