import { PlusOutlined } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import { cssCol, FileUploadType } from '@lib/appconst';
import MineTypeConst from '@lib/minetypeConst';
import { AttachmentItem, FileParameter, ImageProductDto } from '@services/services_autogen';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { stores } from '@stores/storeInitializer';
import { Button, Image, message, Modal, Row, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload';
import * as React from 'react';

const { confirm } = Modal;
export interface IFileAttachmentsProps {
	onSubmitUpdate?: (data: AttachmentItem[], file?: FileParameter) => void;
	files?: AttachmentItem[];
	visibleModalViewFile?: boolean;
	isLoadFile?: boolean;
	allowRemove?: boolean;
	isMultiple?: boolean;
	isViewFile?: boolean;
	componentUpload?: FileUploadType;
	isUpLoad?: boolean;
	isDownload?: boolean;
	showRemoveIcon?: boolean;
	maxLength?: number;
	refresh?: () => void;
}

export default class FileAttachmentsProduct extends AppComponentBase<IFileAttachmentsProps> {
	fileInput: any = React.createRef();

	listFile: any = [];
	listFileTemp: any = [];
	listFileTemp1: any = [];
	listFileAttachmentResult: AttachmentItem[] = [];
	state = {
		isLoadDone: false,
		itemAttachment: new AttachmentItem(),
		visibleModalViewFile: false,
		className: "",
		audioVideo: false,
		jpgPng: false,
		fileSizeAvatar: false,
		duplicateFile: false,
		apkFormat: false,
		fileSizeApk: false,
		xlsFile: false,
		fileSizeDefault: false
	};
	a: boolean = false;
	async componentDidUpdate(prevProps) {
		if (this.props.isLoadFile !== prevProps.isLoadFile) {
			this.listFile = [];
			this.listFileAttachmentResult = [];
			this.props.files!.map(item => {
				if (item !== undefined && item.id !== undefined && item.id > 0) {

					let upload = {
						uid: item.id.toString(),
						name: item.key!,
						status: 'done',
						ext: item.ext,
						url: this.getImageProduct(item.md5!),
						thumbUrl: MineTypeConst.getThumUrl(item.ext!),
					}
					this.listFile.push(upload);
					if (!!this.props.maxLength && this.listFile!.length > this.props.maxLength) {
						this.listFile.slice(0, this.props.maxLength);
					}
					this.listFileAttachmentResult.push(item);
				}
			});

			await this.initClassName();
			if (!!this.props.visibleModalViewFile) {
				await this.setState({ visibleModalViewFile: this.props.visibleModalViewFile });
				this.onViewDetailFile(this.listFile[0]);
			}
			this.setState({ isLoadDone: !this.state.isLoadDone });
		}
	}
	async componentDidMount() {
		this.listFile = [];
		this.listFileAttachmentResult = [];
		this.props.files?.map(item => {
			if (item !== undefined && item.id !== undefined && item.id > 0) {
				let upload = {
					uid: item.id.toString(),
					name: item.key!,
					status: 'done',
					ext: item.ext,
					url: this.getImageProduct(item.md5!),
					thumbUrl: MineTypeConst.getThumUrl(item.ext!),
				}
				this.listFile.push(upload);
				if (!!this.props.maxLength && this.listFile!.length > this.props.maxLength) {
					this.listFile.slice(0, this.props.maxLength);
				}
				this.listFileAttachmentResult.push(item);
			}
		});

		await this.initClassName();
		if (!!this.props.visibleModalViewFile) {
			await this.setState({ visibleModalViewFile: this.props.visibleModalViewFile });
			this.onViewDetailFile(this.listFile[0]);
		}
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}

	initClassName = async () => {
		let className = "upload-list-inline";
		if (this.props.allowRemove === false)
			className = className.concat(" hiddenDelete");
		if (this.props.isViewFile === false)
			className = className.concat(" hiddenEye");
		await this.setState({ className: className });

	}
	handleChange = async ({ fileList: newFileList }) => {
		this.listFileTemp = newFileList;
		this.listFileTemp1 = newFileList
		if (!!this.props.maxLength && this.listFileTemp!.length > this.props.maxLength) {
			this.listFileTemp = this.listFileTemp.slice(0, this.props.maxLength);
			return;
		}
	}

	uploadImage = async (options) => {
		const { onSuccess, file } = options;
		let fileUp: any = ({ "data": file, "fileName": file.name });
		let fileToUpload: FileParameter = fileUp;
		let typeFile = (this.props.componentUpload);
		if (!!fileToUpload.data['size']) {
			let result: ImageProductDto = await stores.imageProductStore.createFile(file.name, fileToUpload);
			if (!!result && result.im_pr_id != undefined) {
				onSuccess("done");
				this.setState({ isLoadDone: false });
				let attachmentItem = new AttachmentItem();
				attachmentItem.id = result.im_pr_id;
				attachmentItem.key = result.im_pr_name;
				attachmentItem.ext = result.im_pr_extension;
				attachmentItem.md5 = result.im_pr_md5;
				attachmentItem.isdelete = false;
				await this.listFileAttachmentResult.push(attachmentItem);
				this.listFile = this.listFileTemp;
				if (this.props.onSubmitUpdate != undefined) {
					await this.props.onSubmitUpdate(this.listFileAttachmentResult, fileToUpload);
				}
			}
			this.setState({ isLoadDone: true });
		}
		else {
			message.error("File tải lên không hợp lệ!")
		} if (!!this.props.maxLength && this.listFileTemp1!.length > this.props.maxLength) {
			this.listFileTemp1!.length = 0;
			message.error("Chỉ được tải tối đa " + this.props.maxLength + " file");
			return;
		}
	}
	onViewDetailFile = async (file) => {
		let attach = this.listFileAttachmentResult.filter(item => item.key == file.name)[0];
		if ([...MineTypeConst.IMAGE_EXT_LIST, ...MineTypeConst.PDF_EXT_LIST, ...MineTypeConst.VIDEO_EXT_LIST, ...MineTypeConst.EXCEL_EXT_LIST, ...MineTypeConst.TXT_EXT_LIST, ...MineTypeConst.PP_EXT_LIST].includes(attach.ext!)) {
			await this.setState({ itemAttachment: attach });
			this.setState({ visibleModalViewFile: true, });
			this.setState({ isLoadDone: !this.state.isLoadDone });
		}
		else {
			message.error('Không thể xem file!');
		}
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}

	deleteFileItem = async (file) => {
		let self = this;
		confirm({
			title: L('Bạn có muốn xóa') + ": " + file.name + "?. " + L('Các thay đổi sẽ chỉ thành công khi bạn nhấn nút lưu'),
			okText: L('Xác nhận'),
			cancelText: L('Hủy'),
			async onOk() {
				self.setState({ isLoadDone: true });
				let index = self.listFile.findIndex(item => item.uid == file.uid);
				if (self.listFileAttachmentResult.length > index) {
					self.listFileAttachmentResult[index].isdelete = true;
					await stores.imageProductStore.deleteImageProduct(self.listFileAttachmentResult[index].id!);
					self.listFileAttachmentResult.splice(index, 1);
					if (self.props.onSubmitUpdate !== undefined) {
						self.props.onSubmitUpdate(self.listFileAttachmentResult);
					}
				}
				self.listFile = self.listFileTemp;
				self.setState({ isLoadDone: false });
			},
			onCancel() {

			},
		});

	};
	beforeUpload = (file: RcFile) => {

		const { componentUpload } = this.props;
		let limitSize = false;
		const isAudioFile = file.type.startsWith('audio/');
		const isVideoFile = file.type.startsWith('video/');
		if (isAudioFile || isVideoFile) {
			message.error('Không được tải lên file âm thanh / video');
			return Promise.reject(false);
		}
		if (componentUpload == FileUploadType.Avatar) {
			const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
			if (!isJpgOrPng) {
				this.a == false && message.error(L('Ảnh phải là tệp png/jpg'));
				this.a = true;
				return Promise.reject(false);
			}
			limitSize = file.size / 1024 / 1024 < 0.5;
			if (!limitSize) {
				message.error(L('Ảnh phải nhỏ hơn 0.5MB!'));
				return Promise.reject(false);
			}
			const checkUpLoad = this.listFile!.some(item => item.name == file.name);
			if (checkUpLoad) {
				message.error(L('Ảnh đã tồn tại!'));
				return Promise.reject(false);
			}
		}
		else if (componentUpload == FileUploadType.Update) {
			const isJpgOrPng = file.type === 'application/vnd.android.package-archive';
			if (!isJpgOrPng) {
				message.error(L('Tệp phải có định dạng là apk'));
				return Promise.reject(false);
			}
			limitSize = file.size / 1024 / 1024 < 50;
			if (!limitSize) {
				message.error(L('Tệp phải nhỏ hơn 50MB!'));
				return Promise.reject(false);
			}
		}
		else if (file.type === "application/vnd.ms-excel") {
			message.error(L('Không đọc được file .xls'));
			return Promise.reject(false);
		}
		else {
			limitSize = file.size / 1024 / 1024 < 10;
			if (!limitSize) {
				message.error('Tệp phải nhỏ hơn 10MB!');
				return Promise.reject(false);
			}
		}
		return true;
	}
	onDownload = (file) => {
		const fileBlob = new Blob([file.originFileObj], { type: file.type });
		const fileUrl = URL.createObjectURL(fileBlob);
		const link = document.createElement('a');
		link.href = fileUrl;
		link.download = file.name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(fileUrl);
	};
	render() {
		const { isMultiple, allowRemove, isViewFile } = this.props;
		const col24 = cssCol(24);
		const uploadButton = (
			<Button style={{ display: this.props.isUpLoad == false ? "none" : "block", width: "100%", height: "100%" }} icon={<PlusOutlined />}></Button>
		);
		const { componentUpload } = this.props;
		return (
			<Row style={{ width: '100%', margin: '2px', display: 'block' }}>
				<Upload
					accept={
						componentUpload == FileUploadType.Avatar
							? ".jpg,.png,.jpeg"
							: componentUpload == FileUploadType.Update
								? ".apk"
								: ""
					}
					listType="picture-card"
					multiple={false}
					className={this.state.className}
					beforeUpload={this.beforeUpload}
					customRequest={this.uploadImage}
					onPreview={this.onViewDetailFile}
					onRemove={async (file) => {
						allowRemove && (await this.deleteFileItem(file));
					}}
					onDownload={this.onDownload}
					fileList={this.listFile}
					onChange={allowRemove == false ? () => { } : this.handleChange}
					showUploadList={{
						showDownloadIcon: this.props.isDownload,
						showRemoveIcon: this.props.showRemoveIcon,
					}}
				>
					{this.props.isUpLoad ? (
						this.listFile.length === 0 ? uploadButton : null 
					) : (
						""
					)}
				</Upload>


				{/* {this.state.itemAttachment != undefined && this.state.itemAttachment.id != undefined && this.state.visibleModalViewFile ?
					<ViewImageProduct
						preview={this.state.visibleModalViewFile}
						key={this.state.itemAttachment.id! + "_" + this.state.itemAttachment.key!}
						itemAttach={this.state.itemAttachment}
						isFileScan={true}
					/>
					<Image
						preview={this.props.preview}
						style={{ maxHeight: maxHeight || "50vh", maxWidth: "100%" }}
						src={(isFileScan !== undefined && isFileScan)
							? this.getImageProduct(this.state.itemAttachment.md5!)
							: this.getImageProduct(this.state.itemAttachment.md5!)}
					/>
					: null} */}
				{this.state.itemAttachment && this.state.itemAttachment.id && this.state.visibleModalViewFile ? (
					<Image
						preview={{
							visible: this.state.visibleModalViewFile,
							onVisibleChange: (visible) => this.setState({ visibleModalViewFile: visible }),
						}}
						src={this.getImageProduct(this.state.itemAttachment.md5!)}
						style={{ display: 'none' }} // Không hiển thị ảnh trên giao diện
					/>
				) : null}

			</Row >
		);
	}

}