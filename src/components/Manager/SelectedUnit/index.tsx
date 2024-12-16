import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ProductAbstractDto } from '@src/services/services_autogen';
export interface IProps {
	mode?: "multiple" | undefined;
	unitSelected?: string | undefined;
	onClear?: () => void,
	onChangeUnit?: (item: string) => void;
	disable?: boolean;
	import?: boolean;
}
const { Option } = Select;
export default class SelectedUnit extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		unit_selected: undefined,
	};
	unitsOfProductInVietnamese = [
		// "Gói",
		// "Hộp",
		// "Chai",
		// "Chiếc",
		// "Lon",
		// "Cái",
		// "Đôi",
		// "Tá",
		// "Túi",
		// "Cuộn",
		// "Bó",
		// "Bộ"
		"Cái",
		"Cặp",
		"Bộ",
		"Gói",
		"Thùng",
		"Lốc",
		"Cuộn",
		"Lon",
		"Chai",
		"Hộp",
		"Túi",
	];

	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.unitSelected != undefined) {
			await this.setState({ unit_selected: this.props.unitSelected });

		}
		await this.setState({ isLoading: false });
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.unitSelected !== prevProps.unitSelected) {
			this.setState({ unit_selected: this.props.unitSelected });
		}
	}
	onChangeUnitSelected = async (unitName: string) => {
		await this.setState({ unit_selected: unitName });
		if (!!this.props.onChangeUnit) {
			this.props.onChangeUnit(unitName);
		}
	}

	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onClearSelect() {
		this.setState({ unit_selected: undefined });
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
					showSearch={this.props.import == true ? false : true}
					id='unit'
					allowClear={this.props.import == true ? false : true}
					disabled={this.props.disable != undefined && this.props.disable}
					onClear={() => this.onClearSelect()}
					mode={this.props.mode}
					placeholder={"Chọn đơn vị"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.unit_selected}
					onChange={(value: string) => this.onChangeUnitSelected(value)}
					filterOption={this.handleFilter}
					// defaultValue='Cái'
				>
					{this.unitsOfProductInVietnamese.length > 0 && this.unitsOfProductInVietnamese.map((item) => (
						<Option key={"key_unitsOfProductInVietnamese_" + item} value={item}>{`${item} `}
						</Option>
					))}
				</Select>
			</>
		)
	}

}

