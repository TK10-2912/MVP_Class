import { StepBackwardOutlined } from '@ant-design/icons';
import { L, isGranted } from '@src/lib/abpUtility';
import AppConsts, { RouterPath } from '@src/lib/appconst';
import { MachineDetailDto, MachineDto } from '@src/services/services_autogen';
import { Button, Modal, Skeleton, Tabs } from 'antd';
import * as React from 'react';
import CreateOrUpdateMachineAdmin from './componentsAdmin/CreateOrUpdateMachineAdmin';
import CreateOrUpdateMachineUser from './componentsUser/CreateOrUpdateMachineUser';
import HistoryUpdate from './HistoryUpdate';
import { stores } from '@src/stores/storeInitializer';
import ProductListMachineDetail from '../Layout/component/ProductListMachineDetail';
import PassWordLevel2 from '@src/scenes/SystemManager/Users/components/PassWordLevel2';
import PassWord from '@src/scenes/SystemManager/Users/components/PassWord';
import HistoryHelper from '@src/lib/historyHelper';
import MediaFileMachine from './MediaFileMachine';
import LocationLogMachine from './LocationLogMachine';

export interface Iprops {
    onCreateUpdateSuccess?: () => void;
    onCancel: () => void;
    machineSelected: MachineDto;
    ma_id?: number;
}

export const tabManager = {
    tab_1: L("Thông tin máy"),
    tab_2: L('Bố cục máy'),
    tab_3: L("Lịch sử cập nhật"),
    tab_4: L("Thư viện quảng cáo"),
    tab_5: L("Lịch sử đặt máy"),
}
export default class TabMachineDetail extends React.Component<Iprops> {
    state = {
        isLoadDone: false,
        hasPasswordLever2: false,
        isCheckPassword2: false,
        visiblePassWordModalOpen: false,
        isLoading: true,
    }
    machineDetailSelected: MachineDetailDto[] = [];
    async componentDidMount() {
        const sessionData = await stores.sessionStore.currentLogin
        await Promise.all([
            this.getAllMachineDetail(),
            this.getAllProduct()
        ])
        await this.setState({
            isLoadDone: !this.state.isLoadDone,
            hasPasswordLever2: sessionData.user.hasPassword2,
            isCheckPassword2: true,
            visiblePassWordModalOpen: false,
        });
    }
    getAllMachineDetail = async () => {
        await stores.machineDetailStore.getAll(this.props.ma_id);
        const { machineDetailListResult } = stores.machineDetailStore;
        this.machineDetailSelected = machineDetailListResult.filter(record => record.ma_id === this.props.ma_id);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    getAllProduct = async () => {
        await stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onSuccess = async () => {
        await this.getAllMachineDetail();
        await this.getAllProduct();
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onsavePassWord = async (val: boolean) => {
        if (val != undefined && val == true) {
            this.setState({ filter: undefined, checkModal: true, visiblePassWordModalOpen: false, isLoading: false });
        } else {
            Modal.error({ title: ("Thông báo"), content: ("Không được truy cập") });
            HistoryHelper.redirect(RouterPath.admin_home);
        }
    }

    onCancelUsersPassWord = () => {
        this.setState({ visiblePassWordModalOpen: false });
        if (this.state.isCheckPassword2 == true) {
            HistoryHelper.redirect(RouterPath.admin_home);
        }
    }

    render() {
        const { productDetailListResult } = stores.productStore;
        return (
            <>
                <Tabs defaultActiveKey={tabManager.tab_1} style={{ overflow: 'unset' }} onChange={async activeKey => {
                    if (activeKey === "Bố cục máy") {
                        await this.setState({ visiblePassWordModalOpen: true, isLoading: true });
                    }
                }}>
                    <Tabs.TabPane tab={(
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                icon={<StepBackwardOutlined style={{ margin: 0 }} />}
                                onClick={this.props.onCancel}
                                style={{ marginRight: '5px' }}
                            />
                            {tabManager.tab_1}
                        </div>
                    )} key={tabManager.tab_1}>
                        {isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Machine) ?
                            <CreateOrUpdateMachineAdmin machineSelected={this.props.machineSelected} createSuccess={this.props.onCreateUpdateSuccess} onCancel={this.props.onCancel} />
                            :
                            <CreateOrUpdateMachineUser machineSelected={this.props.machineSelected} createSuccess={this.props.onCreateUpdateSuccess} onCancel={this.props.onCancel} />

                        }
                    </Tabs.TabPane>
                    {isGranted(AppConsts.Permission.Pages_Manager_General_MachineDetail) &&
                        <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2} disabled={this.props.machineSelected.ma_id === undefined}>
                            <Skeleton active loading={this.state.isLoading}>
                                <ProductListMachineDetail
                                    onSuccess={this.onSuccess}
                                    onCancel={this.props.onCancel}
                                    ma_layout={this.props.machineSelected?.ma_layout}
                                    ma_rangeDisplayVending={this.props.machineSelected.ma_rangeDisplayVending}
                                    listProductDetail={productDetailListResult}
                                    machineDetailSelected={this.machineDetailSelected}
                                    ma_name={this.props.machineSelected.ma_display_name!}
                                    ma_commandRefill={this.props.machineSelected.ma_commandRefill}
                                />
                            </Skeleton>
                        </Tabs.TabPane>
                    }
                    <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3} disabled={this.props.machineSelected.ma_id === undefined}>
                        <HistoryUpdate machineSelected={this.props.machineSelected} ma_id={this.props.ma_id} is_printed={false} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_4} key={tabManager.tab_4} disabled={this.props.machineSelected.ma_id === undefined}>
                        <MediaFileMachine machineSelected={this.props.machineSelected} is_printed={false} />
                    </Tabs.TabPane>
                    {isGranted(AppConsts.Permission.Pages_Manager_General_MachineLocationLogs) &&
                        <Tabs.TabPane tab={tabManager.tab_5} key={tabManager.tab_5} disabled={this.props.machineSelected.ma_id === undefined}>
                            <LocationLogMachine machineSelected={this.props.machineSelected} is_printed={false} />
                        </Tabs.TabPane>
                    }
                </Tabs>
                <Modal
                    title={this.state.hasPasswordLever2 ? 'Mật khẩu cấp 2' : 'Mật khẩu'}
                    visible={this.state.visiblePassWordModalOpen}
                    onCancel={this.onCancelUsersPassWord}
                    cancelText={L("Hủy")}
                    footer={null}
                    className="UsersPassWordLevel2ModalClass"
                    destroyOnClose={true}
                    width={"40vw"}
                >
                    {this.state.hasPasswordLever2
                        ?
                        <PassWordLevel2
                            oncancel={() => this.setState({ visiblePassWordModalOpen: false })}
                            onsave={this.onsavePassWord}
                            isCheckPassword2={this.state.isCheckPassword2}
                        />
                        :
                        <PassWord
                            oncancel={() => this.setState({ visiblePassWordModalOpen: false })}
                            onsave={this.onsavePassWord}
                            isCheckPassword2={this.state.isCheckPassword2}
                        />
                    }
                </Modal >
            </>
        )
    }
}