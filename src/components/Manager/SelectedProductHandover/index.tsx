import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Col, Image, Row, Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ProductAbstractDto, ProductHandoverInput } from '@src/services/services_autogen';
export interface IProps {
	mode?: "multiple" | undefined;
	productId?: number[] | undefined;
	onClear?: () => void,
	onChangeProduct?: (item: number[] | undefined) => void;
	productList: ProductHandoverInput[];
	disable?: boolean;
	isLoadDone: boolean;
}
const { Option } = Select;
export default class SelectedProductHandover extends AppComponentBase<IProps>{
	state = {
		isLoadDone: undefined,
		isLoading: false,
		pr_id_selected: undefined,
	};
	product: ProductHandoverInput[] = [];

	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.productId != undefined) {
			await this.setState({ pr_id_selected: this.props.productId });
		}
		this.product = this.props.productList;
		await this.setState({ isLoading: false });
	}

	componentDidUpdate(prevProps) {
		if (this.props.productId !== prevProps.productId) {
			this.setState({ pr_id_selected: this.props.productId });
		}
		if (this.props.isLoadDone !== prevProps.isLoadDone) {
			this.setState({ isLoading: false });
			this.product = this.props.productList;
			this.setState({ isLoading: true });
		}
	}
	onChangeProductSelected = async (pr_id: number[]) => {
		this.setState({ isLoading: false });
		if (!!this.props.onChangeProduct) {
			this.props.onChangeProduct(pr_id);
		}
		this.setState({ isLoading: true });
	}
	onChangeProduct = async (listMachineId: number[]) => {
		await this.setState({ pr_id_selected: listMachineId });
		if (!!this.props.onChangeProduct) {
			this.props.onChangeProduct(listMachineId!.length > 0 ? listMachineId! : undefined);
		}
		this.setState({ allSelected: listMachineId.length === this.product.length });
	};
	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onClearSelect = async () => {
		await this.setState({ pr_id_selected: undefined });
		if (this.props.onClear != undefined) {
			this.props.onClear();
		}
	}
	handleFilter = (inputValue, option) => {
		const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
		const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.key.toLowerCase());
		return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
	};
	onSelectProduct = (value) => {
		this.setState({ searchValue: '' });
	};
	render() {
		return (
			<>
				<Select
					disabled={this.props.disable}
					showSearch
					id='product'
					allowClear
					onClear={() => this.onClearSelect()}
					mode={'multiple'}
					placeholder={"Chọn sản phẩm"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.pr_id_selected}
					onChange={this.onChangeProduct}
					filterOption={this.handleFilter}
				>
					{this.product.length > 0 &&
						this.product.map((item) => (
							<Option key={'key_machine_' + item.pr_id} value={item.pr_id}>{
								stores.sessionStore.getNameProduct(item.pr_id) + "- Còn lại: " + (item.pr_quantity)
							}
							</Option>
						))}
				</Select>
			</>
		)
	}

}

