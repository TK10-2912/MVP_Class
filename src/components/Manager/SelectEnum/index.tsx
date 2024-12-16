import * as React from 'react';
import { Select } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { MEnum, eMoney } from '@src/lib/enumconst';
import { L } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
const { Option } = Select;

export interface IProps {
	onChangeEnum: (value: number) => void;
	enum_value?: number;
	eNum: { [key: string]: MEnum };
	disable?: boolean;
	placeholder?: string;
	disableLowPrice?: number;
	disableHighPrice?: number;
	onClear?: () => void;
	width?:string;
}

export default class SelectEnum extends AppComponentBase<IProps> {
	state = {
		enum_value: undefined,
	};

	async componentDidMount() {
		if (this.props.enum_value !== undefined) {
			this.setState({ enum_value: this.props.enum_value })
		}
	}
	componentDidUpdate(prevProps) {
		if (this.props.enum_value !== prevProps.enum_value) {
			this.setState({ enum_value: this.props.enum_value });
		}
	}

	onChangeEnumSelected = (value: number) => {
		this.setState({ enum_value: value });
		if (this.props.onChangeEnum !== undefined) {
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
				disabled={this.props.disable}
				style={{ width: this.props.width!= undefined ?this.props.width:"100%" }}
				onChange={this.onChangeEnumSelected}
				value={this.state.enum_value}
				allowClear={true}
				placeholder={placeholder ? placeholder : L("Chọn")}
				filterOption={this.handleFilter}
			>
				{(eNum === eMoney && this.props.disableLowPrice !== undefined) ?
					Object.values(eMoney).filter(item => item.num > this.props.disableLowPrice!).map((item, index: number) =>
						<Option key={"Key_enum_" + index} value={item.num}>{item.name}</Option>
					) : (this.props.disableHighPrice !== undefined) ?
						Object.values(eMoney).filter(item => item.num < this.props.disableHighPrice!).map((item, index: number) =>
							<Option key={"Key_enum_" + index} value={item.num}>{item.name}</Option>
						) : Object.values(eNum).map((item, index: number) =>
							<Option key={"Key_enum_" + index} value={item.num}>{item.name}</Option>
						)
				}

			</Select>
		);
	}

}

