import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import { MachineAbstractDto, MachineDto } from '@src/services/services_autogen';
import AppConsts from '@src/lib/appconst';
export interface IProps {
	listMachineId?: number[];
	machineListResult?: MachineAbstractDto[];
	disabled?: boolean;
	onClear?: () => void,
	onChangeMachine?: (item: number[]) => void;
}
const { Option } = Select;
export default class SelectedMachineStatistic extends AppComponentBase<IProps>{
	state = {
		isLoading: false,
		ma_id_selected: undefined,
	};

	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.listMachineId != undefined) {
			await this.setState({ ma_id_selected: this.props.listMachineId });
		}
		await this.setState({ isLoading: false });
	}

	async componentDidUpdate(prevProps) {
		if (this.props.listMachineId !== prevProps.listMachineId) {
			this.setState({ ma_id_selected: this.props.listMachineId });
		}
	}

	onChangeMachine = async (listMachineId: number[]) => {
		await this.setState({ ma_id_selected: listMachineId });
		if (!!this.props.onChangeMachine) {
			this.props.onChangeMachine(listMachineId);
		}
	}

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
	handleFilter = (inputValue, option) => {
		const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
		const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.children.toLowerCase().trim());
		return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
	};
	render() {
		return (
			<>
				<Select
					mode='multiple'
					maxTagCount={1}
					showSearch
					allowClear
					onClear={() => this.onClearSelect()}
					disabled={this.props.disabled}
					placeholder={"Chọn máy bán nước"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.ma_id_selected}
					onChange={(value: number[]) => this.onChangeMachine(value)}
					filterOption={this.handleFilter}
				>
					{(!!this.props.machineListResult && this.props.machineListResult.length > 0) && this.props.machineListResult.map((item) => (
						<Option key={"key_machine_" + item.ma_id} value={item.ma_id}>{item.ma_display_name}{" - "}{stores.sessionStore.getNameGroupMachines(item.gr_ma_id)}</Option>
					))}
				</Select>
			</>
		)
	}

}

