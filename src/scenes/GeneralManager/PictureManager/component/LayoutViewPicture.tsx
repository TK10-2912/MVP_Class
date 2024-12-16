import React from 'react';
import { Col, Dropdown, Menu, Row } from 'antd';
import { AttachmentItem, GetCurrentLoginInformationsOutput, ImageProductDto, } from '@src/services/services_autogen';
import { DeleteOutlined, DownloadOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { EComponentUpload } from '@src/lib/appconst';
import { L } from '@src/lib/abpUtility';
import PictureAttachment from './PictureAttachment';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';

export const actionTable = {
    initDataFolder: 1,
    initDataFile: 2,
    onStarred: 3,
    onRenameModal: 4,
    onDelete: 5,
    onDoubleClickRow: 6,
    onDetailModal: 7,
    onMoveLocation: 8,
    onShareItem: 9,
    onChangeTypeFileOrFolder: 10,
    onDownload: 11,
}
export interface Iprops {
    filesInside: ImageProductDto[];
    fileSelected: ImageProductDto;
    onAction: (action: number, item?) => void;
    currentLogin: GetCurrentLoginInformationsOutput;
    ma_id_list: number[];
}
export default class LayoutViewPicture extends AppComponentBase<Iprops> {
    state = {
        isLoadDone: false,
    };
    attachmentItem: AttachmentItem = new AttachmentItem;

    onAction = async (action: number, item?) => {
        this.setState({ isLoadDone: false, })
        if (this.props.onAction != undefined) {
            await this.props.onAction(action, item);
            this.setState({ isLoadDone: true, });
        }
    }

    render() {
        const { filesInside, fileSelected } = this.props;
        const menuClickRow = (
            <Menu>
                <Menu.Item key="Row_download" onClick={() => this.onAction(actionTable.onDownload)}><DownloadOutlined target="_blank" href={process.env.PUBLIC_URL + "/1.png"} download style={{ fontSize: '18px' }} />&nbsp;{L("Download")}</Menu.Item>
                <Menu.Item key="Row_change_name" onClick={() => this.onAction(actionTable.onRenameModal)}><EditOutlined style={{ fontSize: '18px' }} />&nbsp;{L("ChangeName")}</Menu.Item>
                <Menu.Item key="Row_delete" onClick={() => this.onAction(actionTable.onDelete)}><DeleteOutlined style={{ fontSize: '18px' }} />&nbsp;{L("Delete")}</Menu.Item>
            </Menu>
        );
        return (
            <>
                {this.props.ma_id_list.map((item, index) => (
                    <Row key={index} style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <Col span={24}><h2 style={{ marginTop: 20 }}>{stores.sessionStore.getNameMachines(item)}</h2></Col>
                        {
                            filesInside.map((record, index) => record.ma_id == item && (
                                <div
                                    key={index}
                                    onClick={() => this.onAction(actionTable.initDataFile, item)}
                                    className={fileSelected.im_pr_id == record.im_pr_id ? "bg-click" : "bg-folder"}
                                    style={{ padding: 15, borderRadius: 8, fontSize: '15px', textAlign: 'center', }}
                                >
                                    <Row>
                                        <div style={{ whiteSpace: 'nowrap', width: '100px', textOverflow: 'ellipsis', overflow: 'hidden' }}>{record.im_pr_name}</div>
                                        <div>
                                            <Dropdown overlay={menuClickRow} trigger={['click']} >
                                                <MoreOutlined style={{ fontSize: '18px' }} onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => this.onAction(actionTable.initDataFile, item)} />
                                            </Dropdown>
                                        </div>
                                    </Row>
                                    <PictureAttachment
                                        files={[record]}
                                        allowEditting={true}
                                        componentUpload={EComponentUpload.APK}
                                        onRemove={async (id: number) => {
                                            await this.onAction(actionTable.onDelete);
                                        }}
                                        imageSize={500}
                                    />
                                </div>
                            ))
                        }
                    </Row>
                ))}
            </>
        )
    }
}