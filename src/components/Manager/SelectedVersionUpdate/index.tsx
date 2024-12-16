import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Divider, Modal, Select } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import GroupMachine from '@src/scenes/GeneralManager/GroupMachine';
import AppConsts from '@src/lib/appconst';
import { GroupMachineAbstractDto } from '@src/services/services_autogen';
import MachineSoft from '@src/scenes/GeneralManager/Machine/MachineSoft';
export interface IProps {
	groupmachineId?: number;
	disabled?: boolean;
	onClear?: () => void,
	onChangeGroupMachine?: (item: number) => void;
	onClearSearch?: boolean;
}
const { Option } = Select;
export default class SelectedVersionUpdate extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		gr_ma_id_selected: undefined,
		visibleModalSupplier: false,
	};
	groupMachine: GroupMachineAbstractDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.groupmachineId != undefined) {
			this.setState({ gr_ma_id_selected: this.props.groupmachineId });
		}
		this.groupMachine = stores.sessionStore.getAllGroupMachines();
		this.groupMachine = this.groupMachine.filter(item => item.gr_ma_is_deleted == false);
		// if (this.groupMachine && this.groupMachine[0].gr_ma_id != -1) {
		this.groupMachine.unshift(GroupMachineAbstractDto.fromJS({ gr_ma_id: -1, gr_ma_area: "Chưa có nhóm máy" }));
		// }
		await this.setState({ isLoading: false });
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
	}

	componentWillUnmount() {
		this.setState = (state, callback) => {
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

		return (
			<>
				<Select
					showSearch
					allowClear
					onClear={() => this.onClearSelect()}
					disabled={this.props.disabled}
					placeholder={"Chọn phiên bản cập nhật"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.gr_ma_id_selected}
					onChange={async (value: number) => await this.onChangeGroupMachine(value)}
					filterOption={this.handleFilter}
					dropdownRender={menu => (<div>
						{menu}
						<Divider style={{ margin: '4px 0' }} />
						<div style={{ padding: '4px 8px', cursor: 'pointer', textAlign: "center" }} onMouseDown={e => e.preventDefault()} onClick={() => this.setState({ visibleModalSupplier: true })} >
							<SettingOutlined title={'Quản lý phiên bản cập nhật'} />{" Quản lý phiên bản cập nhật"}
						</div>
					</div>
					)}>

					{this.groupMachine != undefined && this.groupMachine!.length > 0 && this.groupMachine!.map((item) => (
						<Option key={"key_machine_" + item.gr_ma_id} value={item.gr_ma_id}>{item.gr_ma_area}</Option>
					))}

				</Select>
				<Modal
					visible={this.state.visibleModalSupplier}
					title={'Quản lý phiên bản cập nhật'}
					onCancel={() => { this.setState({ visibleModalSupplier: false }) }}
					footer={null}
					width='80vw'
					maskClosable={false}
				>
					<MachineSoft />
				</Modal>
			</>
		)
	}

}

