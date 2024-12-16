import * as React from 'react';

import { Row, Image, Modal, Col, Button } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { observer } from 'mobx-react';
import FileViewer from 'react-file-viewer';
import './index.css';
import MineTypeConst from '@lib/minetypeConst';
import { L } from '@src/lib/abpUtility';

export interface IViewFileContentProps {
	urlView: string;
	ext: string;
	maxHeight?: string;
	onCancel: () => void;
	visible: boolean;
	imageSize: number;
	fileName?: string;
}

@observer
class ViewFileManagerContent extends AppComponentBase<IViewFileContentProps> {
	public render() {		
		const { urlView, ext, maxHeight } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={<h2>{this.props.fileName}</h2>}
				centered
				footer={null}
				width='80vw'
				onCancel={this.props.onCancel}
			>
				<div key={urlView + L("viewFile")} className="paneldisplaycontentpdfclass" style={{ height: (maxHeight != undefined) ? maxHeight : "75vh", alignItems: 'center', justifyContent: 'center' }}>
					{(urlView !== undefined && ext !== undefined) ? (
						<>
							{(MineTypeConst.checkExtentionFileType(ext) === MineTypeConst.IMAGE_EXT) ? (
								<Row justify='center'>
									<Image
										width={this.props.imageSize}
										src={urlView}
									/>
								</Row>
							) : null}

							{(MineTypeConst.checkExtentionFileType(ext) === MineTypeConst.VIDEO_EXT) ? (
								<video
									style={{ width: '100%', height: "100%", maxHeight: (maxHeight != undefined) ? maxHeight : "70vh" }}
									controls={true}
									src={urlView}
								/>
							) : null}

							{(MineTypeConst.checkExtentionFileType(ext) === MineTypeConst.PDF_EXT) ? (
								(ext.replace(".", "") === "pdf") ? (
									<FileViewer
										fileType={ext.replace(".", "")}
										filePath={urlView}
									/>
								) : (
									<Row>{L('khong_the_xem_file')}</Row>
								)
							) : null}
							{((MineTypeConst.checkExtentionFileType(ext)) === MineTypeConst.TXT_EXT) ? (
								(ext.replace(".", "") === "docx") ? (
									<FileViewer
										fileType={ext.replace(".", "")}
										filePath={urlView}
									/>
									// <DocViewer pluginRenderers={DocViewerRenderers} documents={[{
									// 	uri: this.props.fileView.url,
									// 	fileType: `${itemAttach.ext.replace(".", "")}`
									// }]} />
								) : (
									<Row>{L('khong_the_xem_file')}</Row>

								)
							) : null}
							{((MineTypeConst.checkExtentionFileType(ext)) === MineTypeConst.EXCEL_EXT) ? (
								(ext.replace(".", "") === "xlsx") ? (
									<FileViewer
										fileType={ext.replace(".", "")}
										filePath={urlView}
									/>
								) : (
									<Row>{L('khong_the_xem_file')}</Row>

								)
							) : null}
						</>
					) : <Row>{L('khong_the_xem_file')}</Row>
					}

				</div>
			</Modal>
		);
	}
}

export default ViewFileManagerContent;