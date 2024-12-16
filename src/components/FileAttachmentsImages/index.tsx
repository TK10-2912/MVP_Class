import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
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

const { confirm } = Modal;
export interface IFileAttachmentsProps {
	onSubmitUpdate?: (data: AttachmentItem[]) => void;
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
}
export interface IFileAttachmentsStates {
	visibleModalViewFile: boolean;
	itemAttachment: AttachmentItem;
	isLoadDone: boolean,
	className: string,
}

export default class FileAttachmentsImages extends AppComponentBase<IFileAttachmentsProps, IFileAttachmentsStates> {
	fileInput: any = React.createRef();
	listFile: any = [];
	listFileTemp: any = [];
	listFileAttachmentResult: AttachmentItem[] = [];
	state = {
		isLoadDone: false,
		itemAttachment: new AttachmentItem(),
		visibleModalViewFile: false,
		className: "",
	};

	async componentDidUpdate(prevProps, prevState) {

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
						url: this.getFile(item.id),
						thumbUrl: MineTypeConst.getThumUrl(item.ext!),
					}
					this.listFile.push(upload);
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
		}
	}
	onViewDetailFile = (file) => {
		let index1 = this.listFile.findIndex(item => item.uid === file.uid);
		let attach = this.listFileAttachmentResult[index1];
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
			title: L('Bạn có muốn xóa') + ": " + file.name + "?. " + L('Các thay đổi sẽ chỉ thành công khi bạn nhấn nút lưu'),
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
		if (componentUpload == FileUploadType.Avatar) {
			const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
			if (!isJpgOrPng) {
				message.error(L('Ảnh phải là tệp png/jpg'));
				return Promise.reject(false);
			}
			limitSize = file.size / 1024 / 1024 < 2;
			if (!limitSize) {
				message.error(L('Ảnh phải nhỏ hơn 2MB!'));
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
				message.error(L("Tệp phải nhỏ hơn") + ` ${10}MB!`);
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
		const uploadButton = (
			<Button style={{ display: this.props.isUpLoad == false ? "none" : "block", width: "100%", height: "100%" }} icon={<PlusOutlined />}></Button>
		);
		return (
			<Row style={{ width: '100%', display: 'block' }}>
				<Upload
					listType="picture-card"
					multiple={true}
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
					{(isMultiple != undefined && isMultiple == true) ? uploadButton : (this.listFile.length >= 1 ? null : uploadButton)}
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
						centered
					>
						<Row>
							<Col id={"ViewFileContentDocumentId"}>
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
			</Row>
		);
	}

}

