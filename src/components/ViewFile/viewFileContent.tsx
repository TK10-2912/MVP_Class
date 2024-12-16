import * as React from 'react';

import { Row, Image } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { observer } from 'mobx-react';
import FileViewer from 'react-file-viewer';
import './index.css';
import { AttachmentItem } from '@services/services_autogen';
import MineTypeConst from '@lib/minetypeConst';
// import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

export interface IViewFileContentState {

}
export interface IViewFileContentProps {
	itemAttach: AttachmentItem;
	maxHeight?: string;
	isThumnails?: boolean;
	isFileScan?: boolean;
}

@observer
class ViewFileContent extends AppComponentBase<IViewFileContentProps, IViewFileContentState> {
	public render() {
		const { itemAttach, maxHeight, isThumnails, isFileScan } = this.props;
		return (
			<div key={itemAttach.id + "viewFile" + itemAttach.key} className="paneldisplaycontentpdfclass" style={{ height: (maxHeight != undefined) ? maxHeight : "97vh", overflow: 'auto', alignItems: 'center', textAlign: 'center' }}>
				{(itemAttach != undefined && itemAttach.id != undefined && itemAttach.ext != undefined && [...MineTypeConst.IMAGE_EXT_LIST, ...MineTypeConst.PDF_EXT_LIST, ...MineTypeConst.VIDEO_EXT_LIST, ...MineTypeConst.EXCEL_EXT_LIST, ...MineTypeConst.TXT_EXT_LIST, ...MineTypeConst.PP_EXT_LIST].includes(itemAttach.ext)) ? (
					<>
						{(MineTypeConst.checkExtentionFileType(itemAttach.ext) === MineTypeConst.IMAGE_EXT) ? (
							<Row justify='center'>
								<Image
									sizes={(maxHeight != undefined) ? maxHeight : "70vh"}
									src={(isFileScan != undefined && isFileScan) ? this.getFile(itemAttach.id) : this.getFile(itemAttach.id)}
								/>
							</Row>
						) : null}

						{(MineTypeConst.checkExtentionFileType(itemAttach.ext) === MineTypeConst.VIDEO_EXT) ? (
							<video
								style={{ width: '100%', height: "100%", maxHeight: (maxHeight != undefined) ? maxHeight : "70vh" }}
								controls={true}
								src={(isFileScan != undefined && isFileScan) ? this.getFile(itemAttach.id) : this.getFile(itemAttach.id)}
							/>
						) : null}

						{(MineTypeConst.checkExtentionFileType(itemAttach.ext) === MineTypeConst.PDF_EXT) ? (
							(itemAttach.ext.replace(".", "") === "pdf") ? (
								<FileViewer
									fileType={itemAttach.ext.replace(".", "")}
									filePath={(isFileScan != undefined && isFileScan) ? this.getFile(itemAttach.id) : this.getFile(itemAttach.id)} />
							) : (
								<Row>Can not view file!</Row>
							)
						) : null}
						{(MineTypeConst.checkExtentionFileType(itemAttach.ext) === MineTypeConst.TXT_EXT) ? (
							(itemAttach.ext.replace(".", "") === "docx") ? (
								<FileViewer
									fileType={itemAttach.ext.replace(".", "")}
									filePath={(isFileScan != undefined && isFileScan) ? this.getFile(itemAttach.id) : this.getFile(itemAttach.id)} />
							) : (
								(itemAttach.ext.replace(".", "") === "doc") ? (
									// <DocViewer documents={[{
									// 	uri: this.getFile(itemAttach.id),
									// 	fileType: `${itemAttach.ext.replace(".", "")}`
									// }]} />
									<></>
								) :
								//  <DocViewer pluginRenderers={DocViewerRenderers} documents={[{
								// 	uri: this.getFile(itemAttach.id),
								// 	fileType: `${itemAttach.ext.replace(".", "")}`
								// }]} />
								<></>
							)
						) : null}

						{(MineTypeConst.checkExtentionFileType(itemAttach.ext) === MineTypeConst.EXCEL_EXT) ? (
							(itemAttach.ext.replace(".", "") === "xlsx") ? (
								<FileViewer
									fileType={itemAttach.ext.replace(".", "")}
									filePath={(isFileScan != undefined && isFileScan) ? this.getFile(itemAttach.id) : this.getFile(itemAttach.id)} />
							) : (
								// <DocViewer documents={[{
								// 	uri: this.getFile(itemAttach.id),
								// 	fileType: `${itemAttach.ext.replace(".", "")}`
								// }]} />
								<></>
							)
						) : null}
							{(MineTypeConst.checkExtentionFileType(itemAttach.ext) === MineTypeConst.PP_EXT) ? (
							 (
								// <DocViewer documents={[{
								// 	uri: this.getFile(itemAttach.id),
								// 	fileType: `${itemAttach.ext.replace(".", "")}`
								// }]} />
								<></>
							)
						) : null}
					</>
				) : <Row>Can not view file</Row>}

			</div>
		);
	}
}

export default ViewFileContent;