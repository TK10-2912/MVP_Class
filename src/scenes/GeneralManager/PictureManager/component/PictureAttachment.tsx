import * as React from 'react';
import { cssCol, EComponentUpload } from '@lib/appconst';
import { Row, Col, Upload } from 'antd';
import MineTypeConst from '@lib/minetypeConst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { UploadFile } from 'antd/lib/upload/interface';
import { FileDto, ImageProductDto } from '@src/services/services_autogen';
import ViewFileManagerContent from '@src/components/ViewFile/ViewFileManagerContent';

export interface IFileAttachmentsProps {
	files: ImageProductDto[];
	allowEditting: boolean;
	isViewDetailFileAsModal?: boolean;
	componentUpload?: EComponentUpload;
	isLoadFile?: boolean;
	onRemove: (id: number) => void;
	imageSize?: number;
}

export interface IFileAttachmentsStates {
	visibleModalViewFile: boolean;
	isLoadDone: boolean;
}

export default class PictureAttachment extends AppComponentBase<IFileAttachmentsProps, IFileAttachmentsStates> {
	state = {
		isLoadDone: false,
		visibleModalViewFile: false,
	};

	fileInput: any = React.createRef();
	listFile: any = [];
	itemFileView: any;

	async componentDidMount() {
		this.setState({ isLoadDone: false });
		await this.mapFiletoUpload(this.props.files);
		this.setState({ isLoadDone: true });
	}

	async componentDidUpdate(prevProps: IFileAttachmentsProps) {
		if (this.props.isLoadFile !== prevProps.isLoadFile) {
			await this.mapFiletoUpload(this.props.files);
		}
	}

	mapFiletoUpload = (files: ImageProductDto[]) => {
		this.listFile = [];
		files.map(item => {
			let upload = {
				uid: item.im_pr_id.toString(),
				name: item.im_pr_name!,
				status: 'done',
				path: item.im_pr_path,
				ext: item.im_pr_extension,
				url: this.getImageProduct(item.im_pr_md5!),
				thumbUrl: MineTypeConst.getThumUrl(item.im_pr_extension!),
			};
			this.listFile.push(upload);			
		})
		this.setState({ isLoadDone: true });
	}

	onRemove = async (id: number) => {
		this.setState({ isLoadDone: false });
		if (this.props.onRemove) {
			await this.props.onRemove(id);
		}
		this.setState({ isLoadDone: true });
	}

	onViewDetailFile = (file: UploadFile) => {
		this.itemFileView = file;
		this.setState({ visibleModalViewFile: true });
	}

	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}

	render() {
		const { allowEditting, isViewDetailFileAsModal } = this.props;
		const col24 = cssCol(24);

		return (
			<Row justify='center' style={{ width: '100%', margin: '2px' }}>
				{allowEditting && (
					<Col>
						<Upload
							listType="picture-card"
							className="avatar-uploader"
							onPreview={this.onViewDetailFile}
							onRemove={async (file) => {
								this.setState({ isLoadDone: false });
								await this.onRemove(Number(file.uid));
								this.setState({ isLoadDone: true });
							}}
							fileList={this.listFile}
						/>
					</Col>
				)}
				{(isViewDetailFileAsModal == undefined || isViewDetailFileAsModal == true) &&
					<Row>
						<Col
							{...col24}
							id={"ViewFileContentDocumentId"}
						>
							{this.itemFileView != undefined && this.itemFileView.uid != undefined ?
								<ViewFileManagerContent
									visible={this.state.visibleModalViewFile}
									onCancel={() => this.setState({ visibleModalViewFile: false })}
									urlView={this.itemFileView.url!}
									ext={this.itemFileView.ext}
									imageSize={this.props.imageSize!}
									fileName={this.listFile[0].name}
								/>
								: null}
						</Col>
					</Row>

				}
			</Row>
		);
	}
}
