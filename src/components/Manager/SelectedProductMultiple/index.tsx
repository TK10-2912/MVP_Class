import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ProductAbstractDto, SupplierAbstractDto } from '@src/services/services_autogen';
export interface IProps {
	productList?: number[];
	disabled?: boolean;
	onClear?: () => void,
	onChangeProduct?: (item: number[] | undefined) => void;
}
const { Option } = Select;
export default class SelectedProductMultiple extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		pr_id_selected: undefined,
		allSelected: false,
	};
	productListResult: ProductAbstractDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		const { currentLogin } = stores.sessionStore;
		this.productListResult = [...currentLogin.products!];
		this.productListResult.unshift(ProductAbstractDto.fromJS({ su_id: -1, name: "Không có nhà cung cấp", su_is_deleted: false }));
		if (this.props.productList != undefined) {
			await this.setState({ pr_id_selected: this.props.productList });
		}
		await this.setState({ isLoading: false });
	}

	async componentDidUpdate(prevProps) {
		if (this.props.productList != prevProps.productList) {
			await this.setState({ pr_id_selected: this.props.productList });
		}
	}

	onChangeProduct = async (productList: number[]) => {
		await this.setState({ pr_id_selected: [...productList] });
		if (!!this.props.onChangeProduct) {
			this.props.onChangeProduct(productList!.length > 0 ? productList! : undefined);
		};
		this.setState({ allSelected: productList.length === this.productListResult.length })

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
					placeholder={"Chọn sản phẩm"}
					style={{ width: '100%' }}
					value={this.state.pr_id_selected}
					onChange={this.onChangeProduct}
					filterOption={this.handleFilter}
				>
					{this.productListResult.length > 0 && this.productListResult.map((item) => (
						stores.sessionStore.getNameProduct(item.pr_id) === "Sản phẩm không còn sử dụng trong máy" ||
						<Option key={"key_Supplier_" + item.pr_id} value={item.pr_id}>{`${stores.sessionStore.getNameProduct(item.pr_id)} `}</Option>
					))}
				</Select>
			</>
		)
	}

}

