import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Col, Image, Row, Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ListProductHandOver } from '@src/scenes/GeneralManager/Handover/ReceiveMachine/components/HandoverDetail/CreateHandover';
import { isGranted } from '@src/lib/abpUtility';

export interface IProps {
	mode?: "multiple" | undefined;
	productId?: number | undefined;
	onClear?: () => void,
	onChangeProduct?: (item: number | undefined) => void;
	us_id?: number | undefined;
	re_id?: number | undefined;
}
const { Option } = Select;
export default class SelectedProductRepository extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		pr_id_selected: undefined,
		us_id: isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Handover) ? undefined : stores.sessionStore.getUserLogin().id!,
		re_id: undefined,
	};
	product: ListProductHandOver[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		if (this.props.productId != undefined) {
			await this.setState({ pr_id_selected: this.props.productId });
		}
		if (this.props.us_id != undefined) {
			await this.setState({ us_id: this.props.us_id });
		}
		if (this.props.re_id != undefined) {
			await this.setState({ re_id: this.props.re_id });
		}
		this.product = stores.sessionStore.getAllProductInRepository(this.state.us_id, this.state.re_id);
		await this.setState({ isLoading: false });
	}

	async componentDidUpdate(prevProps) {
		if (this.props.productId !== prevProps.productId) {
			this.setState({ pr_id_selected: null });
		}
		if (this.props.us_id !== prevProps.us_id) {
			await this.setState({ us_id: this.props.us_id });
			this.product = stores.sessionStore.getAllProductInRepository(this.state.us_id, this.state.re_id);
			this.setState({ isLoading: !this.state.isLoading });
		}
		if (this.props.re_id !== prevProps.re_id) {
			await this.setState({ re_id: this.props.re_id });
			this.product = stores.sessionStore.getAllProductInRepository(this.state.us_id, this.state.re_id);
			this.setState({ isLoading: !this.state.isLoading });
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
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onClearSelect = async () => {
		await this.setState({ pr_id_selected: null });
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
					placeholder={"Tìm hàng hóa theo tên"}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.pr_id_selected}
					onChange={(value: number) => this.onChangeProductSelected(value)}
					filterOption={this.handleFilter}
				>
					{this.product.length > 0 && this.product.map((item) => (
						<Option key={"product" + item.pr_name} value={item.pr_id}>
							<Row key={"product_row" + item.pr_name}>
								<Col span={10}> <Image preview={false} className='imageDetailProductImport' src={(item.fi_id != undefined && item.fi_id.id != undefined) ? this.getImageProduct(item.fi_id.md5!) : AppConsts.appBaseUrl + "/image/no_image.jpg"} style={{ height: "20vh", width: "60% !important" }} alt='No image available' />
								</Col>
								<Col span={12}>
									<p>Tên SP: &nbsp;{item.pr_name}</p>
									<p>SL:&nbsp;{item.pr_quantity_max}</p>
								</Col>
							</Row>
						</Option>
					))}
				</Select>
			</>
		)
	}

}

