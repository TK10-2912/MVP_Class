import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { message, Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ProductAbstractDto, } from '@src/services/services_autogen';
export interface IProps {
	mode?: "multiple" | undefined;
	pr_key?: string[] | undefined;
	onClear?: () => void,
	onChangeProductKey?: (item: string[]) => void;
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
export default class SelectedProductName extends AppComponentBase<IProps>{
	state = {
		isLoading: false,
		pr_key: undefined,
	};
	data: ProductAbstractDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.pr_key !== undefined) {
			await this.setState({ pr_key: this.props.pr_key });
		}
		this.data = stores.sessionStore.getAllProduct();
		await this.setState({ isLoading: false });
	}

	componentDidUpdate(prevProps) {
		if (this.props.pr_key !== prevProps.pr_key) {
			this.setState({ pr_key: this.props.pr_key });
		}
	}
	onChangeDrinkSelected = async (pr_key: string[]) => {
		if (pr_key.length > 21) {
            message.warning('Bạn chỉ có thể chọn tối đa 21 trường.');
            return;
        }
		await this.setState({ pr_key: pr_key });
		if (!!this.props.onChangeProductKey) {
			this.props.onChangeProductKey(pr_key);
		}
	}

	componentWillUnmount() {
		this.setState = (_state, _callback) => {
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
					maxTagCount={1}
					maxTagTextLength={15}
					showSearch
					allowClear
					onClear={() => this.onClearSelect()}
					mode={this.props.mode}
					placeholder={"Chọn sản phẩm"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.pr_key}
					onChange={(value: string[]) => this.onChangeDrinkSelected(value)}
					filterOption={this.handleFilter}
				>
					{this.data.length > 0 && this.data.map((item) => (
						<Option key={"key_drink" + item.pr_name + "_" + item.pr_id} value={item.pr_name!}>{item.pr_name}</Option>
					))}
				</Select>
			</>
		)
	}

}

