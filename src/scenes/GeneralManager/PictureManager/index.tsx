import * as React from 'react';
import { Card, Col, Modal, Row, message, Input, Button, Space, Badge, Radio } from 'antd';
import { ImageProductDto, MachineDto, RenameFileInput, } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { isGranted, L } from '@src/lib/abpUtility';
import FileSaver from 'file-saver';
import { eComponentUpload } from '@src/lib/enumconst';
import { actionTable } from './component/ListFile';
import CreateOrUpdateName from './component/CreateOrUpdateName';
import { AppstoreOutlined, BarsOutlined, DownloadOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import LayoutViewFolderAndFile from './component/LayoutViewFolderAndFile';

const { confirm } = Modal;
const { currentLogin } = stores.sessionStore;
export const ActionUpload = {
    File: 1,
    Folder: 2,
};
export const ViewLayout = {
    List: 1,
    Grid: 2,
};

export default class PictureManager extends AppComponentBase {

    state = {
        isLoadDone: false,
        visibleModalDetail: false,
        actionUpload: ActionUpload.File,
        viewLayout: ViewLayout.List,
        name_search: undefined,
        type_file: eComponentUpload.PRODUCT_IMAGE.num,
        name: "",
        visibleModalRename: false,
        ma_id_list: [],
        selectedItems: [] as ImageProductDto[],
    };
    fileSelected: ImageProductDto = new ImageProductDto();
    fileChosen: ImageProductDto[];
    parentFolderId: number = -1;
    filesInside: ImageProductDto[] = [];
    machineSelected: MachineDto;
    controller: AbortController | null = null;

    async componentDidMount() {
        await this.getAll();
        this.setState({
            currentId: currentLogin.user!.id,
            ma_id_list: [],
            isLoadDone: !this.state.isLoadDone,
        });
    }

    getAll = async () => {
        await stores.imageProductStore.getAll(this.state.name_search, undefined, undefined);
        this.initDataFile(this.fileSelected)
    }

    onDelete = async () => {
        this.setState({ isLoadDone: true });
        let self = this
        if (isGranted(AppConsts.Permission.Pages_Manager_General_Image_Delete)) {
            confirm({
                title: L('ban_co_chac_muon_xoa') + "?",
                okText: L('xac_nhan'),
                cancelText: L('huy'),
                async onOk() {
                    await stores.imageProductStore.deleteImageProduct(self.fileSelected.im_pr_id!);
                    self.setState({ isLoadDone: false });
                    await self.getAll();
                    message.success(L("xoa_thanh_cong"));
                },
                onCancel() {
                },
            });
        }
    }
    onCreateUpdate = async (action: number) => {
        if (action == ActionUpload.File) {
            await this.onRenameFile();
        }
    }
    onRenameFile = async () => {
        if (this.state.name != undefined && this.state.name.trim() !== '') {
            let unitData = new RenameFileInput();
            unitData.fi_id = this.fileSelected.im_pr_id;
            unitData.fi_name = this.state.name.trim() + this.fileSelected.im_pr_extension;
            await stores.imageProductStore.renameFile(unitData);
            this.getAll();
            message.success(L("Thao tác thành công"));
            this.setState({ visibleModalRename: false, name: "" });
        }
        else {
            message.warning(L('Yêu cầu nhập tên tài liệu'));
        }
    }
    initDataFile = async (item: ImageProductDto) => {
        this.fileSelected = new ImageProductDto();
        this.fileSelected.init(item);
        await this.setState({ actionUpload: ActionUpload.File, isLoadDone: !this.state.isLoadDone });
    }

    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }
    onRenameModal = async () => {
        if (this.state.actionUpload == ActionUpload.File) {
            await this.setState({ name: this.fileSelected.im_pr_name });
        }
        this.setState({ visibleModalRename: true })
    }
    onDownload = async (item) => {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Origin', AppConsts.appBaseUrl + "");
        if (this.state.actionUpload == ActionUpload.File) {
            fetch(this.getImageProduct(item.im_pr_md5!), {
                mode: 'cors',
                credentials: 'include',
                method: 'POST',
                headers: headers,
            })
                .then(response => {
                    response.blob().then((blob) => {
                        blob = new Blob([blob], { type: blob.type });
                        FileSaver.saveAs(blob, item.im_pr_name);
                    });
                })
                .then(json => console.log(json))
                .catch(error => console.log('Authorization failed: ' + error.message));
        }
        message.success(L("Tải xuống thành công"));
        await this.setState({ isLoadDone: false });
    }
    onAction = async (action: number, item: ImageProductDto) => {
        action == actionTable.initDataFile && this.initDataFile(item);
        action == actionTable.onDelete && this.onDelete();
        action == actionTable.onRenameModal && this.onRenameModal();
        action == actionTable.onDownload && this.onDownload(item);
    }
    onSelectImage = async (item: ImageProductDto[]) => {
        await this.setState({ selectedItems: item, isLoadDone: !this.state.isLoadDone });
    }
    onDownloadMulti = async () => {
        const self = this;
        confirm({
            title: (
                <span>
                    Bạn có muốn tải xuống <span style={{ color: '#1DA57A' }}><b>{self.state.selectedItems.length}</b></span> ảnh không?
                </span>
            ),
            icon: <ExclamationCircleFilled />,
            content: 'Quá trình tải xuống có thể mất một chút thời gian.',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    const imageNames = self.state.selectedItems.map(a => a.im_pr_path!);
                    await self.zipImageProduct1(imageNames);
                } catch (error) {
                    message.info("Đã hủy tiến trình tải xuống!");
                }
            },
            onCancel() {
                self.zipImageProduct1([], true);
            }
        });
    };


    handleClick = () => {
        const self = this;
        this.controller = new AbortController();
        let signal = this.controller.signal;

        confirm({
            title: (
                <span>
                    Bạn có muốn tải xuống <span style={{ color: '#1DA57A' }}><b>tất cả</b></span> ảnh ?
                </span>
            ),
            icon: <ExclamationCircleFilled />,
            content: 'Quá trình tải xuống có thể mất một chút thời gian.',
            cancelText: 'Hủy',
            async onOk() {
                const response = await fetch(AppConsts.remoteServiceBaseUrl + "download/zipImageProduct", { signal });
                if (!response.ok) {
                    throw new Error('Lỗi khi tải xuống file');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'zipImageProduct.zip';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);

                message.success("Tải xuống thành công");
            },
            onCancel() {


            }
        });
    };



    render() {
        const { imageProductListResult } = stores.imageProductStore;
        return (
            <Card>
                <Row gutter={[16, 16]} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 12, 6, 6, 4, 4)}>
                        <h2>Quản lý ảnh</h2>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 6, 6, 6, 6)}>
                        <strong>Ảnh sản phẩm</strong>
                        <Input
                            allowClear
                            placeholder={"Nhập tên ảnh"}
                            onChange={async (e) => { await this.setState({ name_search: e.target.value }); this.getAll(); }}
                            value={this.state.name_search}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 24, 12, 12, 14, 14)} style={{ textAlign: 'end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', gap: '24px' }}>
                            <Badge count={this.state.selectedItems.length} overflowCount={9999} style={{ zIndex: 10 }}>
                                <Button
                                    type="primary"
                                    title={this.state.selectedItems.length ? 'Tải xuống' : 'Tải xuống tất cả'}
                                    icon={<DownloadOutlined />}
                                    onClick={() => { this.state.selectedItems.length ? this.onDownloadMulti() : this.handleClick() }}
                                >
                                    {this.state.selectedItems.length ? 'Tải xuống' : 'Tải xuống tất cả'}
                                </Button>
                            </Badge>
                            <Radio.Group
                                onChange={async e => await this.setState({ viewLayout: e.target.value, selectedItems: [] })}
                                defaultValue={ViewLayout.List}
                            >
                                <span title='Bố cục dạng danh sách'><Radio.Button value={ViewLayout.List}><BarsOutlined /></Radio.Button></span>
                                <span title='Bố cục dạng lưới'><Radio.Button value={ViewLayout.Grid}><AppstoreOutlined /></Radio.Button></span>
                            </Radio.Group>
                        </div>
                    </Col>
                </Row>
                {imageProductListResult.length > 0 &&
                    <LayoutViewFolderAndFile
                        onSelectImage={this.onSelectImage}
                        filesInside={imageProductListResult}
                        fileSelected={this.fileSelected}
                        onAction={this.onAction}
                        viewLayout={this.state.viewLayout}
                    />
                }
                <Modal
                    width={"30vw"}
                    visible={this.state.visibleModalRename}
                    title={(this.fileSelected.im_pr_id != undefined) ? L("Đổi tên") : L("Thêm mới")}
                    okText={L("Xác nhận")}
                    cancelText={L("Hủy")}
                    onCancel={() => this.setState({ visibleModalRename: false })}
                    onOk={() => this.onRenameFile()}
                    destroyOnClose={true}
                    closable={false}
                    maskClosable={false}
                >
                    <CreateOrUpdateName name={this.state.name} onChangeName={async (value) => { await this.setState({ name: value }) }} />
                </Modal>
            </Card >
        )
    }
}