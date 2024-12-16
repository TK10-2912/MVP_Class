import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { LayoutDto, ProductAbstractDto, } from '@src/services/services_autogen';
export interface IProps {
	la_id?: number | undefined;
	onClear?: () => void,
	onChangeLayoutSelected?: (item: number) => void;
}
const { Option } = Select;
export default class SelectedLayout extends AppComponentBase<IProps>{
	state = {
		isLoading: false,
		la_id: undefined,
	};
	data: LayoutDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.la_id !== undefined) {
			await this.setState({ la_id: this.props.la_id });
		}
		this.data = stores.sessionStore.getAllLayout();
		this.data = this.data.filter((item) => item.la_is_deleted == false);
		await this.setState({ isLoading: false });
	}

	componentDidUpdate(prevProps) {
		if (this.props.la_id !== prevProps.la_id) {
			this.setState({ la_id: this.props.la_id });
		}
	}
	onChangeLayoutSelected = async (la_id: number) => {
		await this.setState({ la_id: la_id });
		if (!!this.props.onChangeLayoutSelected) {
			this.props.onChangeLayoutSelected(la_id);
		}
	}

	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onClearSelect() {
		this.setState({ la_id: undefined });
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
					mode={undefined}
					placeholder={"Chọn bố cục"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.la_id}
					onChange={(value: number) => this.onChangeLayoutSelected(value)}
					filterOption={this.handleFilter}
				>
					{this.data.length > 0 && this.data.map((item) => (
						<Option key={"key_layout" + item.la_id + "_" + item.la_name} value={item.la_id!}>{item.la_name}</Option>
					))}
				</Select>
			</>
		)
	}

}

