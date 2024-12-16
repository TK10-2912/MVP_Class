import * as React from 'react';
import { Button, Card, Col, Modal, Row, Upload, message, Input } from 'antd';
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FileParameter, ImageProductDto, MachineDto, RenameFileInput, } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import Icon from '@ant-design/icons/lib/components/Icon';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { isGranted, L } from '@src/lib/abpUtility';
import FileSaver from 'file-saver';
import LayoutViewFile, { actionTable } from './component/LayoutViewPicture';
import { eComponentUpload } from '@src/lib/enumconst';
import CreateOrUpdateName from './component/CreateOrUpdateName';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import LayoutViewPicture from './component/LayoutViewPicture';

const { confirm } = Modal;
const { currentLogin } = stores.sessionStore;
export const ActionUpload = {
    File: 1,
    Folder: 2,
};
export default class PictureManager extends AppComponentBase {
    private fileInput: any = React.createRef();

    state = {
        isLoadDone: false,
        visibleModalDetail: false,
        actionUpload: ActionUpload.File,
        name_search: undefined,
        type_file: eComponentUpload.PRODUCT_IMAGE.num,
        isLoadChange: false,
        skipCount: 0,
        pageSize: 10,
        name: "",
        visibleModalRename: false,
        ma_id_list: [],
    };
    fileSelected: ImageProductDto = new ImageProductDto();
    parentFolderId: number = -1;
    filesInside: ImageProductDto[] = [];
    machineSelected: MachineDto;

    async componentDidMount() {
        this.setState({ isLoadDone: true });
        await this.getAll();
        this.setState({ currentId: currentLogin.user!.id });
        await this.setState({ isLoadDone: false, ma_id_list: [], });
    }

    getAll = async () => {
        if (isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Image)) {
            await stores.imageProductStore.getAllByAdmin(undefined, this.state.name_search, this.state.ma_id_list, this.state.skipCount, undefined);
            await stores.machineStore.getAllByAdmin(undefined,undefined, undefined, undefined, undefined, undefined, undefined);
        } else {
            await stores.imageProductStore.getAll(this.state.name_search, this.state.ma_id_list, this.state.skipCount, undefined);
            await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined);
        }
        await this.initDataFile(this.fileSelected)
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    searchData = async () => {
        this.setState({ isLoadDone: false });
        await this.getAll();
        await this.setState({ isLoadDone: true });
    }

    handleChange = async (info) => {
        if (info.file.status === 'done') {
            let item = info.file;
            if (item != undefined) {
                this.setState({ isLoadDone: false });
                let file = { "data": item.originFileObj, "fileName": item.name };
                let fileToUpload: FileParameter = file;
                let fi_id = this.fileSelected.im_pr_id;
                if (!/\.(png)$/.test(info.file.name)) {
                    message.error('Chỉ được phép tải tệp .png lên');
                    return;
                }
                if (item.originFileObj.size >= (0.2 * 1024 * 1024)) {
                    message.error(L('Không thể up file trên 0.2mb'));
                    return;
                }
                if (fi_id == undefined) {
                    fi_id = -1;
                }
                if (!!this.state.ma_id_list && this.state.ma_id_list.length > 0) {
                    this.state.ma_id_list.forEach(async item => {
                        await stores.imageProductStore.createFile(item, fileToUpload);
                        this.setState({ isLoadDone: true });
                        await this.getAll();
                        message.success(L("CreateSuccessfully"));
                    });
                } else {
                    message.error("Bạn chưa chọn máy!");
                }
            }
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name}` + L("FileUploadFailed") + ".");
        }
    }

    onFocusInput = async (action: number) => {
        await this.setState({ actionUpload: action });
        this.fileInput.click();
    }

    onDelete = async () => {
        this.setState({ isLoadDone: false });
        let self = this
        if (isGranted(AppConsts.Permission.Pages_Manager_General_Image_Delete)) {
            confirm({
                title: L('ban_co_chac_muon_xoa') + "?",
                okText: L('xac_nhan'),
                cancelText: L('huy'),
                async onOk() {
                    await stores.imageProductStore.deleteImageProduct(self.fileSelected);
                    self.setState({ isLoadDone: true });
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
            unitData.fi_name = this.state.name.trim();
            await stores.imageProductStore.renameFile(unitData);
            this.setState({ visibleModalRename: false, name: "" });
            message.success(L("thao_tac_thanh_cong"))
            this.getAll();
        }
        else {
            message.warning(L('yeu_cau_nhap_ten_tai_lieu'))
        }
    }
    initDataFile = async (item: ImageProductDto) => {
        this.setState({ isLoadDone: false })
        this.fileSelected = new ImageProductDto();
        await this.fileSelected.init(item);
        await this.setState({ actionUpload: ActionUpload.File, isLoadDone: false, isLoadChange: !this.state.isLoadChange });
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
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
        this.setState({ isLoadDone: false });
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        headers.append('Accept', 'application/json');
        headers.append('Origin', AppConsts.appBaseUrl + "");
        if (this.state.actionUpload == ActionUpload.File) {
            fetch(this.getImageProduct(this.fileSelected.im_pr_md5!), {
                mode: 'cors',
                credentials: 'include',
                method: 'POST',
                headers: headers,
            })
                .then(response => {
                    response.blob().then((blob) => {
                        blob = new Blob([blob], { type: blob.type });
                        FileSaver.saveAs(blob, this.fileSelected.im_pr_name);
                    });
                })
                .then(json => console.log(json))
                .catch(error => console.log('Authorization failed: ' + error.message));
        }
        message.success(L("thao_tac_thanh_cong"))
        await this.setState({ isLoadDone: true });
    }
    onAction = async (action: number, item?) => {
        action == actionTable.initDataFile && this.initDataFile(item);
        action == actionTable.onDelete && this.onDelete();
        action == actionTable.onRenameModal && this.onRenameModal();
        action == actionTable.onDownload && this.onDownload(item);
    }
    clearSearch = () => {
        this.setState({ name_search: undefined, ma_id_list: undefined })
    }
    render() {
        const props = {
            action: AppConsts.remoteServiceBaseUrl,
            onChange: this.handleChange,
            multiple: true,
            defaultFileList: [],
            showUploadList: false,
        };
        const { imageProductListResult } = stores.imageProductStore;
        const { machineListResult } = stores.machineStore
        const left = this.state.visibleModalDetail ? cssColResponsiveSpan(24, 24, 18, 18, 18, 18) : AppConsts.cssPanel(24);
        const right = this.state.visibleModalDetail ? cssColResponsiveSpan(24, 24, 6, 6, 6, 6) : AppConsts.cssPanel(0);

        return (
            <Card>
                <Row gutter={8} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 24, 8, 6, 6, 6)}>
                        <h2>{L("Quản lý ảnh")}</h2>
                        {isGranted(AppConsts.Permission.Pages_Manager_General_Image_Create) &&
                            <Button
                                type='primary'
                                style={{
                                    borderRadius: '5px',
                                    border: 'none',
                                    backgroundColor: '#edf2fc',
                                    color: 'black',
                                    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset'
                                }}
                                size='large'
                                icon={<PlusOutlined />}
                                onClick={() => this.onFocusInput(ActionUpload.File)}>Mới</Button>
                        }
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 24, 8, 8, 6, 6)}>
                        <strong>Tìm kiếm</strong>
                        <Input
                            allowClear
                            placeholder={"Nhập tên ảnh"}
                            onChange={async (e) => { await this.setState({ name_search: e.target.value }); this.getAll(); }}
                            value={this.state.name_search}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 24, 8, 8, 6, 6)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.getAll() }} listMachineId={this.state.ma_id_list} />
                    </Col>
                    {/* <Col {...cssColResponsiveSpan(24, 24, 16, 8, 6, 6)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
                        <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.searchData()} >Tìm kiếm</Button>
                        {(!!this.state.name_search || !!this.state.ma_id_list) &&
                            <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
                        }
                    </Col> */}
                </Row>
                <Upload {...props} >
                    <Button style={{ display: 'none' }} >
                        <Icon type="upload" ref={fileInput => this.fileInput = fileInput} />
                    </Button>
                </Upload>
                <Upload {...props} >
                    <Button style={{ display: 'none' }} >
                        <Icon type="upload" ref={fileInput => this.fileInput = fileInput} />
                    </Button>
                </Upload>
                <Row gutter={16}>
                    <Col {...left}>
                        <LayoutViewPicture
                            ma_id_list={this.state.ma_id_list?.length > 0 ? this.state.ma_id_list : machineListResult.map(item => item.ma_id)}
                            currentLogin={currentLogin}
                            filesInside={imageProductListResult}
                            fileSelected={this.fileSelected}
                            onAction={this.onAction}
                        />
                    </Col>
                </Row>
                <Modal
                    width={"30vw"}
                    visible={this.state.visibleModalRename}
                    title={(this.fileSelected.im_pr_id != undefined) ? L("ChangeName") : L("Thêm mới")}
                    okText={L("Confirm")}
                    cancelText={L("Cancel")}
                    onCancel={() => this.setState({ visibleModalRename: false })}
                    onOk={() => this.onCreateUpdate(this.state.actionUpload)}
                    destroyOnClose={true}
                    closable={false}
                    maskClosable={false}
                >
                    <CreateOrUpdateName name={this.state.name} onChangeName={(value) => this.setState({ name: value })}
                        onChangeNameFile={(value) => {
                            this.setState({ name: value });
                            this.onCreateUpdate(this.state.actionUpload)
                        }}
                    />
                </Modal>
            </Card >
        )
    }
}