import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Col, Image, Row, Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ProductAbstractDto } from '@src/services/services_autogen';
export interface IProps {
	mode?: "multiple" | undefined;
	productId?: number | undefined;
	onClear?: () => void,
	onChangeProduct?: (item: number | undefined) => void;
}
const { Option } = Select;
export default class SelectedProductImportRepository extends AppComponentBase<IProps>{
	state = {
		isLoading: false,
		pr_id_selected: undefined,
	};
	product: ProductAbstractDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.productId != undefined) {
			await this.setState({ pr_id_selected: this.props.productId });
		}
		this.product = stores.sessionStore.getAllProduct();
		await this.setState({ isLoading: false });
	}

	componentDidUpdate(prevProps) {
		if (this.props.productId !== prevProps.productId) {
			this.setState({ pr_id_selected: null });
		}
	}
	onChangeProductSelected = async (pr_id: number) => {
		this.setState({ isLoading: false });
		if (!!this.props.onChangeProduct) {
			this.props.onChangeProduct(pr_id);
		}
		this.setState({ isLoading: true });
	}

	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}
	onClearSelect = async () => {
		await this.setState({ pr_id_selected: undefined });
		if (this.props.onClear != undefined) {
			this.props.onClear();
		}
	}
	handleFilter = (inputValue, option) => {
		const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
		const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.key.toLowerCase());
		return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
	};
	onSelectProduct = (value) => {
		this.setState({ searchValue: '' });
	};
	render() {
		return (
			<>
				<Select
					showSearch
					id='product'
					allowClear
					onClear={() => this.onClearSelect()}
					mode={this.props.mode}
					placeholder={"Chọn sản phẩm"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.pr_id_selected}
					onChange={(value: number) => this.onChangeProductSelected(value)}
					filterOption={this.handleFilter}
				>
					{this.product.length > 0 && this.product.map((item) => (
						<Option key={"product" + item.pr_name} value={item.pr_id}>
							<Row key={"product_row" + item.pr_name}>
								<Col span={10}> <Image preview={false} className='imageDetailProductImport' src={(item.fi_id != undefined && item.fi_id.id != undefined) ? this.getFile(item.fi_id.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"} style={{ height: "20vh", width: "60% !important" }} alt='No image available' />
								</Col>
								<Col span={12}>
									<p>{item.pr_name}</p>
									<p>{item.pr_code}</p>
								</Col>
							</Row>
						</Option>
					))}
				</Select>
			</>
		)
	}

}

