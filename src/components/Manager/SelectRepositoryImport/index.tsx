import * as React from 'react';
import { Select } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { MEnum, eMoney } from '@src/lib/enumconst';
import { L } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import { RepositoryDto } from '@src/services/services_autogen';
const { Option } = Select;

export interface IProps {
	onChangeEnum: (value: number) => void;
	enum_value?: number;
	repositortListResult: RepositoryDto[];
	onClear?: () => void;
}

export default class SelectRepositoryImport extends AppComponentBase<IProps> {
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
		const { repositortListResult } = this.props;
		return (
			<Select
				style={{ width: "100%" }}
				onChange={this.onChangeEnumSelected}
				value={this.state.enum_value}
				allowClear={true}
				placeholder={L("Chọn")}
				filterOption={this.handleFilter}
			>
				{repositortListResult.map((item) => (
					<Option key={"key_user_admin_" + item.re_id + "_" + item.re_name} value={item.re_id}>{item.re_name}</Option>
				))}
			</Select>
		);
	}

}

