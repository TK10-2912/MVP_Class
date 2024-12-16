import { UploadOutlined } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import { cssCol, FileUploadType } from '@lib/appconst';
import MineTypeConst from '@lib/minetypeConst';
import { AttachmentItem, FileDto, FileParameter } from '@services/services_autogen';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { stores } from '@stores/storeInitializer';
import { Button, Col, message, Modal, Row, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload';
import * as React from 'react';
import ViewFileContent from '../ViewFile/viewFileContent';
import { UploadFile } from 'antd/lib/upload/interface';

const { confirm } = Modal;
export interface IFileAttachmentsProps {
	onSubmitUpdate?: (data: AttachmentItem[]) => void;
	files?: AttachmentItem[];
	numberOfUpload?: number;
	visibleModalViewFile?: boolean;
	isLoadFile?: boolean;
	allowRemove?: boolean;
	isMultiple?: boolean;
	isViewFile?: boolean;
	isShowListUploadOnly?: boolean;
	componentUpload?: FileUploadType;
	isUpLoad?: boolean;
	isDownload?: boolean;
	showRemoveIcon?: boolean;
	maxLength?: number;
}
export interface IFileAttachmentsStates {
	visibleModalViewFile: boolean;
	itemAttachment: AttachmentItem;
	isLoadDone: boolean,
	className: string,
}

export default class FileAttachments extends AppComponentBase<IFileAttachmentsProps, IFileAttachmentsStates> {
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
	};

	componentDidMount(): void {
		if (this.props.isShowListUploadOnly) {
			this.addListFile();
		}
	}
	async componentDidUpdate(prevProps, prevState) {
		if (this.props.isLoadFile !== prevProps.isLoadFile) {
			this.listFile = [];
			this.listFileAttachmentResult = [];
			this.addListFile();
			await this.initClassName();
			if (!!this.props.visibleModalViewFile) {
				await this.setState({ visibleModalViewFile: this.props.visibleModalViewFile });
				this.onViewDetailFile(this.listFile[0]);
			}
			if (this.props.onSubmitUpdate !== undefined) {
				this.props.onSubmitUpdate(this.listFileAttachmentResult);
			}
			this.setState({ isLoadDone: !this.state.isLoadDone });
		}
	}

	addListFile = () => {
		this.props.files!.map(item => {
			if (item !== undefined && item.id !== undefined && item.id > 0) {

				let upload = {
					uid: item.id.toString(),
					name: item.key!,
					status: 'done',
					ext: item.ext,
					url: this.getFile(item.id),
					thumbUrl: MineTypeConst.getThumUrl(item.ext!),
				}
				this.listFile.push(upload);

				if (!!this.props.maxLength && this.listFile!.length > this.props.maxLength) {
					this.listFile.slice(0, this.props.maxLength);
				}
				this.listFileAttachmentResult.push(item);
			}
		});
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
			let result: FileDto = await stores.fileStore.createFile(typeFile, fileToUpload);
			if (!!result && result.fi_id != undefined) {
				onSuccess("done");
				this.setState({ isLoadDone: false });
				let attachmentItem = new AttachmentItem();
				attachmentItem.id = result.fi_id;
				attachmentItem.key = result.fi_name;
				attachmentItem.ext = result.fi_extension;
				attachmentItem.isdelete = false;
				this.listFileAttachmentResult.push(attachmentItem);
				this.listFile = this.listFileTemp;
				if (this.props.onSubmitUpdate != undefined) {
					await this.props.onSubmitUpdate(this.listFileAttachmentResult);
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
	onViewDetailFile = (file) => {
		let attach = this.listFileAttachmentResult.filter(item => item.key == file.name)[0];
		if ([...MineTypeConst.IMAGE_EXT_LIST, ...MineTypeConst.PDF_EXT_LIST, ...MineTypeConst.VIDEO_EXT_LIST, ...MineTypeConst.EXCEL_EXT_LIST, ...MineTypeConst.TXT_EXT_LIST, ...MineTypeConst.PP_EXT_LIST].includes(attach.ext!)) {
			this.setState({ visibleModalViewFile: true, itemAttachment: attach });
		}
		else {
			message.error('Không thể xem file!');
		}
	}

	deleteFileItem = async (file) => {
		let self = this;
		confirm({
			title: 'Thông báo',
			content: <span>Bạn có muốn xóa: <b>{file.name}?</b>. Các thay đổi sẽ chỉ thành công khi bạn nhấn nút lưu</span>,
			okText: L('Confirm'),
			cancelText: L('Cancel'),
			async onOk() {
				self.setState({ isLoadDone: true });
				let index = self.listFile.findIndex(item => item.uid == file.uid);
				if (self.listFileAttachmentResult.length > index) {
					self.listFileAttachmentResult[index].isdelete = true;
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
		const { hostSetting } = stores.settingStore;
		let limitSize = false;
		if (componentUpload == FileUploadType.Avatar||componentUpload==FileUploadType.Contracts) {
			const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'||file.type === 'image/jpg';
			if (!isJpgOrPng) {
				message.error(L('Ảnh phải là tệp png/jpg'));
				return Promise.reject(false);
			}
			limitSize = file.size / 1024 / 1024 < 0.5;
			if (!limitSize) {
				message.error(L('Ảnh phải nhỏ hơn 0.5MB!'));
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
				message.error(L("Tệp phải nhỏ hơn") + ` ${10}MB!`);
				return Promise.reject(false);
			}
		}
		return true;
	}
	onDownload = (file: UploadFile<any>) => {
		if (file.url) {
			const link = document.createElement('a');
			link.href = file.url;
			link.download = file.name;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			message.error("Không tìm thấy URL tải xuống!");
		}
	};

	render() {
		const { isMultiple, allowRemove, isViewFile, numberOfUpload } = this.props;
		const col24 = cssCol(24);
		const uploadButton = (
			<Button style={{ display: this.props.isUpLoad == false ? "none" : "block" }} icon={<UploadOutlined />}>{L('Tải lên')}</Button>
		);
		const { componentUpload } = this.props;
		return (
			<Row style={{ width: '100%', margin: '2px', display: 'block' }}>
				<Col span={24}>
					<Upload
						accept={componentUpload == FileUploadType.Avatar ? ".jpg,.png,.jpeg" : componentUpload == FileUploadType.Update ? ".apk" : ""}
						listType="text"
						multiple={this.props.isMultiple != undefined ? this.props.isMultiple : false}
						className={this.state.className}
						beforeUpload={this.beforeUpload}
						customRequest={this.uploadImage}
						onPreview={this.onViewDetailFile}
						onRemove={async (file) => { allowRemove && await this.deleteFileItem(file) }}
						onDownload={this.onDownload}
						fileList={this.listFile}
						onChange={allowRemove == false ? () => { } : this.handleChange}
						showUploadList={{
							showDownloadIcon: this.props.isDownload,
							// downloadIcon: <DownloadOutlined />,
							showRemoveIcon: this.props.showRemoveIcon,
						}}
					>
						{(this.listFile.length >= ((isMultiple != null && isMultiple == true && numberOfUpload != null && numberOfUpload >= 0) ? numberOfUpload : 1) ? null : uploadButton)}
					</Upload>

					{(isViewFile == undefined || isViewFile == true) &&
						<Modal
							width={[...MineTypeConst.IMAGE_EXT_LIST].includes(this.state.itemAttachment.ext!) ? "50vw" : "80vw"}
							title={L("ViewFile" + " " + this.state.itemAttachment.key)}
							visible={this.state.visibleModalViewFile}
							onCancel={() => this.setState({ visibleModalViewFile: false })}
							footer={null}
							destroyOnClose={true}
							maskClosable={true}
						>
							<Row>
								<Col
									{...col24}
									id={"ViewFileContentDocumentId"}
								>
									{this.state.itemAttachment != undefined && this.state.itemAttachment.id != undefined ?
										<ViewFileContent
											key={this.state.itemAttachment.id! + "_" + this.state.itemAttachment.key!}
											itemAttach={this.state.itemAttachment}
											isFileScan={true}
										/>
										: null}
								</Col>
							</Row>
						</Modal>
					}
				</Col>

			</Row>
		);
	}

}

