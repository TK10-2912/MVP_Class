import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '../AppComponentBase';
import { Checkbox, Select } from 'antd';
import AppConsts from '@src/lib/appconst';
import { MachineAbstractDto, MachineDto } from '@src/services/services_autogen';
export interface IProps {
    listMachineId?: number[];
    disabled?: boolean;
    isClear?: boolean;
    onClear?: () => void;
    onChangeMachine?: (item: number[] | undefined) => void;
    groupMachineId?: number;
    us_id: number;
}
const { Option } = Select;
export default class SelectedMachineMultipleHandover extends AppComponentBase<IProps> {
    state = {
        isLoading: false,
        ma_id_selected: undefined,
        allSelected: false,
        us_id: undefined,
    };
    machineListResult: MachineDto[] = [];
    async componentDidMount() {
        this.setState({ isLoading: true });
        if (this.props.listMachineId != undefined) {
            await this.setState({ ma_id_selected: this.props.listMachineId });
        }
        if (!!this.props.us_id) {
            await this.setState({ us_id: this.props.us_id });
        }
        await this.getAll();

        this.setState({ isLoading: false });
    }
    async getAll() {
        await this.setState({ isLoading: true });
        await stores.machineStore.getAllByAdmin(this.state.us_id != undefined ? [this.state.us_id!] : undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        const { machineListResult } = stores.machineStore;
        this.machineListResult = machineListResult;
        await this.setState({ isLoading: false });

    }
    async componentDidUpdate(prevProps) {
        if (prevProps.isClear !== this.props.isClear) {
            this.onClearSelect();
        }
        if (prevProps.us_id !== this.props.us_id) {
            await this.setState({ us_id: this.props.us_id });
            this.getAll();
        }
        if (this.props.listMachineId !== prevProps.listMachineId) {
            this.setState({ ma_id_selected: this.props.listMachineId });
        }
        if (this.props.groupMachineId !== prevProps.groupMachineId) {
            const { machineListResult } = stores.machineStore;
            if (this.props.groupMachineId == undefined) {
                this.machineListResult = machineListResult;
            } else {
                this.machineListResult = machineListResult.filter((item) => item.gr_ma_id == this.props.groupMachineId);
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
            },() => this.props.onChangeMachine!(undefined));
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
                    maxTagTextLength={15}
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
