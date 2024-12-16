import * as React from 'react';
import { Select } from 'antd';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { UserDto } from '@src/services/services_autogen';
import { L } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
const { Option } = Select;

export interface IProps {
	onChangeUser?: (item: number) => void;
	us_id?: number;
	disabled?: boolean;
	onClear?: () => void;
	checkAuthorization?: boolean;
}

export default class SelectUser extends AppComponentBase<IProps> {
	state = {
		isLoading: false,
		us_id: undefined,
	};
	users: UserDto[] = [];
	async componentDidMount() {
		await this.setState({ isLoading: true });
		const { currentLogin } = stores.sessionStore;
		if (this.props.us_id !== undefined) {
			this.setState({ us_id: this.props.us_id });
		}
		this.users = [...currentLogin.users!];
		if (this.props.checkAuthorization == false) {
		} else {
			this.users.unshift(UserDto.fromJS({ id: -1, name: "Không có người sở hữu" }));
		}
		await this.setState({ isLoading: false });
	}
	componentDidUpdate(prevProps) {
		if (prevProps.us_id !== this.props.us_id) {
			this.setState({ us_id: this.props.us_id });
		}
	}
	onChangeUser = async (us_id: number) => {
		this.setState({ us_id: us_id });
		if (!!this.props.onChangeUser) {
			this.props.onChangeUser(us_id);
		}

	}
	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}

	onClearUser() {
		this.setState({ isLoading: true });
		this.props.onClear !== undefined && this.props.onClear();
		this.setState({ isLoading: false });
	}
	handleFilter = (inputValue, option) => {
		const normalizedInput = AppConsts.boDauTiengViet1(inputValue.toLowerCase().trim());
		const normalizedOptionLabel = AppConsts.boDauTiengViet1(option.children.toLowerCase());
		return normalizedOptionLabel.indexOf(normalizedInput) >= 0;
	};
	render() {
		const { currentLogin } = stores.sessionStore;
		return (
			<>
				<Select
					showSearch
					allowClear
					disabled={this.props.disabled}
					onClear={() => this.onClearUser()}
					placeholder={L("Select")}
					loading={this.state.isLoading}
					style={{ width: '100%' }}
					value={this.state.us_id}
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

