import * as React from 'react';
import { Divider, Modal, Select, } from 'antd';
import { L } from '@src/lib/abpUtility';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { SettingOutlined } from '@ant-design/icons';
import Supplier from '@src/scenes/GeneralManager/Supplier';
import AppConsts from '@src/lib/appconst';
import { SupplierAbstractDto } from '@src/services/services_autogen';
const { Option } = Select;
export interface IProps {
	onChangeSupplier?: (item: number) => void;
	supplierID?: number;
	disable?:boolean; 
}

export default class SelectedSupplier extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		su_id_selected: undefined,
		visibleModalSupplier: false,
	};
	supplier: SupplierAbstractDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		
		if (this.props.supplierID !== undefined) {
			this.setState({ su_id_selected: this.props.supplierID });
		}
		this.getSupplierFromSession();
		await this.setState({ isLoading: false });
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.props.supplierID !== prevProps.supplierID) {
			this.setState({ su_id_selected: this.props.supplierID });
		}
		if (this.state.visibleModalSupplier !== prevState.visibleModalSupplier) {
			await this.getSupplierFromSession();
		}
	}
	getSupplierFromSession =async () => {
		await this.setState({ isLoading: true });
		const { currentLogin } = stores.sessionStore;
		this.supplier = [...currentLogin.suppliers!].filter(item => item.su_is_deleted == false || (item.su_is_deleted == true && item.su_id == this.props.supplierID));
		this.supplier.unshift(SupplierAbstractDto.fromJS({ su_id: -1, su_name: "Không có nhà cung cấp", su_is_deleted: false }));
		await this.setState({ isLoading: false });
	}
	onChangeSupplier = async (su_id: number) => {
		await this.setState({ su_id_selected: su_id });
		if (!!this.props.onChangeSupplier) {
			this.props.onChangeSupplier(su_id);
		}
	}

	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}
	handleFilter = (inputValue, option) => {
		const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
		const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.children.toLowerCase());
		return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
	};
	render() {
		return (
			<>
				<Select style={{ width: "100%" }}
					onSearch={async (e) => {
						await this.setState({ su_search: e });
					}}
					showSearch
					id='supplier'
					disabled={this.props.disable != undefined && this.props.disable}
					onChange={(value: number) => this.onChangeSupplier(value)}
					value={this.state.su_id_selected}
					allowClear={true}
					placeholder={L('Chọn nhà cung cấp' + "...")}
					loading={this.state.isLoading}
					filterOption={this.handleFilter}
					dropdownRender={menu => (<div>
						{menu}
						<Divider style={{ margin: '4px 0' }} />
						<div style={{ padding: '4px 8px', cursor: 'pointer', textAlign: "center" }} onMouseDown={e => e.preventDefault()} onClick={() => this.setState({ visibleModalSupplier: true })} >
							<SettingOutlined title={L('Manager')} /> {L('Manager')}
						</div>
					</div>
					)}>
					{this.supplier.map((item) => (
							<Option key={"key_user_admin_" + item.su_id + "_" + item.su_name} value={item.su_id}>{item.su_is_deleted == true ? "Nhà cung cấp đã bị xóa" : item.su_name}</Option>
						))}
				</Select>
				<Modal
					visible={this.state.visibleModalSupplier}
					title='Quản lý nhà cung cấp'
					onCancel={() => { this.setState({ visibleModalSupplier: false }); stores.sessionStore.getCurrentLoginInformations(); }}
					footer={null}
					width='90vw'
					maskClosable={false}
				>
					<Supplier visibleModalSupplier={this.state.visibleModalSupplier} />
				</Modal>
			</>
		);
	}

}

