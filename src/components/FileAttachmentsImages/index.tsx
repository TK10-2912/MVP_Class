import { PlusOutlined } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import AppConsts, { cssCol, FileUploadType } from '@lib/appconst';
import MineTypeConst from '@lib/minetypeConst';
import { AttachmentItem, FileDto, FileParameter } from '@services/services_autogen';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { stores } from '@stores/storeInitializer';
import { Button, Col, Image, message, Modal, Row, Tooltip, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload';
import * as React from 'react';
import ViewFileContent from '../ViewFile/viewFileContent';
import FileSaver from 'file-saver';
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
	className?: string;
}

export default class FileAttachmentsImages extends AppComponentBase<IFileAttachmentsProps> {
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
	countNotification: number = 0;
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

		await this.initClassName();
		if (!!this.props.visibleModalViewFile) {
			await this.setState({ visibleModalViewFile: this.props.visibleModalViewFile });
			this.onViewDetailFile(this.listFile[0]);
		}
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}

	initClassName = async () => {
		let className = this.props.className + " " + "upload-list-inline";
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
			title: 'Thông báo',
			content: <span>Bạn có muốn xóa: <b>{file.name}?</b>. Các thay đổi sẽ chỉ thành công khi bạn nhấn nút lưu</span>,
			okText: L('Xác nhận'),
			cancelText: L('Hủy'),
			async onOk() {
				self.setState({ isLoadDone: true });
				let index = self.listFile.findIndex(item => item.uid == file.uid);
				if (self.listFileAttachmentResult.length > index) {
					self.listFileAttachmentResult[index].isdelete = true;
					await stores.fileStore.delete(self.listFileAttachmentResult[index].id!);
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
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
		if (!!isJpgOrPng) {
			limitSize = file.size / 1024 / 1024 < 0.5;
			if (!limitSize) {
				message.error(L('Ảnh phải nhỏ hơn 0.5MB!'));
				return Promise.reject(false);
			}
		}

		if (isAudioFile || isVideoFile) {
			message.error('Không được tải lên file âm thanh / video');
			return Promise.reject(false);
		}
		if (componentUpload == FileUploadType.Avatar) {
			const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
			if (!isJpgOrPng) {
				message.error(L('Ảnh phải là tệp png/jpg'));
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
				message.error(L("Tệp phải nhỏ hơn") + ` ${10}MB!`);
				return Promise.reject(false);
			}
		}
		return true;
	}
	onDownload = async (file) => {
		try {
			this.setState({ isLoadDone: false });
			let headers = new Headers();
			headers.append('Content-Type', 'application/json');
			headers.append('Accept', 'application/json');
			headers.append('Origin', AppConsts.appBaseUrl + "");

			const response = await fetch(this.getFile(file.uid!), {
				mode: 'cors',
				credentials: 'include',
				method: 'POST',
				headers: headers,
			});

			if (!response.ok) {
				throw new Error('Download failed');
			}

			const blob = await response.blob();
			const fileBlob = new Blob([blob], { type: blob.type });

			FileSaver.saveAs(fileBlob, file.name);

			message.success(L("Tải xuống thành công"));
		} catch (error) {
			message.error(L("Tải xuống thất bại"));
		} finally {
			this.setState({ isLoadDone: true });
		}
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
				<Col span={24}>
					<Upload
						accept={componentUpload == FileUploadType.Avatar ? ".jpg,.png,.jpeg" : componentUpload == FileUploadType.Update ? ".apk" : ""}
						listType="picture-card"
						multiple={this.props.isMultiple!}
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
						itemRender={(originNode, file) => (
							<Tooltip title={file.name}>
								{originNode}
							</Tooltip>)}
					>
						{this.props.isUpLoad ? (
							isMultiple === true && this.listFile.length < (this.props.maxLength || 1)
								? uploadButton
								: this.listFile.length >= (this.props.maxLength || 1)
									? null
									: uploadButton
						)
							: ""
						}

					</Upload>

					{(isViewFile === undefined || isViewFile === true) &&
						(
							MineTypeConst.checkExtentionFileType(this.state.itemAttachment.ext!) === MineTypeConst.IMAGE_EXT
								? <Image
									title={this.state.itemAttachment.key}
									preview={{
										visible: this.state.visibleModalViewFile,
										onVisibleChange: (visible) => this.setState({ visibleModalViewFile: visible }),
									}}
									src={this.getFile(this.state.itemAttachment.id!)}
									style={{ display: 'none' }}
								/>
								: <Modal
									centered
									width={[...MineTypeConst.IMAGE_EXT_LIST].includes(this.state.itemAttachment.ext!) ? "50vh" : "70%"}
									
									title={L("ViewFile" + " " + this.state.itemAttachment.key)}
									visible={this.state.visibleModalViewFile}
									onCancel={() => this.setState({ visibleModalViewFile: false })}
									footer={null}
									destroyOnClose={true}
									maskClosable={true}
									bodyStyle={{ height: '80vh' }} 
								>
									<Row>
										<Col {...col24} id={"ViewFileContentDocumentId"}>
											{this.state.itemAttachment && this.state.itemAttachment.id ? (
												<ViewFileContent
													key={this.state.itemAttachment.id + "_" + this.state.itemAttachment.key}
													itemAttach={this.state.itemAttachment}
													isFileScan={true}
												/>
											) : null}
										</Col>
									</Row>
								</Modal>
						)
					}
				</Col>

			</Row>
		);
	}

}