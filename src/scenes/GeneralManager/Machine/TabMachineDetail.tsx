import { StepBackwardOutlined } from '@ant-design/icons';
import { L, isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import { MachineDto } from '@src/services/services_autogen';
import { Button, Tabs } from 'antd';
import * as React from 'react';
import CreateOrUpdateMachineAdmin from './componentsAdmin/CreateOrUpdateMachineAdmin';
import CreateOrUpdateMachineUser from './componentsUser/CreateOrUpdateMachineUser';
import HistoryUpdate from './HistoryUpdate';
import MachineDetail from '../MachineDetail';

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
}
export default class TabMachineDetail extends React.Component<Iprops> {
    render() {
        return (
            <>
                <Tabs defaultActiveKey={tabManager.tab_1}>
                    <Tabs.TabPane tab={(
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                icon={<StepBackwardOutlined style={{ margin: '0' }} />}
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
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2} disabled={this.props.machineSelected.ma_id === undefined}>
                        <MachineDetail machineSelected={this.props.machineSelected} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3} disabled={this.props.machineSelected.ma_id === undefined}>
                        <HistoryUpdate machineSelected={this.props.machineSelected} ma_id={this.props.ma_id} is_printed={false}  />
                    </Tabs.TabPane>
                </Tabs>
            </>
        )
    }
}