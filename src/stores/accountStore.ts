import { action, observable } from 'mobx';
import http from '@services/httpService';

import {
	AccountService,
	IsTenantAvailableOutput,
	IsTenantAvailableInput,
	RegisterOutput,
	RegisterInput,
	RegisterMemberInput
} from '@services/services_autogen';

class AccountStore {
	private accountService: AccountService;

	@observable tenant: IsTenantAvailableOutput = new IsTenantAvailableOutput();
	constructor() {
		this.accountService = new AccountService("", http);
	}
	@action
	public isTenantAvailable = async (tenancyName: string) => {
		let input: IsTenantAvailableInput = new IsTenantAvailableInput({ tenancyName: tenancyName });
		this.tenant = await this.accountService.isTenantAvailable(input);
	};
	@action
	public register = async (input: RegisterInput) => {
		let res: RegisterOutput = await this.accountService.register(input);
		return res;
	};
	@action
	public registerMember = async (input: RegisterMemberInput | undefined) => {
		let res: RegisterOutput = await this.accountService.registerMember(input);
		return res;
	};
	// @action
	// public getCodeResetPassViaSMS = async (phoneNumber: string) => {
	// 	await this.accountService.get(phoneNumber);

	// };
	@action
	public forgotPasswordViaEmail = async (email: string) => {
		return await this.accountService.forgotPasswordViaEmail(email);

	};
	@action
	public resetPasswordViaEmail = async (token: string | undefined, email: string | undefined, password: string | undefined) => {
		return await this.accountService.resetPasswordViaEmail(token, email, password);
	};

}

export default AccountStore;
