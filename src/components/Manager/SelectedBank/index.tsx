import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ProductAbstractDto } from '@src/services/services_autogen';
export interface IProps {
	mode?: "multiple" | undefined;
	bankSelected?: string | undefined;
	onClear?: () => void,
	onChangeBank?: (item: string) => void;
}
const { Option } = Select;
export default class SelectedBank extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		bank_selected: undefined,
	};
	banksInVietnam = [
		// Ngân hàng thương mại Nhà nước
		{ "abbreviation": "Agribank", "fullName": "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam" },
		{ "abbreviation": "GPBank", "fullName": "Ngân hàng TNHH MTV Dầu khí toàn cầu" },
		{ "abbreviation": "OceanBank", "fullName": "Ngân hàng TNHH MTV Đại Dương" },
		{ "abbreviation": "CBBank", "fullName": "Ngân hàng TNHH MTV Xây dựng" },

		// 31 Ngân hàng Thương mại Cổ phần
		{ "abbreviation": "VietinBank", "fullName": "Ngân hàng TMCP Công thương Việt Nam" },
		{ "abbreviation": "BIDV", "fullName": "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" },
		{ "abbreviation": "Vietcombank", "fullName": "Ngân hàng TMCP Ngoại Thương Việt Nam" },
		{ "abbreviation": "ACB", "fullName": "Ngân hàng TMCP Á Châu" },
		{ "abbreviation": "ABBank", "fullName": "Ngân hàng TMCP An Bình" },
		{ "abbreviation": "Viet Capital Bank", "fullName": "Ngân hàng TMCP Bản Việt" },
		{ "abbreviation": "BaoViet Bank", "fullName": "Ngân hàng TMCP Bảo Việt" },
		{ "abbreviation": "Bac A Bank", "fullName": "Ngân hàng TMCP Bắc Á" },
		{ "abbreviation": "LienVietPostBank", "fullName": "Ngân hàng TMCP Bưu điện Liên Việt" },
		{ "abbreviation": "PVcomBank", "fullName": "Ngân hàng TMCP Đại Chúng Việt Nam" },
		{ "abbreviation": "DongA Bank", "fullName": "Ngân hàng TMCP Đông Á" },
		{ "abbreviation": "SeABank", "fullName": "Ngân hàng TMCP Đông Nam Á" },
		{ "abbreviation": "MSB", "fullName": "Ngân hàng TMCP Hàng Hải" },
		{ "abbreviation": "Kienlongbank", "fullName": "Ngân hàng TMCP Kiên Long" },
		{ "abbreviation": "Techcombank", "fullName": "Ngân hàng TMCP Kỹ Thương" },
		{ "abbreviation": "Nam A Bank", "fullName": "Ngân hàng TMCP Nam Á" },
		{ "abbreviation": "OCB", "fullName": "Ngân hàng TMCP Phương Đông" },
		{ "abbreviation": "MB Bank", "fullName": "Ngân hàng TMCP Quân Đội" },
		{ "abbreviation": "VIB", "fullName": "Ngân hàng TMCP Quốc Tế" },
		{ "abbreviation": "NCB", "fullName": "Ngân hàng TMCP Quốc dân" },
		{ "abbreviation": "SCB", "fullName": "Ngân hàng TMCP Sài Gòn" },
		{ "abbreviation": "SaiGonBank", "fullName": "Ngân hàng TMCP Sài Gòn Công Thương" },
		{ "abbreviation": "SHB", "fullName": "Ngân hàng TMCP Sài Gòn – Hà Nội" },
		{ "abbreviation": "SacomBank", "fullName": "Ngân hàng TMCP Sài Gòn Thương Tín" },
		{ "abbreviation": "TPBank", "fullName": "Ngân hàng TMCP Tiên Phong" },
		{ "abbreviation": "VietABank", "fullName": "Ngân hàng TMCP Việt Á" },
		{ "abbreviation": "VPBank", "fullName": "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
		{ "abbreviation": "Vietbank", "fullName": "Ngân hàng TMCP Việt Nam Thương Tín" },
		{ "abbreviation": "PG Bank", "fullName": "Ngân hàng TMCP Xăng dầu Petrolimex" },
		{ "abbreviation": "Eximbank", "fullName": "Ngân hàng TMCP Xuất Nhập Khẩu" },
		{ "abbreviation": "HDBank", "fullName": "Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh" },

		// 2 Ngân hàng Liên doanh
		{ "abbreviation": "IVB", "fullName": "Ngân hàng TNHH Indovina" },
		{ "abbreviation": "VRB", "fullName": "Ngân hàng Liên doanh Việt Nga" },

		// 9 Ngân hàng 100% Vốn Nước ngoài
		{ "abbreviation": "ANZVL", "fullName": "Ngân hàng TNHH MTV ANZ Việt Nam" },
		{ "abbreviation": "HLBVN", "fullName": "Ngân hàng TNHH MTV Hong Leong Việt Nam" },
		{ "abbreviation": "HSBC", "fullName": "Ngân hàng TNHH MTV HSBC Việt Nam" },
		{ "abbreviation": "SHBVN", "fullName": "Ngân hàng TNHH MTV Shinhan Việt Nam" },
		{ "abbreviation": "SCBVL", "fullName": "Ngân hàng TNHH MTV Standard Chartered Việt Nam" },
		{ "abbreviation": "PBVN", "fullName": "Ngân hàng TNHH MTV Public Bank Việt Nam" },
		{ "abbreviation": "CIMB", "fullName": "Ngân hàng TNHH MTV CIMB Việt Nam" },
		{ "abbreviation": "Woori", "fullName": "Ngân hàng TNHH MTV Woori Việt Nam" },
		{ "abbreviation": "UOB", "fullName": "Ngân hàng TNHH MTV UOB Việt Nam" },

		// 2 Ngân hàng Chính sách
		{ "abbreviation": "VBSP", "fullName": "Ngân hàng Chính sách xã hội Việt Nam" },
		{ "abbreviation": "VDB", "fullName": "Ngân hàng Phát triển Việt Nam" },

		// 1 Ngân hàng Hợp tác xã
		{ "abbreviation": "Co-opBank", "fullName": "Ngân hàng Hợp tác xã Việt Nam" }
	];


	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.bankSelected != undefined) {
			await this.setState({ bank_selected: this.props.bankSelected });
		}
		await this.setState({ isLoading: false });
	}

	componentDidUpdate(prevProps) {
		if (this.props.bankSelected !== prevProps.bankSelected) {
			this.setState({ bank_selected: this.props.bankSelected });
		}
	}
	onChangeBankSelected = async (bankName: string) => {
		await this.setState({ bank_selected: bankName });
		if (!!this.props.onChangeBank) {
			this.props.onChangeBank(bankName);
		}
	}

	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}
	onClearSelect() {
		this.setState({ bank_selected: undefined });
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
					id='bank'
					allowClear
					onClear={() => this.onClearSelect()}
					mode={this.props.mode}
					placeholder={"Chọn ngân hàng"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.bank_selected}
					onChange={(value: string) => this.onChangeBankSelected(value)}
					filterOption={this.handleFilter}
				>
					{this.banksInVietnam.length > 0 && this.banksInVietnam.map((item) => (
						<Option key={"key_banksInVietnam" + "_" + item.fullName} value={item.abbreviation + "-" + item.fullName}>{`${item.abbreviation + "-" + item.fullName} `}
						</Option>
					))}
				</Select>
			</>
		)
	}

}

