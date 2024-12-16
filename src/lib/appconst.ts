import { message } from "antd";

export enum FileUploadType {
	Avatar = 0,
	Symbols = 1,
	Contracts = 2,
	MemberCard = 3,
	Billing = 4,
	Author = 5,
	Supplier = 6,
	Pubisher = 7,
	Update = 8,
	Refund = 9,

};

export enum EComponentUpload {
	None = 0,
	Vending_product = 1,
	APK = 2,
	Avatar = 3,
};
export enum EventTable {
	ChangeStatus,
	Delete,
	Edit,
	RowDoubleClick,
	View,
	SetErrorStatus,
	ChangeMoney,
	History,
	Accept,
	GiveBack,
	Receive,
	ViewDetail,
	Login,
	Statistics,
	ViewMap,
	MapDirection,
	Rename,
	DownLoad,
}

export const pageSizeOptions = ['1','10', '20', '50', '100', '200', '500'];
//định nghĩa tính năng của table
export const cssCol = (col: number) => {
	return {
		xs: { span: col },
		sm: { span: col },
		md: { span: col },
		lg: { span: col },
		xl: { span: col },
		xxl: { span: col },
	};
}
export const cssColResponsiveSpan = (xs: number, sm: number, md: number, lg: number, xl: number, xxl: number,) => {
	return {
		xs: { span: xs },
		sm: { span: sm },
		md: { span: md },
		lg: { span: lg },
		xl: { span: xl },
		xxl: { span: xxl },
	};
}
export enum RouterPath {
	g_ = "/g",
	g_login = "/g/login",
	g_forgot = "/g/forgot",
	g_exception = "/g/exception",
	g_rechargemoney = "/g/rechargemoney",
	g_rechargemoney2 = "/g/rechargemoney2",
	g_greenconsumerfunds = "/g/greenconsumerfunds",
	admin = "/",
	admin_home = "/",
	admin_dashboard = "/dashboard",
	admin_borrow = "/borrow",
	admin_buy = "/buy",
	admin_buy_importing_receipt = "/buy/importing-receipt",
	admin_check = "/check",
	admin_document = "/document",
	admin_general = "/general",
	admin_general_author = "/general/author",
	admin_general_field = "/general/fields",
	admin_report = "/report",
	admin_resource = "/resources",
	admin_subscriber = "/subscriber",
	admin_system = "/system",
	admin_information = "/information",
	admin_logout = "/logout",
	admin_general_supplier = "/general/supplier",
	admin_general_languages = "/general/languages",
	admin_statistic = "/statistic",
	admin_billing = "/billing",
	admin_importing = "/importing",
	admin_commodity = "/comodity",
	admin_history = "/history",
	admin_monitor = "/monitor",
	admin_reconsile = "/reconsile",
	admin_daily_operator = "/daily_operator",
	layout = "/layout",
	product = "/product",
};
export const AppConsts = {
	userManagement: {
		defaultAdminUserName: 'admin',
	},
	maxLength: {
		name: 500,
		address: 100,
		description: 200,
		password: 8,
		cccd: 12,
		email: 256,
		phone: 10,
		code: 30,
		money: 4,
		language: 50,
		price: 6,
		cost: 10,
		nameMachine: 100,
		ten: 64,
		codeSoft: 10,
		layout: 50,
		mediaName: 20,
	},
	max: {
		money: 9_999_999,
	},
	PAGESIZE: 20,
	localization: {
		defaultLocalizationSourceName: 'MIGViet',
	},

	appBaseUrl: process.env.REACT_APP_APP_BASE_URL,
	remoteServiceBaseUrl: process.env.REACT_APP_REMOTE_SERVICE_BASE_URL,


	Permission: {
		Pages_Admin_Dashboard: "Pages.Admin.Dashboard",
		Pages_Guests: "Pages.Guests",
		//HỆ THỐNG
		Pages_Manager_System: "Pages.Manager.System",
		Pages_Manager_System_Tenants: "Pages.Manager.System.Tenants",

		Pages_Manager_System_Users: "Pages.Manager.System.Users",
		Pages_Manager_System_Roles: "Pages.Manager.System.Roles",
		Pages_Manager_System_AuditLog: "Pages.Manager.System.AuditLog",
		Pages_Manager_System_Users_Edit: "Pages.Manager.System.Users.Edit",
		Pages_Manager_System_Users_Create: "Pages.Manager.System.Users.Create",
		Pages_Manager_System_Users_Delete: "Pages.Manager.System.Users.Delete",
		Pages_Manager_System_Roles_Edit: "Pages.Manager.System.Roles.Edit",
		Pages_Manager_System_Roles_Create: "Pages.Manager.System.Roles.Create",
		Pages_Manager_System_Roles_Delete: "Pages.Manager.System.Roles.Delete",
		Pages_Manager_System_AuditLog_Delete: "Pages.Manager.System.AuditLog.Delete",
		Pages_Manager_System_AuditLog_Search: "Pages.Manager.System.AuditLog.Search",

		//QUẢN LÝ CHUNG
		Pages_Users_Activation: "Pages.Users.Activation",

		//ROUTE
		Pages_Manager_General: "Pages.Manager.Genaral",
		Pages_Manager_General_Machine: "Pages.Manager.Genaral.Machine",
		Pages_Manager_General_MachineDetail: "Pages.Manager.Genaral.MachineDetail",
		Pages_Manager_General_RFID: "Pages.Manager.Genaral.RFID",
		Pages_Manager_General_Discount: "Pages.Manager.Genaral.DiscountCode",
		Pages_Manager_General_ReportOfMachine: "Pages.Manager.Genaral.ReportOfMachine",
		Pages_Manager_General_GroupMachine: "Pages.Manager.Genaral.GroupMachine",
		Pages_Manager_General_Supplier: "Pages.Manager.Genaral.Supplier",
		Pages_Manager_General_Drink: "Pages.Manager.Genaral.Drink",
		Pages_Manager_General_FreshDrink: "Pages.Manager.Genaral.FreshDrink",
		Pages_Manager_General_MachineSoft: "Pages.Manager.Genaral.MachineSoft",
		Pages_Manager_General_Image: "Pages.Manager.Genaral.Image",
		Pages_Manager_General_Product: "Pages.Manager.Genaral.Product",
		Pages_Manager_General_Layout: "Pages.Manager.Genaral.Layout",
		Pages_Manager_General_Update: "Pages.Manager.Genaral.Update",
		Pages_Manager_General_Repository: "Pages.Manager.Genaral.Repository",
		Pages_Manager_General_Import_Repository: "Pages.Manager.Genaral.ImportRepository",
		//Pages_Manager_General_Transfer_Repository: "Pages.Manager.Genaral.TransferRepository",
		Pages_Manager_General_Export_Repository: "Pages.Manager.Genaral.ExportRepository",
		Pages_Manager_Genaral_Trashbin: "Pages.Manager.Genaral.Trashbin",
		Pages_Manager_General_MachineLocationLogs :"Pages.Manager.Genaral.MachineLocationLogs",
		Pages_Manager_General_Authorization_Machine: "Pages.Manager.Genaral.AuthorizationMachine",



		//ADMIN
		Pages_Manager_General_Admin_Machine: "Pages.Manager.Genaral.Admin.Machine",
		Pages_Manager_General_Admin_RFID: "Pages.Manager.Genaral.Admin.RFID",
		Pages_Manager_General_Admin_Discount: "Pages.Manager.Genaral.Admin.DiscountCode",
		Pages_Manager_General_Admin_ReportOfMachine: "Pages.Manager.Genaral.Admin.ReportOfMachine",
		Pages_Manager_General_Admin_GroupMachine: "Pages.Manager.Genaral.Admin.GroupMachine",
		Pages_Manager_General_Admin_Supplier: "Pages.Manager.Genaral.Admin.Supplier",
		Pages_Manager_General_Admin_Drink: "Pages.Manager.Genaral.Admin.Drink",
		Pages_Manager_General_Admin_FreshDrink: "Pages.Manager.Genaral.Admin.FreshDrink",
		Pages_Manager_General_Admin_MachineSoft: "Pages.Manager.Genaral.Admin.MachineSoft",
		Pages_Manager_General_Admin_Image: "Pages.Manager.Genaral.Admin.Image",
		Pages_Manager_General_Admin_Product: "Pages.Manager.Genaral.Admin.Product",
		Pages_Manager_General_Admin_Repository: "Pages.Manager.Genaral.Admin.Repository",
		Pages_Manager_General_Admin_ImportRepository: "Pages.Manager.Genaral.Admin.ImportRepository",
		Pages_Manager_General_Admin_ExportRepository: "Pages.Manager.Genaral.Admin.ImportRepository",
		Pages_Manager_General_Admin_Handover: "Pages.Manager.Genaral.Admin.Handover",


		// CHỨC NĂNG
		Pages_Manager_General_Machine_Export: "Pages.Manager.Genaral.Machine.Export",
		Pages_Manager_General_Machine_Update: "Pages.Manager.Genaral.Machine.Update",
		Pages_Manager_General_Machine_BulkAction: "Pages.Manager.Genaral.Machine.BulkAction",
		Pages_Manager_General_MachineLocationLogs_ViewDetail :"Pages.Manager.Genaral.MachineLocationLogs.ViewDetail",
		Pages_Manager_General_MachineDetail_Update: "Pages.Manager.Genaral.MachineDetail.Update",
		Pages_Manager_General_Supplier_Create: "Pages.Manager.Genaral.Supplier.Create",
		Pages_Manager_General_Supplier_Update: "Pages.Manager.Genaral.Supplier.Update",
		Pages_Manager_General_Supplier_Export: "Pages.Manager.Genaral.Supplier.Export",
		Pages_Manager_General_Supplier_Import: "Pages.Manager.Genaral.Supplier.Import",
		Pages_Manager_General_Supplier_Delete: "Pages.Manager.Genaral.Supplier.Delete",
		Pages_Manager_General_RFID_Export: "Pages.Manager.Genaral.RFID.Export",
		Pages_Manager_General_RFID_BulkAction: "Pages.Manager.Genaral.RFID.BulkAction",
		Pages_Manager_General_RFID_Create: "Pages.Manager.Genaral.RFID.Create",
		Pages_Manager_General_RFID_Delete: "Pages.Manager.Genaral.RFID.Delete",
		Pages_Manager_General_RFID_Import: "Pages.Manager.Genaral.RFID.Import",
		Pages_Manager_General_RFID_ChangeMoney: "Pages.Manager.Genaral.RFID.ChangeMoney",
		Pages_Manager_General_Discount_Export: "Pages.Manager.Genaral.DiscountCode.Export",
		Pages_Manager_General_Discount_BulkAction: "Pages.Manager.Genaral.Discount.BulkAction",
		Pages_Manager_General_Discount_Create: "Pages.Manager.Genaral.Discount.Create",
		Pages_Manager_General_Discount_Delete: "Pages.Manager.Genaral.Discount.Delete",
		Pages_Manager_General_Discount_Import: "Pages.Manager.Genaral.Discount.Import",
		Pages_Manager_General_Discount_Update: "Pages.Manager.Genaral.Discount.Update",
		Pages_Manager_General_ReportOfMachine_Export: "Pages.Manager.Genaral.ReportOfMachine.Export",
		Pages_Manager_General_ReportOfMachine_Update: "Pages.Manager.Genaral.ReportOfMachine.Update",
		Pages_Manager_General_GroupMachine_Export: "Pages.Manager.Genaral.GroupMachine.Export",
		Pages_Manager_General_GroupMachine_Create: "Pages.Manager.Genaral.GroupMachine.Create",
		Pages_Manager_General_GroupMachine_Delete: "Pages.Manager.Genaral.GroupMachine.Delete",
		Pages_Manager_General_GroupMachine_Update: "Pages.Manager.Genaral.GroupMachine.Update",
		Pages_Manager_General_MachineSoft_Export: "Pages.Manager.Genaral.MachineSoft.Export",
		Pages_Manager_General_MachineSoft_Create: "Pages.Manager.Genaral.MachineSoft.Create",
		Pages_Manager_General_MachineSoft_Update: "Pages.Manager.Genaral.MachineSoft.Update",
		Pages_Manager_General_Image_Create: "Pages.Manager.Genaral.Image.Create",
		Pages_Manager_General_Image_Delete: "Pages.Manager.Genaral.Image.Delete",
		Pages_Manager_General_Product_Create: "Pages.Manager.Genaral.Product.Create",
		Pages_Manager_General_Product_Update: "Pages.Manager.Genaral.Product.Update",
		Pages_Manager_General_Product_Delete: "Pages.Manager.Genaral.Product.Delete",
		Pages_Manager_General_Product_Export: "Pages.Manager.Genaral.Product.Export",
		Pages_Manager_General_Product_Import: "Pages.Manager.Genaral.Product.Import",
		Pages_Manager_General_ImportRepository_Create: "Pages.Manager.Genaral.ImportRepository.Create",
		Pages_Manager_General_ImportRepository_Update: "Pages.Manager.Genaral.ImportRepository.Update",
		Pages_Manager_General_ImportRepository_Export: "Pages.Manager.Genaral.ImportRepository.Export",
		Pages_Manager_General_ImportRepository_Delete: "Pages.Manager.Genaral.ImportRepository.Export",
		Pages_Manager_General_TransferRepository_Create: "Pages.Manager.Genaral.TransferRepository.Create",
		Pages_Manager_General_TransferRepository_Update: "Pages.Manager.Genaral.TransferRepository.Update",
		Pages_Manager_General_TransferRepository_Export: "Pages.Manager.Genaral.TransferRepository.Export",
		Pages_Manager_General_TransferRepository_Delete: "Pages.Manager.Genaral.TransferRepository.Delete",
		Pages_Manager_General_ExportRepository_Create: "Pages.Manager.Genaral.ExportRepository.Create",
		Pages_Manager_General_ExportRepository_Export: "Pages.Manager.Genaral.ExportRepository.Export",
		Pages_Manager_General_Handover_Export: "Pages.Manager.Genaral.Handover.Export",
		Pages_Manager_General_Handover_Create: "Pages.Manager.Genaral.Handover.Create",
		Pages_Manager_General_Handover_Update: "Pages.Manager.Genaral.Handover.Update",
		Pages_Manager_General_Layout_Create: "Pages.Manager.Genaral.Layout.Create",
		Pages_Manager_General_Layout_Export: "Pages.Manager.Genaral.Layout.Export",
		Pages_Manager_General_Layout_Delete: "Pages.Manager.Genaral.Layout.Delete",
		Pages_Manager_General_Layout_Update: "Pages.Manager.Genaral.Layout.Update",
		Pages_Manager_General_Repository_Export: "Pages.Manager.Genaral.Layout.Export",
		Pages_Manager_General_Repository_Detail: "Pages.Manager.Genaral.Layout.Detail",
		Pages_Manager_General_Trashbin_Delete: "Pages.Manager.Genaral.Trashbin.Delete",
		Pages_Manager_General_Trashbin_Create: "Pages.Manager.Genaral.Trashbin.Create",
		Pages_Manager_General_Trashbin_Update: "Pages.Manager.Genaral.Trashbin.Update",

		// LỊCH SỬ
		Pages_History: "Pages.History",
		//ROUTE
		Pages_History_ChiTietBanHang: "Pages.History.ChiTietBanHang",
		Pages_History_ChiTietGiaoDichTheoTungMay: "Pages.History.ChiTietGiaoDichTheoTungMay",
		Pages_History_LichSuNhapHang: "Pages.History.LichSuNhapHang",
		Pages_History_CanhBao: "Pages.History.CanhBao",
		Pages_History_LichSuThanhToan: "Pages.History.LichSuThanhToan",
		//ADMIN
		Pages_History_Admin_ChiTietBanHang: "Pages.History.Admin.ChiTietBanHang",
		Pages_History_Admin_ChiTietGiaoDichTheoTungMay: "Pages.History.Admin.ChiTietGiaoDichTheoTungMay",
		Pages_History_Admin_LichSuNhapHang: "Pages.History.Admin.LichSuNhapHang",
		Pages_History_Admin_CanhBao: "Pages.History.Admin.CanhBao",
		Pages_History_Admin_LichSuThanhToan: "Pages.History.Admin.LichSuThanhToan",
		// CHỨC NĂNG
		Pages_History_ChiTietBanHang_Export: "Pages.History.ChiTietBanHang.Export",
		Pages_History_ChiTietGiaoDichTheoTungMay_Export: "Pages.History.ChiTietGiaoDichTheoTungMay.Export",
		Pages_History_LichSuNhapHang_Detail: "Pages.History.LichSuNhapHang.Detail",
		Pages_History_LichSuNhapHang_Export: "Pages.History.LichSuNhapHang.Export",
		Pages_History_LichSuNhapHang_Update: "Pages.History.LichSuNhapHang.Update",
		Pages_History_CanhBao_Export: "Pages.History.CanhBao.Export",

		// GIÁM SÁT
		Pages_DailyMonitoring: "Pages.DailyMonitoring",
		//ROUTE
		Pages_DailyMonitoring_MachineMonitor: "Pages.DailyMonitoring.Monitor",
		Pages_DailyMonitoring_DailySale: "Pages.DailyMonitoring.DailySale",
		Pages_DailyMonitoring_OutOfStock: "Pages.DailyMonitoring.OutOfStock",
		// ADMIN
		Pages_DailyMonitoring_Admin_Monitor: "Pages.DailyMonitoring.Admin.Monitor",
		Pages_DailyMonitoring_Admin_DailySale: "Pages.DailyMonitoring.Admin.DailySale",
		Pages_DailyMonitoring_Admin_OutOfStock: "Pages.DailyMonitoring.Admin.OutOfStock",
		//CHỨC NĂNG
		Pages_DailyMonitoring_MachineMonitor_Detail: "Pages.DailyMonitoring.Monitor.Detail",
		Pages_DailyMonitoring_MachineMonitor_Export: "Pages.DailyMonitoring.Monitor.Export",
		Pages_DailyMonitoring_DailySale_Export: "Pages.DailyMonitoring.DailySale.Export",
		Pages_DailyMonitoring_OutOfStock_Export: "Pages.DailyMonitoring.OutOfStock.Export",
		Pages_DailyMonitoring_OutOfStock_View: "Pages.DailyMonitoring.OutOfStock.View",
		Pages_DailyMonitoring_OutOfStock_ExportRepository: "Pages.DailyMonitoring.OutOfStock.ExportRepository",


		// THỐNG KÊ
		Pages_Statistic: "Pages.Statistic",
		//ROUTE
		Pages_Statistic_BillingOf24h: "Pages.Statistic.BillingOf24h",
		Pages_Statistic_BillingOfMachine: "Pages.Statistic.BillingOfMachine",
		Pages_Statistic_BillingOfPayment: "Pages.Statistic.BillingOfPayment",
		Pages_Statistic_BillingOfProduct: "Pages.Statistic.BillingOfProduct",
		Pages_Statistic_BillingOfProductWithMachine: "Pages.Statistic.BillingOfProductWithMachine",
		Pages_Statistic_ImportOfMachine: "Pages.Statistic.ImportOfMachine",
		Pages_Statistic_DrinkType: "Pages.Statistic.DrinkType",
		Pages_Statistic_PriceUnit: "Pages.Statistic.PriceUnit",
		Pages_Statistic_MoneyWithdraw: "Pages.Statistic.MoneyWithdraw",
		Pages_Statistic_ImportSellRemainProduct: "Pages.Statistic.ImportSellRemainProduct",
		//ADMIN
		Pages_Statistic_Admin_BillingOf24h: "Pages.Statistic.Admin.BillingOf24h",
		Pages_Statistic_Admin_BillingOfMachine: "Pages.Statistic.Admin.BillingOfMachine",
		Pages_Statistic_Admin_BillingOfPayment: "Pages.Statistic.Admin.BillingOfPayment",
		Pages_Statistic_Admin_BillingOfProduct: "Pages.Statistic.Admin.BillingOfProduct",
		Pages_Statistic_Admin_BillingOfProductWithMachine: "Pages.Statistic.Admin.BillingOfProductWithMachine",
		Pages_Statistic_Admin_ImportOfMachine: "Pages.Statistic.Admin.ImportOfMachine",
		Pages_Statistic_Admin_DrinkType: "Pages.Statistic.Admin.DrinkType",
		Pages_Statistic_Admin_PriceUnit: "Pages.Statistic.Admin.PriceUnit",
		Pages_Statistic_Admin_MoneyWithdraw: "Pages.Statistic.Admin.MoneyWithdraw",
		Pages_Statistic_Admin_ImportSellRemainProduct: "Pages.Statistic.Admin.ImportSellRemainProduct",
		//CHỨC NĂNG
		Pages_Statistic_BillingOf24h_Export: "Pages.Statistic.BillingOf24h.Export",
		Pages_Statistic_BillingOfMachine_Export: "Pages.Statistic.BillingOfMachine.Export",
		Pages_Statistic_BillingOfPayment_Export: "Pages.Statistic.BillingOfPayment.Export",
		Pages_Statistic_BillingOfProduct_Export: "Pages.Statistic.BillingOfProduct.Export",
		Pages_Statistic_BillingOfProductWithMachine_Export: "Pages.Statistic.BillingOfProductWithMachine.Export",
		Pages_Statistic_ImportOfMachine_Export: "Pages.Statistic.ImportOfMachine.Export",
		Pages_Statistic_DrinkType_Export: "Pages.Statistic.DrinkType.Export",
		Pages_Statistic_PriceUnit_Export: "Pages.Statistic.PriceUnit.Export",
		Pages_Statistic_MoneyWithdraw_Export: "Pages.Statistic.MoneyWithdraw.Export",
		Pages_Statistic_Drink_Export: "Pages.Statistic.Drink.Export",
		Pages_Statistic_FreshDrink_Export: "Pages.Statistic.FreshDrink.Export",
		Pages_Statistic_ImportSellRemainProduct_Export: "Pages.Statistic.ImportSellRemainProduct.Export",
		// 
		Pages_Admin_Statistic_MoneyWithdraw_ChangeStatus: "Pages.Statistic.MoneyWithdraw.ChangeStatus",


		//ĐỐI SOÁT
		Pages_Reconcile: "Pages.Reconcile",
		//ROUTE
		Pages_Reconcile_Refund: "Pages.Reconcile.Refund",
		Pages_Reconcile_Reconcile: "Pages.Reconcile.Reconcile",
		//ADMIN
		Pages_Reconcile_Admin_Refund: "Pages.Reconcile.Admin.Refund",
		Pages_Reconcile_Admin_Reconcile: "Pages.Reconcile.Admin.Reconcile",
		//CHỨC NĂNG
		Pages_Reconcile_Refund_Export: "Pages.Reconcile.Refund.Export",
		Pages_Reconcile_Reconcile_Export: "Pages.Reconcile.Reconcile.Export",
		Pages_Reconcile_Refund_Update: "Pages.Reconcile.Refund.Update",
		Pages_Reconcile_Refund_Detail: "Pages.Reconcile.Refund.Detail",
		Pages_Reconcile_Reconcile_Create: "Pages.Reconcile.Reconcile.Create",
		Pages_Reconcile_Reconcile_Confirm: "Pages.Reconcile.Reconcile.Confirm",
		Pages_Reconcile_Reconcile_DetailBilling: "Pages.Reconcile.Reconcile.DetailBilling",
		Pages_Reconcile_Reconcile_DetailRechargeRFID: "Pages.Reconcile.Reconcile.DetailRechargeRFID",
		Pages_Reconcile_Reconcile_Withdraw: "Pages.Reconcile.Reconcile.Withdraw",
	},

	Granted_Permissions_Const: {
		Pages_Admin: { name: "Pages.Admin", display_name: "Pages.Admin" },
		Pages_Manager_System: { name: "Pages.Manager.System", display_name: "Quyền hệ thống" },
		// Pages_Guests: { name: "Pages.Guests", display_name: "Pages.Guests" },
		// Pages_Users_Activation: { name: "Pages.Users.Activation", display_name: "Pages.Users.Activation" },
		Pages_DailyMonitoring: { name: "Pages.DailyMonitoring", display_name: "Quyền giám sát" },
		Pages_Manager_General: { name: "Pages.Manager.Genaral", display_name: "Quyền quản lý chung" },
		Pages_History: { name: "Pages.History", display_name: "Quyền lịch sử" },
		Pages_Statistic: { name: "Pages.Statistic", display_name: "Quyền thống kê" },
		Pages_Reconcile: { name: "Pages.Reconcile", display_name: "Quyền đối soát" },

	},

	authorization: {
		releaseDate: 'releaseDate',
		encrptedAuthTokenName: 'enc_auth_token',
		initSheetData: 'get_All_Sheet_Data',
		factoryIdSelected: 'factory_Id_Selected',
		userId: 'id',
		fullName: 'name',
		avatar: 'avatar',
	},

	cssPanelMain: {
		left: cssCol(24),
		right: cssCol(10)
	},
	cssRightMain: {
		left: cssCol(14),
		right: cssCol(0),
	},

	formItemLayout: {
		labelCol: cssCol(8),
		wrapperCol: cssCol(16),
	},
	formItem: {
		labelCol: cssCol(12),
		wrapperCol: cssCol(12),
	},

	formItemLayoutTitleLarge: {
		labelCol: cssCol(12),
		wrapperCol: cssCol(12),
	},

	formItemLayoutTitleSmall: {
		labelCol: cssCol(6),
		wrapperCol: cssCol(18),
	},
	formItemNumber(labelCol: number, wrapperCol: number) {
		return {
			labelCol: cssCol(labelCol),
			wrapperCol: cssCol(wrapperCol),
		}
	},
	cssPanel(span: number) {
		return {
			xs: { span: span },
			sm: { span: span },
			md: { span: span },
			lg: { span: span },
			xl: { span: span },
			xxl: { span: span },
		}
	},
	numberWithCommas(x) {
		var parts = x.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	},
	formatNumber(price: number | undefined): string {
		if (price === undefined || isNaN(price)) {
			price = 0;
		}
		return new Intl.NumberFormat('en-US').format(price);
	},
	formatPassword(pass: string): boolean {
		let expression = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,32}$/gm;
		return expression.test(pass);

	},
	testEmail(email: string) {
		const pattern = /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;
		return pattern.test(email);

	},
	testPhoneNumber(phoneNumber: string) {
		const pattern = /^\s*(?:\+?(\d{1,3}))?[- (]*(\d{3})[- )]*(\d{3})[- ]*(\d{4})(?: *[x/#]{1}(\d+))?\s*$/;
		return pattern.test(phoneNumber);

	},
	testNumber(value: string) {
		const pattern = /^[0-9]$/;
		return pattern.test(value);
	},
	convertResourceFile(numberConvert: number) {
		const CONVERT_KB = numberConvert;
		const CONVERT_MB = ((CONVERT_KB) / (1024)).toFixed(2);
		const CONVERT_GB = ((CONVERT_KB) / (1024 * 1024)).toFixed(2);
		if (Number(CONVERT_GB) >= 1) {
			return `${CONVERT_GB}(gb)`;
		}
		if (Number(CONVERT_MB) >= 1) {
			return `${CONVERT_MB}(mb)`;
		}
		return `${CONVERT_KB}(kb)`;
	},
	boDauTiengViet1(chuoi) {
		const tiengVietCoDau = "aàáảãạâầấẩẫậăằắẳẵặeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵđ";
		const tiengVietKhongDau = "aaaaaaaaaaaaaaaaaaeeeeeeeeeeeeiiiiiioooooooooooooooooouuuuuuuuuuuuyyyyyydd";

		const mapTiengViet = {};
		for (let i = 0; i < tiengVietCoDau.length; i++) {
			mapTiengViet[tiengVietCoDau[i]] = tiengVietKhongDau[i];
		}

		let result = "";
		for (let i = 0; i < chuoi.length; i++) {
			const char = chuoi[i];
			result += mapTiengViet[char] || char;
		}

		return result;
	},
	boDauTiengViet(chuoi) {
		const tiengVietCoDau = "aàáảãạâầấẩẫậăằắẳẵặeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵ";
		const tiengVietKhongDau = "aaaaaaââââââăăăăăăeeeeeeêêêêêêiiiiiiooooooôôôôôôơơơơơơuuuuuuưưưưưưyyyyyy";

		for (let i = 0; i < tiengVietCoDau.length; i++) {
			try {
				chuoi = chuoi.replace(new RegExp(tiengVietCoDau[i], "g"), tiengVietKhongDau[i]);
			}
			catch (err) {

			}
		}

		return chuoi;
	},
	calculatorCarbonCredit(weight: number) { //gram
		return weight / 1000000; //ton
	},
	calculatorPlasticCredit(weight: number) { //gram
		return (weight * 3) / 1000000; //ton
	},
	actionDirection(lat: string, lng: string) {
		if (lat != '0.0' && lng != '0.0') {
			window.open(`http://maps.google.com/maps?daddr=${Number(lat)},${Number(lng)}`, '_blank', 'noopener,noreferrer');
		}
		else message.warning("Chưa có dữ liệu về vị trí máy bán nước này!");

	},
	isValidLocation(lat?: string, lng?: string) {
		if (!lat || !lng || lat == '0.0' || lng == '0.0' || lat == '0' || lng == '0') {
			return false;
		}
		return true
	}

};
export default AppConsts;
