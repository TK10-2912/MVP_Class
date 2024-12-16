import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '../AppComponentBase';
import { Divider, Modal, Select } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import AppConsts from '@src/lib/appconst';
import { GroupTrashbinAbstractDto } from '@src/services/services_autogen';
import GroupTrashBin from '@src/scenes/GeneralManager/GroupTrashBin';
export interface IProps {
    groupTrashBinID?: number;
    disabled?: boolean;
    onClear?: () => void;
    onChangeGroupTrashBin?: (item: number) => void;
    getAll?: () => void;
    onClearSearch?: boolean;
}
const { Option } = Select;
export default class SelectedGroupTrashBin extends AppComponentBase<IProps> {
    state = {
        isLoading: false,
        gr_tr_id_selected: undefined,
        visibleModal: false,
    };
    groupTrashBin: GroupTrashbinAbstractDto[] = [];
    async componentDidMount() {
        await this.setState({ isLoading: true });
        if (this.props.groupTrashBinID != undefined) {
            this.setState({ gr_tr_id_selected: this.props.groupTrashBinID });
        }
        this.getAll();
        await this.setState({ isLoading: false });
    }
    getAll = () => {
        this.groupTrashBin = stores.sessionStore.getAllGroupTrashBin();
        this.groupTrashBin.unshift(
            GroupTrashbinAbstractDto.fromJS({ gr_tr_id: -1, gr_tr_name: 'Không có nhóm thùng rác' })
        );
    }
    componentDidUpdate(prevProps) {
        if (this.props.groupTrashBinID !== prevProps.groupTrashBinID) {
            this.setState({ gr_tr_id_selected: this.props.groupTrashBinID });
        }
        if (this.props.onClearSearch) {
            this.onClearSelect();
        }
    }
    onChangeGroupTrashBin = async (gr_tr_id: number) => {
        await this.setState({ gr_tr_id_selected: gr_tr_id });
        if (!!this.props.onChangeGroupTrashBin) {
            this.props.onChangeGroupTrashBin(gr_tr_id);
        }
    };

    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }
    onClearSelect() {
        this.setState({ gr_tr_id_selected: undefined });
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
        return (
            <>
                <Select
                    showSearch
                    allowClear
                    onClear={() => this.onClearSelect()}
                    disabled={this.props.disabled}
                    placeholder="Chọn nhóm thùng rác"
                    loading={this.state.isLoading}
                    style={{ width: '100%' }}
                    value={this.state.gr_tr_id_selected}
                    onChange={async (value: number) => await this.props.onChangeGroupTrashBin!(value)}
                    filterOption={this.handleFilter}
                    dropdownRender={(menu) => (
                        <div>
                            {menu}
                            <Divider style={{ margin: '4px 0' }} />
                            <div
                                style={{ padding: '4px 8px', cursor: 'pointer', textAlign: 'center' }}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => this.setState({ visibleModal: true })}
                            >
                                {this.isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine) &&
                                    <>
                                        <SettingOutlined title={'Quản lý nhóm thùng rác'} />
                                        {' Quản lý nhóm thùng rác'}
                                    </>
                                }
                            </div>
                        </div>

                    )}
                >
                    {this.groupTrashBin != undefined &&
                        this.groupTrashBin!.length > 0 &&
                        this.groupTrashBin!.map((item) => (
                            <Option key={'key_machine_' + item.gr_tr_id} value={item.gr_tr_id}>
                                {item.gr_tr_name}
                            </Option>
                        ))}
                </Select>
                <Modal
                    visible={this.state.visibleModal}
                    title={<strong>Quản lý nhóm thùng rác</strong>}
                    onCancel={() => {
                        this.getAll()
                        this.props.getAll!();
                        this.setState({ visibleModal: false, });
                    }}
                    footer={null}
                    width="80vw"
                    maskClosable={false}
                >
                    <GroupTrashBin />
                </Modal>
            </>
        );
    }
}
