import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { SupplierAbstractDto } from '@src/services/services_autogen';
export interface IProps {
	listSupplierId?: number[];
	disabled?: boolean;
	onClear?: () => void,
	onChangeSupplier?: (item: number[] | undefined) => void;
	SupplierId?: number;
}
const { Option } = Select;
export default class SelectedSupplierMultiple extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		su_id_selected: undefined,
		allSelected: false,
	};
	SupplierListResult: SupplierAbstractDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		const { currentLogin } = stores.sessionStore;
		this.SupplierListResult = [...currentLogin.suppliers!];
		this.SupplierListResult.unshift(SupplierAbstractDto.fromJS({ su_id: -1, name: "Không có nhà cung cấp", su_is_deleted: false }));
		if (this.props.listSupplierId != undefined) {
			await this.setState({ su_id_selected: this.props.listSupplierId });
		}
		await this.setState({ isLoading: false });
	}

	async componentDidUpdate(prevProps) {
		if (this.props.listSupplierId != prevProps.listSupplierId) {
			await this.setState({ su_id_selected: this.props.listSupplierId });
		}
	}

	onChangeSupplier = async (listSupplierId: number[]) => {
		await this.setState({ su_id_selected: [...listSupplierId] });
		if (!!this.props.onChangeSupplier) {
			this.props.onChangeSupplier(listSupplierId!.length > 0 ? listSupplierId! : undefined);
		};
		this.setState({ allSelected: listSupplierId.length === this.SupplierListResult.length })

	}
	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onClearSelect() {
		this.setState({ su_id_selected: undefined });
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
					placeholder={"Chọn nhà cung cấp"}
					style={{ width: '100%' }}
					value={this.state.su_id_selected}
					onChange={this.onChangeSupplier}
					filterOption={this.handleFilter}
				>
					{this.SupplierListResult.length > 0 && this.SupplierListResult.map((item) => (
						stores.sessionStore.getNameSupplier(item.su_id) === "Nhà cung cấp này đã bị xóa" ||
						<Option key={"key_Supplier_" + item.su_id} value={item.su_id}>{`${stores.sessionStore.getNameSupplier(item.su_id)} `}</Option>
					))}
				</Select>
			</>
		)
	}

}

