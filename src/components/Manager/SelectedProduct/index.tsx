import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ProductAbstractDto } from '@src/services/services_autogen';
export interface IProps {
	mode?: "multiple" | undefined;
	productId?: number | undefined;
	onClear?: () => void,
	onChangeProduct?: (item: number | undefined) => void;
	selectAllProduct?: boolean;
}
const { Option } = Select;
export default class SelectedProduct extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		pr_id_selected: undefined,
	};
	product: ProductAbstractDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.productId != undefined) {
			await this.setState({ pr_id_selected: this.props.productId });
		}
		this.product = stores.sessionStore.getAllProduct();
		if (!this.props.selectAllProduct) {
			this.product.unshift(ProductAbstractDto.fromJS({ pr_id: -1, pr_name: "Slot không có đồ", }));
		}
		await this.setState({ isLoading: false });
	}

	componentDidUpdate(prevProps) {
		if (this.props.productId !== prevProps.productId) {
			this.setState({ pr_id_selected: this.props.productId });
		}
	}
	onChangeProductSelected = async (dr_id: number) => {
		await this.setState({ pr_id_selected: dr_id });
		if (!!this.props.onChangeProduct) {
			this.props.onChangeProduct(dr_id);
		}
	}

	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onClearSelect() {
		this.setState({ pr_id_selected: undefined });
		if (this.props.onClear != undefined) {
			this.props.onClear();
		}
	}
	handleFilter = (inputValue, option) => {
		const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
		const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.children.toLowerCase());
		return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
	};
	render() {
		return (
			<Select
				showSearch
				id='product'
				maxTagCount={1}
				allowClear
				onClear={() => this.onClearSelect()}
				mode={this.props.mode}
				placeholder={"Chọn sản phẩm"}
				loading={this.state.isLoading}
				style={{ width: '100%' }}
				value={this.state.pr_id_selected}
				onChange={(value: number) => this.onChangeProductSelected(value)}
				filterOption={this.handleFilter}
			>
				{this.product.length > 0 && this.product.map((item) => (
					<Option key={"key_product" + item?.pr_id} value={item?.pr_id}>{`${item?.pr_name} `}
					</Option>
				))}
			</Select>
		)
	}

}

