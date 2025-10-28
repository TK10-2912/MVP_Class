import RoleStore from '@stores/roleStore';
import TenantStore from '@stores/tenantStore';
import UserStore from '@stores/userStore';
import SessionStore from '@stores/sessionStore';
import AuthenticationStore from '@stores/authenticationStore';
import AccountStore from '@stores/accountStore';
import AuditLogStore from '@stores/auditLogStore';
import SupplierStore from './supplierStore';
import WebHookSubcription from './hookSubscriptionStore';
import HookSendAttempt from './hookSendAttempt'
import ApplicationStore from './appicationStore';
import SettingStore from './settingStore';
import DashboardStore from './dashboardStore';
import OrganizationStore from './organizationStore';
import MachineStore from './machineStore';
import MachineDetailStore from './machineDetailStore';
import StatisticStore from './statisticStore';
import { BillingStore } from './billingStore';
import ImportingStore from './importingStore';
import FileStore from './fileStore';
import ReportOfMachineStore from './reportOfMachineStore';
// import PaymentBankStore from '.Bank';
import RFIDStore from './RFIDStore';
import RFIDLogs from './rfidLogs';
import GroupMachineStore from './groupMachineStore';
import PaymentBankStore from './paymentBank';
import DailyMonitorStore from './dailyMonitorStore';
import HistoryStore from './historyStore';
import WithdrawStore from './withdrawStore';
import { MachineSoftStore } from './machineSoft';
import ImageProductStore from './imageProductStore';
import AuthorizationMachineStore from './authorizationMachineStore';
import ImportRepositoryStore from './importRepositoryStore';
import ProductStore from './productStore';
import RepositoryStore from './repositoryStore';
import ExportRepositoryStore from './exportRepositoryStore';
import LayoutStore from './layoutStore';
import NotificationStore from './notificationStore';
import FileMediaStore from './fileMediaStore';
import  TransferRepositoryStore from './transferRepositoryStore';


function initializeStores() {

	return {
		authenticationStore: new AuthenticationStore(),
		roleStore: new RoleStore(),
		tenantStore: new TenantStore(),
		userStore: new UserStore(),
		sessionStore: new SessionStore(),
		organizationStore: new OrganizationStore(),
		accountStore: new AccountStore(),
		auditLogStore: new AuditLogStore(),
		supplierStore: new SupplierStore(),
		webHookSubcriptionStore: new WebHookSubcription(),
		hookSendAttemptStore: new HookSendAttempt(),
		applicationStore: new ApplicationStore(),
		settingStore: new SettingStore(),
		dashboardStore: new DashboardStore(),
		machineStore: new MachineStore(),
		machineDetailStore: new MachineDetailStore(),
		statisticStore: new StatisticStore(),
		billingStore: new BillingStore(),
		importingStore: new ImportingStore(),
		paymentBank: new PaymentBankStore(),
		rfidLogStore: new RFIDLogs(),
		RFIDStore: new RFIDStore(),
		fileStore: new FileStore(),
		reportOfMachineStore: new ReportOfMachineStore(),
		groupMachineStore: new GroupMachineStore(),
		dailyMonitorStore: new DailyMonitorStore(),
		historyStore: new HistoryStore(),
		withDrawStore: new WithdrawStore(),
		machineSoftStore: new MachineSoftStore(),
		imageProductStore: new ImageProductStore(),
		authorizationMachineStore: new AuthorizationMachineStore(),
		importRepositoryStore: new ImportRepositoryStore(),
		productStore: new ProductStore(),
		repositoryStore: new RepositoryStore(),
		transferRepositoryStore: new TransferRepositoryStore(),
		exportRepositoryStore: new ExportRepositoryStore(),
		layoutStore: new LayoutStore(),
		notificationStore: new NotificationStore(),
		fileMediaStore: new FileMediaStore(),
	};
}
export const stores = initializeStores();
