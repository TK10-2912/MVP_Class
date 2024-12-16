import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
export interface IProps {
	machineId?: number;
	disabled?: boolean;
	onClear?: () => void,
	gr_id?: number,
	onChangeMachine?: (item: number) => void;
}
const { Option } = Select;
export default class SelectedMachine extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		ma_id_selected: undefined,
		gr_id: undefined,
	};
	// async getAll() {
	// 	this.setState({ isLoading: false })
	// 	await stores.machineStore.getAllByAdmin(undefined, undefined, this.props.groupMachineId, undefined, undefined);
	// 	this.setState({ isLoading: true })
	// }
	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.machineId !== undefined) {
			this.setState({ ma_id_selected: this.props.machineId });
		}
		await this.setState({ isLoading: false });
	}

	async componentDidUpdate(prevProps) {
		if (this.props.machineId !== prevProps.machineId || this.props.gr_id !== prevProps.gr_id) {
			this.setState({ ma_id_selected: this.props.machineId, gr_id: this.props.gr_id });
		}
	}
	onChangeMachine = async (ma_id: number) => {
		await this.setState({ ma_id_selected: ma_id });
		if (!!this.props.onChangeMachine) {
			this.props.onChangeMachine(ma_id);
		}
	}

	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onClearSelect() {
		this.setState({ ma_id_selected: undefined });
		if (this.props.onClear !== undefined) {
			this.props.onClear();
		}
	}
	handleFilter = (inputValue, option) => {
		const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim);
		const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.children.toLowerCase().trim());
		return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
	};
	render() {

		const machineListResult = stores.sessionStore.getAllMachines();

		return (
			<>
				<Select
					showSearch
					allowClear
					onClear={() => this.onClearSelect()}
					disabled={this.props.disabled}
					placeholder={"Chọn máy bán nước"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.ma_id_selected}
					onChange={async (value: number) => await this.onChangeMachine(value)}
					filterOption={this.handleFilter}
				>
					{machineListResult.length > 0 && machineListResult.map((item) => (
						<Option key={"key_machine_" + item.ma_id} value={item.ma_id}>{stores.sessionStore.getCodeMachines(item.ma_id) + "-" + item.ma_display_name}</Option>
					))}
				</Select>
			</>
		)
	}

}

