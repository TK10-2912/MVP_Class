import http from '@services/httpService';
import { CreateExportRepositoryInput, CreateImportRepositoryInput, RepositoryDto, ImportRepositoryDto, CreateRepositoryInput, ERepositoryProductStatus, NotificationService, UserNotification, UpdateStateNotificationInput, PageResultNotificationDto, CustomUserNotification } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class NotificationStore {
	private notificationService: NotificationService;

	@observable totalNotification: number = 0;
	@observable totalUnreadNotification: number = 0;
	@observable notificationListResult: CustomUserNotification[] = [];
	constructor() {
		this.notificationService = new NotificationService("", http);
	}

	@action
	public getAll = async (skipCount: number | undefined, maxResultCount: number | undefined) => {
		let result = await this.notificationService.getUserNotifications(skipCount, maxResultCount);		
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalNotification = result.totalCount;
			this.totalUnreadNotification = result.numberOfUnreadMessage;
			this.notificationListResult = result.items;
		}
	}
	@action
	public updateStateNotification = async (input: UpdateStateNotificationInput) => {
		if (input != undefined && input.notificationId != "" && input.notificationId != undefined) {
			let result: boolean = await this.notificationService.updateStateNotification(input);
			if (!!result) {
				return result
			} else return false
		}
	}
	@action
	public updateAllStateNotification = async (typeNotification: number | undefined ) => {
		let result: boolean = await this.notificationService.updateAllStateNotification(typeNotification);
		if (!!result) {
			return result
		} else return false;
	}
}

export default NotificationStore;