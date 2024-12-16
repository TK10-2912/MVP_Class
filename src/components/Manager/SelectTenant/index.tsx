import * as React from 'react';
import { Select } from "antd";
import { stores } from '@src/stores/storeInitializer';
export interface IProps {
    onChange?: (item: number) => void;
}
const { Option } = Select;
export default class SelectTenant extends React.Component<IProps> {

    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }

    render() {
        const { tenants } = stores.sessionStore.currentLogin;
        return (
            <Select
                style={{ width: '100%' }}
                showSearch
                allowClear
                onChange={(value: number) => this.props.onChange!(value)}
                placeholder={"Chọn Tenant"}
            >
                {tenants!.length > 0 && tenants!.map((item) => (
                    <Option key={"key_tenant" + item.tenantId} value={item.tenantId!}>{item.tenantName}</Option>
                ))}
            </Select>
        )
    }

}

