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
import DiscountCodeStore from './discountCode';
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
import RefundStore from './refundStore';
import ReconcileStore from './reconcileStore';
import ReconcileLogsStore from './reconcileLogs';
import ImageProductStore from './imageProductStore';
import AuthorizationMachineStore from './authorizationMachineStore';
import ImportRepositoryStore from './importRepositoryStore';
import ProductStore from './productStore';
import RepositoryStore from './repositoryStore';
import ExportRepositoryStore from './exportRepositoryStore';
import LayoutStore from './layoutStore';
import HandoverStore from './handoverStore';
import NotificationStore from './notificationStore';
import TrashBinStore from './trashBinStore';
import GroupTrashBinStore from './groupTrashBinStore';
import FileMediaStore from './fileMediaStore';
import HardwareStore  from './hardwareStore';
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
		discountCodeStore: new DiscountCodeStore(),
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
		refundStore: new RefundStore(),
		reconcileStore: new ReconcileStore(),
		reconcileLogsStore: new ReconcileLogsStore(),
		imageProductStore: new ImageProductStore(),
		authorizationMachineStore: new AuthorizationMachineStore(),
		importRepositoryStore: new ImportRepositoryStore(),
		productStore: new ProductStore(),
		repositoryStore: new RepositoryStore(),
		transferRepositoryStore: new TransferRepositoryStore(),
		exportRepositoryStore: new ExportRepositoryStore(),
		layoutStore: new LayoutStore(),
		handoverStore: new HandoverStore(),
		notificationStore: new NotificationStore(),
		trashBinStore: new TrashBinStore(),
		groupTrashBinStore: new GroupTrashBinStore(),
		fileMediaStore: new FileMediaStore(),
		hardWareStore: new HardwareStore(),
	};
}
export const stores = initializeStores();
