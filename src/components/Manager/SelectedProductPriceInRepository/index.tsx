import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Col, Row, Select, Space } from "antd";
import AppConsts from '@src/lib/appconst';
export interface IProps {
	onChangePrice: (price_from?: number | undefined, price_to?: number | undefined) => void;
}

const { Option } = Select;
export default class SelectedProductPriceInRepository extends AppComponentBase<IProps> {
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

	onChangeDrinkSelected = async (pr_price: number | undefined, isPriceFrom: boolean) => {
		if (isPriceFrom) {
			await this.setState({ pr_price_from: pr_price });
			this.dataPriceToSelect = this.dataPriceToSelect.filter(item => item > this.state.pr_price_from!);
		} else
			await this.setState({ pr_price_to: pr_price });
		this.props.onChangePrice(this.state.pr_price_from, this.state.pr_price_to);
	}

	async onClearSelect(isClearPriceFrom: boolean) {
		if (isClearPriceFrom) {
			await this.setState({ pr_price_from: undefined });
		} else
			await this.setState({ pr_price_to: undefined });
		this.props.onChangePrice(this.state.pr_price_from, this.state.pr_price_to);
		this.setState({ isLoading: !this.state.isLoading });
	}
	async onClear() {
		await this.setState({ pr_price_from: undefined });
		await this.setState({ pr_price_to: undefined });
		this.props.onChangePrice(this.state.pr_price_from, this.state.pr_price_to);
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
						value={this.state.pr_price_from}
						onChange={(value: number) => this.onChangeDrinkSelected(value, true)}
						placeholder={"Giá sản phẩm từ"}
					>
						{this.dataPriceFromSelect.map((item) => (
							<Option key={"key_drink_from" + item} value={item}>{AppConsts.formatNumber(item)}đ</Option>
						))
						}
					</Select>
				</Col>
				<Col span={12}>
					<Select
						style={{ width: '100%' }}
						allowClear
						value={this.state.pr_price_to}
						onClear={() => this.onClearSelect(false)}
						onChange={(value: number) => this.onChangeDrinkSelected(value, false)}
						placeholder={"Giá sản phẩm đến"}
					>
						{this.dataPriceToSelect.map((item) => (
							<Option key={"key_drink_to" + item} value={item}>{AppConsts.formatNumber(item)}đ</Option>
						))
						}
					</Select>
				</Col>
			</Row>
		)
	}

}

