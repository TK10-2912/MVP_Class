import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
export interface IProps {
	mode?: "multiple" | undefined;
	pr_key?: string | undefined;
	onClear?: () => void,
	onChangeProductKey?: (item: string) => void;
}
export class ProductKey {
	public pr_key = '';
	public name = '';
	constructor(pr_key, name) {
		this.pr_key = pr_key;
		this.name = name;
	}
}
const { Option } = Select;
export default class SelectedProductKey extends AppComponentBase<IProps>{
	state = {
		isLoading: false,
		pr_key: undefined,
	};
	data: ProductKey[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.pr_key !== undefined) {
			await this.setState({ pr_key: this.props.pr_key });
		}
		// const drinkListResult = stores.sessionStore.getAllDrinks();
		// const freshDrinkListResult = stores.sessionStore.getAllFreshDrinks();
		// drinkListResult.map(item => {
		// 	this.data.push(new ProductKey("Do_dong_chai___" + item.dr_id, item.dr_name));
		// });
		// freshDrinkListResult.map(item => {
		// 	this.data.push(new ProductKey("Do_tuoi___" + item.fr_dr_id, item.fr_dr_name));
		// });
		await this.setState({ isLoading: false });
	}

	componentDidUpdate(prevProps) {
		if (this.props.pr_key !== prevProps.pr_key) {
			this.setState({ pr_key: this.props.pr_key });
		}
	}
	onChangeDrinkSelected = async (pr_key: string) => {
		await this.setState({ pr_key: pr_key });
		if (!!this.props.onChangeProductKey) {
			this.props.onChangeProductKey(pr_key);
		}
	}

	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}
	onClearSelect() {
		this.setState({ pr_key: undefined });
		if (this.props.onClear !== undefined) {
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
			<>
				<Select
					showSearch
					allowClear
					onClear={() => this.onClearSelect()}
					mode={this.props.mode}
					placeholder={"Chọn sản phẩm"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.pr_key}
					onChange={(value: string) => this.onChangeDrinkSelected(value)}
					filterOption={this.handleFilter}
				>
					{this.data.length > 0 && this.data.map((item) => (
						<Option key={"key_drink" + item.name + "_" + item.pr_key} value={item.pr_key}>{item.name}</Option>
					))}
				</Select>
			</>
		)
	}

}

