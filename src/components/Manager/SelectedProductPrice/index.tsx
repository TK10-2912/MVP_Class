import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Col, Row, Select, Space } from "antd";
import AppConsts from '@src/lib/appconst';
export interface IProps {
	onChangePrice: (price_from?: number, price_to?: number) => void;
}

const { Option } = Select;
export default class SelectedProductPrice extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		pr_price_from: undefined,
		pr_price_to: undefined,
		isClear: false,
	};
	dataPriceFromSelect: number[] = [];
	dataPriceToSelect: number[] = [];
	productPriceList: number[] = [];
	async componentDidMount() {
		const { productListResult } = stores.productStore;
		this.productPriceList = [...new Set(productListResult.map(item => item.pr_price))].sort((a, b) => a - b);
		this.dataPriceFromSelect = this.productPriceList;
		this.dataPriceToSelect = this.productPriceList;
		this.setState({ isLoading: !this.state.isLoading });
	}

	onChangeDrinkSelected = async (pr_price: number, isPriceFrom: boolean) => {
		if (!this.state.isClear) {
			if (isPriceFrom) {
				await this.setState({ pr_price_from: pr_price });
				this.dataPriceToSelect = this.productPriceList.filter(price => price >= pr_price);
			}
			else {
				await this.setState({ pr_price_to: pr_price });
				this.dataPriceFromSelect = this.productPriceList.filter(price => price <= pr_price);
			}
			this.props.onChangePrice(this.state.pr_price_from || this.productPriceList[0], this.state.pr_price_to || this.productPriceList[this.productPriceList.length - 1]);
		}
		await this.setState({ isClear: false });
	}

	async onClearSelect(isClearPriceFrom: boolean) {
		await this.setState({ isClear: true });
		if (isClearPriceFrom) {
			await this.setState({ pr_price_from: undefined });
			this.dataPriceToSelect = this.productPriceList;
			this.dataPriceFromSelect = this.productPriceList.filter(price => price <= (this.state.pr_price_to || this.productPriceList[this.productPriceList.length - 1]));
			this.props.onChangePrice(this.productPriceList[0], this.state.pr_price_to || this.productPriceList[this.productPriceList.length - 1]);
		}
		else {
			await this.setState({ pr_price_to: undefined });
			this.dataPriceFromSelect = this.productPriceList;
			this.dataPriceToSelect = this.productPriceList.filter(price => price >= (this.state.pr_price_from || this.productPriceList[0]));
			this.props.onChangePrice(this.state.pr_price_from || this.productPriceList[0], this.productPriceList[this.productPriceList.length - 1]);
		}
		this.setState({ isLoading: !this.state.isLoading });
	}

	render() {
		return (
			<Row gutter={8}>
				<Col span={12}>
					<Select
						allowClear
						style={{ width: '100%' }}
						onClear={() => this.onClearSelect(true)}
						onChange={(value: number) => this.onChangeDrinkSelected(value, true)}
						placeholder={"Giá sản phẩm từ"}
					>
						{this.dataPriceFromSelect.map((item) => (
							<Option key={"key_drink_from" + item} value={item}>{AppConsts.formatNumber(item)}</Option>
						))
						}
					</Select>
				</Col>
				<Col span={12}>
					<Select
						style={{ width: '100%' }}
						allowClear
						onClear={() => this.onClearSelect(false)}
						onChange={(value: number) => this.onChangeDrinkSelected(value, false)}
						placeholder={"Giá sản phẩm đến"}
					>
						{this.dataPriceToSelect.map((item) => (
							<Option key={"key_drink_to" + item} value={item}>{AppConsts.formatNumber(item)}</Option>
						))
						}
					</Select>
				</Col>
			</Row>
		)
	}

}

