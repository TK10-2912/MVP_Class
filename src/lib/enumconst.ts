import { CheckCircleOutlined, CheckOutlined, ExclamationOutlined, FieldTimeOutlined, InfoOutlined, IssuesCloseOutlined, MinusCircleOutlined, SafetyCertificateOutlined, SendOutlined, SmallDashOutlined, SyncOutlined, UserOutlined, WifiOutlined, WarningOutlined, CloseOutlined, BookOutlined } from '@ant-design/icons';
import { L } from './abpUtility';

export class MEnum {
	num: number;
	name: string;
	color: string;
	icon: any;
	constructor(num: number | 0, name: string | "", color?: string, icon?: any) {
		this.num = num;
		this.name = name;
		this.color = color || "green";
		this.icon = icon || "";
	}
}
const _getValue = (enu: MEnum[], val: number | undefined, col: "name" | "color" | "icon"): string => {
	if (val !== undefined) {
		let item = enu.find(item => item.num == val);
		if (item !== undefined) {
			return L(item[col]);
		}
	}
	return "";
}



//---------------------------------------------------------------------------------------------------------

export const eBillStatus = {
	CREATE: new MEnum(0, "Khởi tạo"),
	PAYMENT: new MEnum(1, "Đang giao dịch"),
	SUCCESS: new MEnum(2, "Thành công"),

}
export const valueOfeBillStatus = (val: number | undefined) => {
	return _getValue(Object.values(eBillStatus), val, "name");
}

export const eTypeFile = {
	IMAGE: new MEnum(0, "IMAGE"),
	PDF: new MEnum(1, "PDF"),
	NONE: new MEnum(2, "NONE"),
}
export const valueOfeTypeFile = (val: number | undefined) => {
	return _getValue(Object.values(eTypeFile), val, "name");
}
//---------------------------------------------------------------------------------------------------------

export const eGENDER = {
	FEMALE: new MEnum(0, "Nữ"),
	MALE: new MEnum(1, "Nam"),
	OTHER: new MEnum(2, "Khác"),
}
export const valueOfeGENDER = (val: number | undefined) => {
	return _getValue(Object.values(eGENDER), val, "name");
}
//---------------------------------------------------------------------------------------------------------


export const eDrinkType = {
	Do_dong_chai: new MEnum(0, "Sản phẩm có bao bì"),
	Do_tuoi: new MEnum(1, "Sản phẩm không có bao bì"),
}
export const valueOfeDrinkType = (val: number | undefined) => {
	return _getValue(Object.values(eDrinkType), val, "name");
}
//----------------------------------------------------------------------------------------------------------
export const ePaymentMethod = {

	TIEN_MAT: new MEnum(0, "Tiền mặt"),
	MA_QR: new MEnum(1, "Mã QR"),
	RFID: new MEnum(2, "RFID"),
}
export const valueOfePaymentMethod = (val: number | undefined) => {
	return _getValue(Object.values(ePaymentMethod), val, "name");
}
//----------------------------------------------------------------------------------------------------------
export const eMoney = {
	KHONG: new MEnum(0, "0 VNĐ"),
	MOT_CHUC: new MEnum(10000, "10,000 VNĐ"),
	HAI_CHUC: new MEnum(20000, "20,000 VNĐ"),
	NAM_CHUC: new MEnum(50000, "50,000 VNĐ"),
}
export const valueOfeMoney = (val: number | undefined) => {
	return _getValue(Object.values(eMoney), val, "name");
}

export const eReportStatus = {
	KHOI_TAO: new MEnum(0, "Khởi tạo"),
	DANG_XU_LY: new MEnum(1, "Đang xử lý"),
	DA_HOAN_THANH: new MEnum(2, "Đã Hoàn thành"),
}
export const valueOfeReportStatus = (val: number | undefined) => {
	return _getValue(Object.values(eReportStatus), val, "name");
}

export const eReportLevel = {
	CANH_BAO: new MEnum(0, "Cảnh báo"),
	LOI: new MEnum(1, "Có lỗi"),
}
export const valueOfeReportLevel = (val: number | undefined) => {
	return _getValue(Object.values(eReportLevel), val, "name");
}

export const ePaymentStatus = {
	Create: new MEnum(0, "Khởi tạo", "yellow"),
	Success: new MEnum(1, "Thành công", "green"),
	ErrorQR: new MEnum(2, "Sai mã QR", "red"),
	Error: new MEnum(3, "Lỗi", "orange"),
}
export const colorOfePaymentStatus = (val: number | undefined) => {
	return _getValue(Object.values(ePaymentStatus), val, "color");
}
export const valueOfePaymentStatus = (val: number | undefined) => {
	return _getValue(Object.values(ePaymentStatus), val, "name");
}
export const eBank = {
	VCB: new MEnum(1, "VCB"),

}
export const valueOfeBank = (val: number | undefined) => {
	return _getValue(Object.values(eBank), val, "name");
}
export const eRIFDAction = {
	ADD_MONEY: new MEnum(0, "Nạp tiền"),
	CHANGE_STATUS: new MEnum(1, "Thay đổi trạng thái"),
	BUY: new MEnum(2, "Giao dịch"),
	CREATE: new MEnum(3, "Tạo mới"),
	CHANGE_MONEY: new MEnum(4, "Đổi tiền"),
	CHANGE_MONEY_SALE: new MEnum(5, "Đổi tiền khuyển mãi"),
}
export const valueOfeRIFDAction = (val: number | undefined) => {
	return _getValue(Object.values(eRIFDAction), val, "name");
}
export const eActive = {
	Inactive: new MEnum(0, "Chưa kích hoạt"),
	Active: new MEnum(1, "Kích hoạt"),
}
export const valueOfeActive = (val: number | undefined) => {
	return _getValue(Object.values(eActive), val, "name");
}
export const eSort = {
	ASC: new MEnum(1, L("Ascending")),
	DES: new MEnum(2, L("Descending")),
}
export const valueOfeDocumentSort = (val: number | undefined) => {
	return _getValue(Object.values(eSort), val, "name");
}
export const eMachineNetworkStatus = {
	OFFLINE: new MEnum(1, L("Ngoại Tuyến")),
	ONLINE: new MEnum(2, L("Trực tuyến")),
}
export const valueOfeMachineNetworkStatus = (val: number | undefined) => {
	return _getValue(Object.values(eMachineNetworkStatus), val, "name");
}
export const eMachineStatusMonitor = {
	ABNORMAL: new MEnum(0, L("Bất thường")),
	NORMAL: new MEnum(1, L("Bình thường")),
}
export const valueOfeMachineStatusMonitor = (val: number | undefined) => {
	return _getValue(Object.values(eMachineStatusMonitor), val, "name");
}
export const eWithdrawStatus = {
	CREATING: new MEnum(0, L("Khởi tạo")),
	ACCEPTED: new MEnum(1, L("Chấp thuận")),
	GIVEBACK: new MEnum(2, L("Trả về")),
	RECEIVED: new MEnum(3, L("Đã nhận tiền")),


}
export const valueOfeWithdrawStatus = (val: number | undefined) => {
	return _getValue(Object.values(eWithdrawStatus), val, "name");
}
export const eRFIDTypeRecharge = {
	RechargeMoney: new MEnum(0, L("Nạp tiền")),
	ChangeMoney: new MEnum(1, L("Đổi tiền")),
	ChangeSaleMoney: new MEnum(2, L("Đổi tiền khuyến mãi")),
}
export const valueOfeRFIDTypeRecharge = (val: number | undefined) => {
	return _getValue(Object.values(eRFIDTypeRecharge), val, "name");
}

export const eRefundReasonType = {
	REMAIN_CASH: new MEnum(0, L("Người dùng còn dư tiền")),
	QR_ERROR: new MEnum(1, L("QR thành công và máy không nhận tiền")),
	PAID_ERROR: new MEnum(2, L("Nhả hàng lỗi")),
}
export const valueOfeRefundReasonType = (val: number | undefined) => {
	return _getValue(Object.values(eRefundReasonType), val, "name");
}
export const eFileType = {
	NONE: new MEnum(0, L("Không")),
	PRODUCT_IMAGE: new MEnum(1, L("Ảnh sản phẩm")),
	APK: new MEnum(2, L("APK")),
	AVATAR: new MEnum(3, L("Ảnh đại diện")),
}
export const valueOfeFileType = (val: number) => {
	return _getValue(Object.values(eFileType), val, "name");
}

export const eReconsile = {
	CASH: new MEnum(0, L("Tiền mặt")),
	QR: new MEnum(1, L("Ngân hàng")),
	ALL: new MEnum(2, L("Tất cả")),
	
}
export const valueOfeReconsile = (val: number) => {
	return _getValue(Object.values(eReconsile), val, "name");
}
export const eReconcileWithdrawStatus = {
	NONE: new MEnum(0, L("Chờ khách xác nhận đối soát")),
	READY: new MEnum(1, L("Sẵn sàng và đang chờ rút")),
	PAID: new MEnum(2, L("Đã rút")),
	
}
export const valueOfeReconcileWithdrawStatus = (val: number) => {
	return _getValue(Object.values(eReconcileWithdrawStatus), val, "name");
}
export const eReconcileBillingStatus = {
	NONE: new MEnum(0,L("CHỜ XÁC NHẬN ĐỐI SOÁT")),
	PAYING: new MEnum(1, L("ĐANG THANH TOÁN")),
	PAID: new MEnum(2, L("ĐÃ THANH TOÁN")),
	
}
export const valueOfeReconcileBillingStatus = (val: number) => {
	return _getValue(Object.values(eReconcileBillingStatus), val, "name");
}
export const eBillReconcileStatus = {
	NONE: new MEnum(0, L("CHƯA ĐỐI SOÁT")),
	ERROR: new MEnum(1, L("ĐÃ ĐỐI SOÁT VÀ PHÁT HIỆN LỖI")),
	DOING: new MEnum(2, L("ĐÃ ĐỐI SOÁT NHƯNG CHƯA PHÁT HIỆN LỖI")),
	DONE: new MEnum(3, L("ĐỐI SOÁT THÀNH CÔNG")),
	
}
export const valueOfeBillReconcileStatus = (val: number) => {
	return _getValue(Object.values(eBillReconcileStatus), val, "name");
}
export const eReconcileStatus = {
	NONE: new MEnum(0, L("CHỜ XÁC NHẬN ĐỐI SOÁT")),
	READY: new MEnum(1, L("ĐÃ XÁC NHẬN VÀ CÓ THỂ RÚT TIỀN")),
	PAID: new MEnum(2, L("ĐÃ RÚT TIỀN")),
	
}
export const valueOfeReconcileStatus = (val: number) => {
	return _getValue(Object.values(eReconcileStatus), val, "name");
}
export const eBillRequiredFund = {
	NONE: new MEnum(0, L("KHÔNG CÓ YÊU CẦU HOÀN TRẢ")),
	REQUEST_REFUND: new MEnum(1, L("CÓ YÊU CẦU HOÀN TRẢ")),
	REFUNDED: new MEnum(2, L("ĐÃ HOÀN TRẢ")),
}
export const valueOfeBillRequiredFund = (val: number) => {
	return _getValue(Object.values(eBillRequiredFund), val, "name");
}

export const eBillReconcileExcel = {
	BOTH: new MEnum(0, L("Có ở cả 2")),
	EXCEL: new MEnum(1, L("Chỉ có ở excel")),
	WEB: new MEnum(2, L("Chỉ có ở web")),
}
export const eComponentUpload = {
	NONE: new MEnum(0, L("Các loại file khác")),
	PRODUCT_IMAGE: new MEnum(1, L("Ảnh sản phẩm")),
	APK: new MEnum(2, L("APK")),
	AVATAR: new MEnum(2, L("AVATAR")),
}
export const valueOfeComponentUpload = (val: number) => {
	return _getValue(Object.values(eComponentUpload), val, "name");
}
export const ePaidStatus = {
	CREATE: new MEnum(0, L("Quá trình tạo đơn hàng ")),
	ERROR: new MEnum(1, L("Lỗi")),
	PART_SUCCESS: new MEnum(2, L("Trả hàng thành công 1 phần")),
	SUCCESS: new MEnum(3, L("Trả hàng thành công")),
}
export const valueOfePaidStatus = (val: number) => {
	return _getValue(Object.values(ePaidStatus), val, "name");
}
export const eReconcileLogType = {
	BILLING: new MEnum(0, L("Lịch sử đối soát của hóa đơn ")),
	EXCEL: new MEnum(1, L("Lịch sửa đối soát của Excel ")),
}
export const valueOfeReconcileLogType = (val: number) => {
	return _getValue(Object.values(eReconcileLogType), val, "name");
}