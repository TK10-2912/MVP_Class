import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Select } from "antd";
import AppConsts from '@src/lib/appconst';
import { ProductAbstractDto } from '@src/services/services_autogen';
export interface IProps {
    mode?: "multiple" | undefined;
    kindOfDaySelected?: number | undefined;
    onClear?: () => void,
    onChangekindOfDay?: (item: number) => void;
}
const { Option } = Select;
export default class SelectedKindOfDay extends AppComponentBase<IProps> {
    state = {
        isLoading: false,
        kindOfDay_selected: undefined,
    };
    kindOfDay = [
        { "abbreviation": 1, "fullName": "Hôm nay" },
        { "abbreviation": 2, "fullName": "Hôm qua" },
        { "abbreviation": 3, "fullName": "Tuần này" },
        { "abbreviation": 4, "fullName": "Tháng này" },
        { "abbreviation": 5, "fullName": "Tháng trước" },

    ];


    async componentDidMount() {
        await this.setState({ isLoading: true });
        if (this.props.kindOfDaySelected != undefined) {
            await this.setState({ kindOfDay_selected: this.props.kindOfDaySelected });
        }
        await this.setState({ isLoading: false });
    }

    componentDidUpdate(prevProps) {
        if (this.props.kindOfDaySelected !== prevProps.kindOfDaySelected) {
            this.setState({ kindOfDay_selected: this.props.kindOfDaySelected });
        }
    }
    onChangeBankSelected = async (kindOfDay: number) => {
        await this.setState({ kindOfDay_selected: kindOfDay });
        if (!!this.props.onChangekindOfDay) {
            this.props.onChangekindOfDay(kindOfDay);
        }
    }

    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }
    onClearSelect() {
        this.setState({ kindOfDay_selected: undefined });
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
                    placeholder={"Chọn kiểu"}
                    loading={this.state.isLoading}
                    style={{ width: '100%' }}
                    value={this.state.kindOfDay_selected}
                    onChange={(value: number) => this.onChangeBankSelected(value)}
                    filterOption={this.handleFilter}
                >
                    {this.kindOfDay.length > 0 && this.kindOfDay.map((item) => (
                        <Option key={"key_banksInVietnam" + "_" + item.fullName} value={item.abbreviation + ":" + item.fullName}>{`${item.abbreviation + ": " + item.fullName} `}
                        </Option>
                    ))}
                </Select>
            </>
        )
    }

}

