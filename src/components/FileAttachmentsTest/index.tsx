import { PlusOutlined } from '@ant-design/icons';
import { AttachmentItem, FileDto, FileParameter, } from '@services/services_autogen';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { FileUploadType } from '@src/lib/appconst';
import { stores } from '@stores/storeInitializer';
import { Image, Modal, Row, Upload, message } from 'antd';
import { RcFile, UploadFile, } from 'antd/lib/upload/interface';
import * as React from 'react';


export interface IFileAttachmentsProps {
	onSubmitUpdate?: (fileAttachmentItem: AttachmentItem) => void;
	file: UploadFile | undefined;
	lengthUpload: number;
	isMultiple?: boolean;
	allowEditting?: boolean;
	allowRemove?: boolean;
	checkSize? :(input: boolean) => void;
	isLoadFile?: boolean;
	// isViewDetailFileAsModal?: boolean;
	componentUpload?: FileUploadType;
	// onAddFile?: (itemAttachmentItem: AttachmentItem) => void;
	// onRemoveFile?: (index: number, itemAttachmentItem: AttachmentItem) => void;
}
export interface IFileAttachmentsStates {
	isLoadDone: boolean;
	submitting: boolean;
	visibleModalViewFile: boolean;
	idImageSelect: Number | undefined;
	
}

export default class FileAttachmentsTest extends AppComponentBase<IFileAttachmentsProps, IFileAttachmentsStates> {
	fileInput: any = React.createRef();
	state = {
		isLoadDone: false,
		submitting: false,
		file: undefined,
		idImageSelect: undefined,
		visibleModalViewFile: false,
	};
	stringImage: string = "";
	listFile: UploadFile[]= [];
	isMultiple: boolean;

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.file != undefined && nextProps.file !== prevState.file) {
			return ({ file: nextProps.file });
		}
		return null;
	}
	async componentDidUpdate(prevProps, prevState) {
		if (this.props.isLoadFile !== prevProps.isLoadFile) {		
			if (this.props.file != undefined && this.props.file.uid != "undefined" &&  this.props.file.uid !="0" && this.listFile.length < 1) {
				this.setState({ isLoadDone: false });
				this.listFile.push(this.props.file);
				this.setState({ isLoadDone: true });
			}
			else{
				this.listFile = [];
			}
		}
	}

	handlePreview = async (file: UploadFile) => {		
		if(!!this.state.idImageSelect){
			this.setState({ visibleModalViewFile: true })
		}
		else if (file != undefined && file.uid != undefined) {
			this.setState({ idImageSelect: Number(file.uid), visibleModalViewFile: true })
		} else {
			message.error("Không có ảnh!");
			return;
		}
	};

	handleChange = ({ fileList: newFileList }) => {
		this.setState({ isLoadDone: false });
		this.listFile = newFileList;
		this.setState({ isLoadDone: true });
	}
	onDeleteFile = () => {
		this.setState({ isLoadDone: false });
		if (this.props.onSubmitUpdate != undefined) {
			this.props.onSubmitUpdate(new AttachmentItem());
		}
		this.setState({ isLoadDone: true });
	}

	uploadImage = async (options) => {
		this.setState({isLoadDone: false})
		const { onSuccess, onError, file, onProgress } = options;
		let fileUp: any = ({ "data": file, "fileName": file.name });
		let fileToUpload: FileParameter = fileUp;
		let typeFile = (this.props.componentUpload);
		let result: FileDto = await stores.fileStore.createFile(typeFile,fileToUpload);

		let resultAttachmentFile = new AttachmentItem();
		resultAttachmentFile.id = result.fi_id;
		resultAttachmentFile.ext = result.fi_extension;
		resultAttachmentFile.key = result.fi_name;
		if (!!result && result.fi_id != undefined) {
			onSuccess("done");
			if (this.props.onSubmitUpdate != undefined) {
				this.props.onSubmitUpdate(resultAttachmentFile);
				this.setState({ idImageSelect: result.fi_id, });
			}
		}
	}
	checkSize =(input : boolean)=>{
		if(!!this.props.checkSize )
		{
			this.props.checkSize(input)
		}
	}
	beforeUpload = (file: RcFile) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('Ảnh phải là tệp JPG/PNG!');
			this.checkSize(false);
		}
		const limitSize = file.size / 1024 / 1024 < 0.2;
		if (!limitSize) {
			message.error('Ảnh phải nhỏ hơn 0.2MB!');
			this.checkSize(false);
		}
		else{
			this.checkSize(true);
		}
		return isJpgOrPng && limitSize;
	};
	render() {
		const uploadButton = (
			<div style={{ borderBlock: "1px" }}>
				<PlusOutlined />
				<div style={{ marginTop: 8 }}>Tải ảnh lên</div>
			</div>
		);
		const isMultiple: boolean = this.props.isMultiple != undefined && this.props.isMultiple == true ? true : false;
		return (
			<Row>
				<Upload
					accept="image/*"
					listType="picture-card"
					className="avatar-uploader"
					customRequest={this.uploadImage}
					fileList={this.listFile }
					onRemove={this.onDeleteFile}
					onPreview={this.handlePreview}
					onChange={this.handleChange}
					beforeUpload={this.beforeUpload}
					
				>
					{ !!isMultiple &&isMultiple==true?uploadButton:(this.listFile.length>=1  ? null : uploadButton)}
				</Upload>
				<Modal
					width={'50vw'}
					destroyOnClose={true}
					visible={this.state.visibleModalViewFile}
					footer={null}
					onCancel={() => this.setState({ visibleModalViewFile: false })}
					cancelText="Huỷ"
					title="File"
				>
					<Image src={this.getFile(this.state.idImageSelect!)} />
				</Modal>
			</Row>
		);
	}

}

