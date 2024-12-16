import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '../AppComponentBase';
import { Divider, Modal, Select } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import GroupMachine from '@src/scenes/GeneralManager/GroupMachine';
import AppConsts from '@src/lib/appconst';
export interface IProps {
    groupmachineId?: number;
    disabled?: boolean;
    onClear?: () => void;
    onChangeGroupMachine?: (item: number) => void;
    onClearSearch?: boolean;
    visibleMachine?: boolean;
    parent?:string
}
const { Option } = Select;
export default class SelectedGroupMachine extends AppComponentBase<IProps> {
    state = {
        isLoading: false,
        gr_ma_id_selected: undefined,
        visibleModalSupplier: false,
    };
    async getAll() {
        await stores.groupMachineStore.getAllByAdmin(this.state.gr_ma_id_selected, undefined, undefined, undefined);
        this.setState({ isLoading: !this.state.isLoading });
    }
    async componentDidMount() {
        if (this.props.groupmachineId != undefined) {
            this.setState({ gr_ma_id_selected: this.props.groupmachineId });
        }
        await this.getAll();
    }

    componentDidUpdate(prevProps) {
        if (this.props.groupmachineId !== prevProps.groupmachineId) {
            this.setState({ gr_ma_id_selected: this.props.groupmachineId });
        }
        if (this.props.onClearSearch) {
            this.onClearSelect();
        }
    }
    onChangeGroupMachine = async (ma_id: number) => {
        await this.setState({ gr_ma_id_selected: ma_id });
        if (!!this.props.onChangeGroupMachine) {
            this.props.onChangeGroupMachine(ma_id);
        }
    };

    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }
    onClearSelect() {
        this.setState({ gr_ma_id_selected: undefined });
        if (this.props.onClear != undefined) {
            this.props.onClear();
        }
    }
    handleFilter = (inputValue, option) => {
        const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
        const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.children.toLowerCase().trim());
        return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
    };
    render() {
        const { groupMachineListResult } = stores.groupMachineStore;
        return (
            <>
                <Select
                    showSearch
                    allowClear
                    onClear={() => this.onClearSelect()}
                    disabled={this.props.disabled}
                    placeholder="Chọn nhóm máy"
                    style={{ width: '100%' }}
                    value={this.state.gr_ma_id_selected}
                    onChange={async (value: number) => await this.props.onChangeGroupMachine!(value)}
                    filterOption={this.handleFilter}
                    dropdownRender={(menu) => (
                        <div>
                            {menu}
                            <Divider style={{ margin: '4px 0' }} />
                            <div
                                style={{ padding: '4px 8px', cursor: 'pointer', textAlign: 'center' }}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => this.setState({ visibleModalSupplier: true })}
                            >
                                {this.isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine) &&
                                    <span title={'Quản lý nhóm máy'}>
                                        <SettingOutlined /> Quản lý nhóm máy
                                    </span>
                                }
                            </div>
                        </div>

                    )}
                >
                    {groupMachineListResult?.map((item) => (
                        <Option key={'key_machine_' + item.gr_ma_id} value={item.gr_ma_id}>
                            {item.gr_ma_area}
                        </Option>
                        
                    ))}
                      <Option key="no_group" value={-1} >
                        Chưa có nhóm máy
                    </Option>
                </Select>
                <Modal
                    visible={this.state.visibleModalSupplier}
                    title={<strong>Quản lý nhóm máy</strong>}
                    onCancel={() => this.setState({ visibleModalSupplier: false })}
                    footer={null}
                    width="80vw"
                    maskClosable={false}
                >
                    <GroupMachine visibleMachine={this.props.visibleMachine} />
                </Modal>
            </>
        );
    }
}
