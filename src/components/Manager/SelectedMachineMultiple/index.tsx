import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Checkbox, Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
export interface IProps {
	listMachineId?: number[];
	disabled?: boolean;
	onClear?: () => void,
	onChangeMachine?: (item: number[] | undefined) => void;
	groupMachineId?: number;
}
const { Option } = Select;
export default class SelectedMachineMultiple extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		ma_id_selected: [] as number[],
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
		if (this.props.listMachineId !== prevProps.listMachineId) {
			this.setState({ ma_id_selected: this.props.listMachineId });
		}
		else if (this.props.groupMachineId !== prevProps.groupMachineId) {
			if (this.props.groupMachineId == undefined) {

				this.machineListResult = await stores.sessionStore.getAllMachines();
			} else {
				this.machineListResult = await stores.sessionStore.getAllMachines().filter(item => item.gr_ma_id == this.props.groupMachineId);
			}
			await this.setState({ ma_id_selected: undefined });
			this.onChangeMachine([]);
		}
	}
	onChangeMachine = async (ma_id_list: number[]) => {
		await this.setState({ ma_id_selected: ma_id_list });
		if (!!this.props.onChangeMachine) {
			this.props.onChangeMachine(ma_id_list?.length! > 0 ? ma_id_list! : undefined);
		};
		await this.setState({ isLoading: !this.state.isLoading });
	}

	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}
	async onClearSelect() {
		await this.setState({ ma_id_selected: undefined });
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
					showSearch
					allowClear
					maxTagCount={1}
					maxTagTextLength={15}
					onClear={() => this.onClearSelect()}
					disabled={this.props.disabled}
					placeholder={"Chọn máy bán nước"}
					style={{ width: '100%' }}
					value={this.state.ma_id_selected}
					onChange={this.onChangeMachine}
					filterOption={this.handleFilter}
				>
					{this.machineListResult.length > 0 && this.machineListResult.map((item) => (
						<Option key={"key_machine_" + item.ma_id} value={item.ma_id}>{` ${item.ma_code} - ${stores.sessionStore.getNameGroupMachines(item.gr_ma_id)}-${stores.sessionStore.getNameMachines(item.ma_id)} `}</Option>
					))}
				</Select>
			</>
		)
	}

}

