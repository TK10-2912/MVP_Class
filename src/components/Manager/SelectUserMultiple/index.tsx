import * as React from 'react';
import { Select } from 'antd';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { UserDto } from '@src/services/services_autogen';
import AppConsts from '@src/lib/appconst';
const { Option } = Select;

export interface IProps {
	onChangeUser?: (item: number[] | undefined) => void;
	us_id_list?: number[];
	disabled?: boolean;
	onClear?: () => void;
}

export default class SelectUserMultiple extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		us_id_list: undefined,
	};
	users: UserDto[] = [];
	async componentDidMount() {
		const { currentLogin } = stores.sessionStore;
		await this.setState({ isLoading: true });
		if (this.props.us_id_list != undefined) {
			this.setState({ us_id_list: [...this.props.us_id_list] });
		}
		this.users = [...currentLogin.users!];
		this.users.unshift(UserDto.fromJS({ id: -1, name: "Không có người sở hữu" }));
		await this.setState({ isLoading: false });
	}
	async componentDidUpdate(prevProps) {
		if (this.props.us_id_list != prevProps.us_id_list) {
			await this.setState({ us_id_list: this.props.us_id_list });
		}
	}
	onChangeUser = async (us_id_list: number[]) => {
		this.setState({ us_id_list: [...us_id_list] });
		if (!!this.props.onChangeUser) {
			this.props.onChangeUser(us_id_list.length != 0 ? us_id_list : undefined);
		}

	}
	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}

	onClearUser() {
		this.setState({ isLoading: true });
		this.props.onClear != undefined && this.props.onClear();
		this.setState({ isLoading: false });
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
					mode='multiple'
					maxTagCount={1}
					showSearch
					allowClear
					disabled={this.props.disabled}
					onClear={() => this.onClearUser()}
					placeholder="Chọn người sở hữu"
					loading={this.state.isLoading}
					style={{ width: "100%" }}
					value={this.state.us_id_list}
					onChange={this.onChangeUser}
					filterOption={this.handleFilter}
				>
					{
						this.users != undefined && this.users.map((item: UserDto) => (
							<Option key={"key_user_admin_" + item.id + "_" + item.name} value={item.id}>{item.name}</Option>
						))

					}
				</Select>
			</>
		);
	}

}

