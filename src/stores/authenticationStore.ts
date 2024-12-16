import { action, observable } from 'mobx';
import http from '@services/httpService';

import AppConsts, { RouterPath } from '@lib/appconst';
import LoginModel from '@models/Login/loginModel';
import { AuthenticateModel, ExternalAuthenticateModel, ExternalLoginProviderInfoModel, TokenAuthService } from '@services/services_autogen';
import HistoryHelper from '@src/lib/historyHelper';
import { message } from 'antd';

declare var abp: any;

class AuthenticationStore {
	private tokenAuthService: TokenAuthService;

	@observable loginModel: LoginModel = new LoginModel();
	@observable listExternalAuthenticate: ExternalLoginProviderInfoModel[] = [];
	constructor() {
		this.tokenAuthService = new TokenAuthService("", http);
	}
	get isAuthenticated(): boolean {
		if (!abp.session.userId) return false;

		return true;
	}

	@action
	public async login(model: AuthenticateModel) {
		let result = await this.tokenAuthService.authenticate(model);

		var tokenExpireDate = model.rememberClient ? new Date(new Date().getTime() + 1000 * result.expireInSeconds) : undefined;
		abp.auth.setToken(result.accessToken, tokenExpireDate);
		abp.utils.setCookieValue(AppConsts.authorization.encrptedAuthTokenName, result.encryptedAccessToken, tokenExpireDate, abp.appPath, false);
	}
	@action
	public async adminLoginWithoutPassword(username: string | undefined, tenantId: number | undefined,) {
		let result = await this.tokenAuthService.adminLoginWithoutPassword(username, tenantId);
		if (result) {
			var tokenExpireDate = new Date(new Date().getTime() + 1000 * result.expireInSeconds) 
			abp.auth.setToken(result.accessToken, tokenExpireDate);
			abp.utils.setCookieValue(AppConsts.authorization.encrptedAuthTokenName, result.encryptedAccessToken, tokenExpireDate, abp.appPath, false);
			window.location.href=RouterPath.admin_dashboard;
		}
	}

	@action
	public async adminLoginUserWithoutPassword(us_id:number) {
		let result = await this.tokenAuthService.adminLoginUserWithoutPassword(us_id);
		if (result) {
			var tokenExpireDate = new Date(new Date().getTime() + 1000 * result.expireInSeconds) 
			abp.auth.setToken(result.accessToken, tokenExpireDate);
			abp.utils.setCookieValue(AppConsts.authorization.encrptedAuthTokenName, result.encryptedAccessToken, tokenExpireDate, abp.appPath, false);
			window.location.href=RouterPath.admin_dashboard;
		}
	}

	public async getExternalAuthenticationProviders() {
		let result = await this.tokenAuthService.getExternalAuthenticationProviders();
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listExternalAuthenticate = result.items;
			return;
		}
		this.listExternalAuthenticate = [];

	}
	public async externalAuthenticate(body: ExternalAuthenticateModel) {
		let reuslt = await this.tokenAuthService.externalAuthenticate(body);
	}
	@action
	logout() {
		sessionStorage.clear();
		abp.auth.clearToken();
	}
}
export default AuthenticationStore;
