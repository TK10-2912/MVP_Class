import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
// import { ProductInRepositoryAbtractDto, RepositoryDto } from '@src/services/services_autogen';
export interface IProps {
	mode?: "multiple" | undefined;
	re_id?: number | undefined;
	onClear?: () => void,
	onChangeRepository?: (item: number | undefined) => void;
}
const { Option } = Select;
export default class SelectedRepository extends AppComponentBase<IProps>{
	state = {
		isLoading: false,
		re_id_selected: undefined,
	};
	// repository: ProductInRepositoryAbtractDto[] = [];
	// async componentDidMount() {
	// 	await this.setState({ isLoading: true });
	// 	if (this.props.re_id != undefined) {
	// 		await this.setState({ re_id_selected: this.props.re_id });
	// 	}
	// 	this.repository = stores.sessionStore.getAllRepository();
	// 	await this.setState({ isLoading: false });
	// }

	componentDidUpdate(prevProps) {
		if (this.props.re_id !== prevProps.re_id) {
			this.setState({ re_id_selected: this.props.re_id });
		}
	}
	onChangeRepositorySelected = async (re_id: number) => {
		await this.setState({ re_id_selected: re_id });
		if (!!this.props.onChangeRepository) {
			this.props.onChangeRepository(re_id);
		}
	}

	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onClearSelect() {
		this.setState({ re_id_selected: undefined });
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
			<>
				<Select
					showSearch
					id='repository'
					allowClear
					onClear={() => this.onClearSelect()}
					mode={this.props.mode}
					placeholder={"Chọn sản phẩm"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.re_id_selected}
					onChange={(value: number) => this.onChangeRepositorySelected(value)}
					filterOption={this.handleFilter}
				>
					{/* {this.repository.length > 0 && this.repository.map((item) => (
						<Option key={"key_repository" + item.re_id + "_" + item.pr_name} value={item.re_id}>{item.pr_name}
						</Option>
					))} */}
				</Select>
			</>
		)
	}

}

