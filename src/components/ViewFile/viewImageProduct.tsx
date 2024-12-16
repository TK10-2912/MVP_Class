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
	preview?: boolean;
}

@observer
class ViewImageProduct extends AppComponentBase<IViewFileContentProps, IViewFileContentState> {
	public render() {
		const { itemAttach, maxHeight, isThumnails, isFileScan } = this.props;
		return (
			<Image
				preview={this.props.preview}
				style={{ maxHeight: maxHeight || "50vh", maxWidth: "100%" }}
				src={(isFileScan !== undefined && isFileScan)
					? this.getImageProduct(itemAttach.md5!)
					: this.getImageProduct(itemAttach.md5!)}
			/>
		)
	}
}

export default ViewImageProduct;