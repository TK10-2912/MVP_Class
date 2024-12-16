import { action, observable } from 'mobx';
import http from '@services/httpService';
import { HostSettingsEditDto, HostSettingsService, SendTestEmailInput, } from '@services/services_autogen';

class SettingStore {
	private hostSettingsService: HostSettingsService;

	@observable hostSetting: HostSettingsEditDto = new HostSettingsEditDto();
	constructor() {
		this.hostSettingsService = new HostSettingsService("", http);
	}

	@action
	public getAll = async () => {
		let result = await this.hostSettingsService.getAllSettings();
		this.hostSetting = result;
	}

	@action
	public updateSetting = async (input: HostSettingsEditDto | undefined) => {
		await this.hostSettingsService.updateAllSettings(input);
	}

	@action
	public sendTestEmail = async (input: SendTestEmailInput | undefined) => {
		await this.hostSettingsService.sendTestEmail(input);
	}

	@action
	public getEnabledSocialLoginSettings = async () => {
		let result = await this.hostSettingsService.getEnabledSocialLoginSettings();
		return result.enabledSocialLoginSettings;
	}
}

export default SettingStore;
