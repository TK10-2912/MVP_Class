import { action, observable } from 'mobx';
import http from '@services/httpService';
import { WebhookSubscriptionService, GetAllSubscriptionsOutput, WebhookSubscription, ActivateWebhookSubscriptionInput, GetAllAvailableWebhooksOutput } from '@src/services/services_autogen';


class HookSubscriptionStore {
	private hookSubcriptionService: WebhookSubscriptionService;
	@observable webHookSubcriptionDtoListResult: GetAllSubscriptionsOutput[] = [];
	@observable availableWebHookListResult: GetAllAvailableWebhooksOutput[] = [];


	constructor() {
		this.hookSubcriptionService = new WebhookSubscriptionService("", http);
	}


	@action
	public getAllHookSubcription = async () => {
		this.webHookSubcriptionDtoListResult = [];
		let result = await this.hookSubcriptionService.getAllSubscriptions();
		if (result != undefined && result.items != undefined && result.items != null) {
			this.webHookSubcriptionDtoListResult = result.items;
		}
	}
	@action
	public getAllAvailableWebhooks = async () => {
		this.availableWebHookListResult = [];
		let result = await this.hookSubcriptionService.getAllAvailableWebhooks();
		if (result != undefined && result.items != undefined && result.items != null) {
			this.availableWebHookListResult = result.items;
		}
	}
	@action
	public getAllSubscriptionsIfFeaturesGranted = async (name: string) => {
		this.webHookSubcriptionDtoListResult = [];
		let result = await this.hookSubcriptionService.getAllSubscriptionsIfFeaturesGranted(name);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.webHookSubcriptionDtoListResult = result.items;
		}
	}

	@action
	public updateSubscription = async (input: WebhookSubscription) => {
		if (input == undefined || input == null) {
			return Promise.resolve<WebhookSubscription>(<any>null);
		}
		await this.hookSubcriptionService.updateSubscription(input);
	}

	@action
	public getSubcription = async (subscriptionId: string | undefined) => {
		if (subscriptionId === undefined) {
			return Promise.resolve<WebhookSubscription>(<any>null);
		}
		const result = await this.hookSubcriptionService.getSubscription(subscriptionId);
		if (!!result) {
			return Promise.resolve<WebhookSubscription>(<any>result);
		}
		return Promise.resolve<WebhookSubscription>(<any>null);
	}

	@action
	public activateWebhookSubscription = async (input: ActivateWebhookSubscriptionInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<WebhookSubscription>(<any>null);
		}
		await this.hookSubcriptionService.activateWebhookSubscription(input);
	}
	@action
	public isSubscribed = async (name: string) => {
		let result = await this.hookSubcriptionService.isSubscribed(name);
		if (result == true) return true;
		else return false;
	}
	@action
	public publishTestWebhook = async () => {
		let result = await this.hookSubcriptionService.publishTestWebhook();
		if (result != undefined) { return result; }
		else return false;
	}

	@action
	public addSubscription = async (input: WebhookSubscription) => {
		if (input == undefined || input == null) {
			return Promise.resolve<WebhookSubscription>(<any>null);
		}
		await this.hookSubcriptionService.addSubscription(input)
	}
	@action
	public deleteSubscription = async (idSubcription: string | undefined) => {
		if (idSubcription == undefined || idSubcription == null) {
			return Promise.resolve<WebhookSubscription>(<any>null);
		}
		await this.hookSubcriptionService.deleteWebhookSubscription(idSubcription)
	}

}

export default HookSubscriptionStore;