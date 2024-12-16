import * as React from 'react';
import { Select } from 'antd';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { MEnum, eMoney } from '@src/lib/enumconst';
import { L } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
const { Option } = Select;

export interface IProps {
	onChangeEnum: (value: number[]) => void;
	enum_value?: number[];
	eNum: { [key: string]: MEnum };
	disable?: boolean;
	placeholder?: string;
	disabledMoney?: number;
}

export default class SelectEnumMulti extends AppComponentBase<IProps> {
	state = {
		enum_value: undefined,
	};

	async componentDidMount() {
		if (this.props.enum_value != undefined) {
			this.setState({ enum_value: this.props.enum_value })
		}
	}
	componentDidUpdate(prevProps) {
		if (this.props.enum_value !== prevProps.enum_value) {
			this.setState({ enum_value: this.props.enum_value });
		}
	}

	onChangeEnumSelected = (value: number[]) => {
		this.setState({ enum_value: value });
		if (this.props.onChangeEnum != undefined) {
			this.props.onChangeEnum(value);
		}
	}
	handleFilter = (inputValue, option) => {
		const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
		const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.children.toLowerCase());
		return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
	};
	render() {
		const { eNum, placeholder } = this.props;
		return (
			<Select
				mode='multiple'
				maxTagCount={1}
				showSearch
				allowClear
				disabled={this.props.disable}
				style={{ width: "100%" }}
				onChange={this.onChangeEnumSelected}
				value={this.state.enum_value}
				placeholder={placeholder ? placeholder : L("Select") + "..."}
				filterOption={this.handleFilter}
			>
				{(eNum == eMoney && this.props.disabledMoney != undefined) ?
					Object.values(eMoney).filter(item => item.num > this.props.disabledMoney!).map((item, index: number) =>
						<Option key={"Key_enum_" + index} value={item.num}>{item.name}</Option>
					) :
					Object.values(eNum).map((item, index: number) =>
						<Option key={"Key_enum_" + index} value={item.num}>{item.name}</Option>
					)
				}
			</Select>
		);
	}

}
