import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '../AppComponentBase';
import { Checkbox, Select } from 'antd';
import AppConsts from '@src/lib/appconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
export interface IProps {
    listMachineId?: number[];
    disabled?: boolean;
    isClear?: boolean;
    onClear?: () => void;
    onChangeMachine?: (item: number[] | undefined) => void;
    groupMachineId?: number;
}
const { Option } = Select;
export default class SelectedMachineMultiple extends AppComponentBase<IProps> {
    state = {
        isLoading: false,
        ma_id_selected: undefined,
        allSelected: false,
    };
    machineListResult: MachineAbstractDto[] = [];
    async componentDidMount() {
        await this.setState({ isLoading: true });
        this.machineListResult = stores.sessionStore.getAllMachines();
        if (this.props.listMachineId != undefined) {
            await this.setState({ ma_id_selected: this.props.listMachineId });
        }
        await this.setState({ isLoading: false });
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.isClear !== this.props.isClear) {
            this.onClearSelect();
        }
        if (this.props.listMachineId !== prevProps.listMachineId) {
            this.setState({ ma_id_selected: this.props.listMachineId, allSelected: this.props.listMachineId?.length != 0 && this.props.listMachineId?.length === this.machineListResult.length });
        }
        if (this.props.groupMachineId !== prevProps.groupMachineId) {
            if (this.props.groupMachineId == undefined) {
                this.machineListResult = await stores.sessionStore.getAllMachines();
            } else {
                this.machineListResult = await stores.sessionStore
                    .getAllMachines()
                    .filter((item) => item.gr_ma_id == this.props.groupMachineId);
            }
            await this.setState({ ma_id_selected: undefined });
            this.onChangeMachine([]);
        }
    }
    onChangeMachine = async (listMachineId: number[]) => {
        await this.setState({ ma_id_selected: listMachineId });
        if (!!this.props.onChangeMachine) {
            this.props.onChangeMachine(listMachineId!.length > 0 ? listMachineId! : undefined);
        }
        this.setState({ allSelected: listMachineId.length === this.machineListResult.length });
    };
    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }
    onClearSelect() {
        this.setState({ ma_id_selected: undefined });
        if (this.props.onClear != undefined) {
            this.props.onClear();
        }
    }
    onSelectAll = () => {
        if (!this.state.allSelected) {
            const allIds = this.machineListResult.map((item) => item.ma_id);
            this.setState({
                ma_id_selected: allIds,
                allSelected: true,
            }, async () => await this.onChangeMachine(this.state.ma_id_selected || []));
        } else {
            this.setState({
                ma_id_selected: [],
                allSelected: false,
                isLoading: !this.state.isLoading
            }, () => this.props.onChangeMachine!(undefined));
        }
    };
    handleFilter = (inputValue, option) => {
        const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
        const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.children.toLowerCase().trim());
        return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
    };
    render() {
        const dropdownRender = (menu) => (
            <div>
                <Checkbox onChange={this.onSelectAll} checked={this.state.allSelected}>
                    Chọn tất cả
                </Checkbox>
                {menu}
            </div>
        );
        return (
            <>
                <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    maxTagCount={1}
                    maxTagTextLength={10}
                    onClear={() => this.onClearSelect()}
                    disabled={this.props.disabled}
                    placeholder={'Chọn máy bán nước'}
                    style={{ width: '100%' }}
                    value={this.state.ma_id_selected}
                    onChange={this.onChangeMachine}
                    filterOption={this.handleFilter}
                    dropdownRender={dropdownRender}
                >
                    {this.machineListResult.length > 0 &&
                        this.machineListResult.map((item) => (
                            <Option key={'key_machine_' + item.ma_id} value={item.ma_id}>{` ${item.ma_code
                                } -${stores.sessionStore.getNameMachines(item.ma_id)} `}</Option>
                        ))}
                </Select>
            </>
        );
    }
}
