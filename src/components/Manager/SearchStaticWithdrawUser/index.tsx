import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment, { Moment } from 'moment';
import AppComponentBase from "../AppComponentBase";
import SelectUserMultiple from '../SelectUserMultiple';
import SelectedGroupMachine from '../SelectedGroupMachine';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import * as React from 'react';
import { SearchDailySaleMonitoringInputAdmin } from '../SearchDailySaleMonitoringAdmin';
import SelectEnum from '../SelectEnum';
import { eBillMethod, eReconsile } from '@src/lib/enumconst';

export interface IProps {
    onSearchStatistic: (input: SearchWithdrawUser, type: String) => void;
    getTypeDate?: (type: any) => void;
    datePick?: string;
}
const { RangePicker } = DatePicker;
export class SearchWithdrawUser {
    public start_date;
    public end_date;
    public ma_id_list;
    public payment_type;
    public gr_id;
    constructor(start_date, end_date, payment_type, ma_id_list, gr_id) {
        this.start_date = start_date;
        this.end_date = end_date;
        this.payment_type = payment_type;
        this.ma_id_list = ma_id_list;
        this.gr_id = gr_id;
    }

}
export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}

export default class SearchStaticWithdrawUser extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        payment_type: undefined,
        listMachineId: undefined,
        selectedOption: "date",
        rangeDatetime: undefined,
        start_date: undefined,
        end_date: undefined,
        gr_id: undefined,
    };
    inputSearch: SearchWithdrawUser = new SearchWithdrawUser(this.state.start_date, this.state.end_date, this.state.payment_type, this.state.listMachineId, this.state.gr_id);
    machineListResult: MachineAbstractDto[] = [];
    async componentDidMount() {
        await this.setState({ selectedOption: eFormatPicker.date, });
        this.handleSubmitSearch();
    }

    handleSubmitSearch = async () => {
        this.setState({ isLoadDone: false });
        this.inputSearch.start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime?.[0]).startOf(this.state.selectedOption as any).toDate() : undefined;
        this.inputSearch.end_date = !!this.state.rangeDatetime?.[1] ?
            moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() : undefined;
        this.inputSearch.gr_id = this.state.gr_id;
        this.inputSearch.ma_id_list = this.state.listMachineId;
        this.inputSearch.payment_type = this.state.payment_type;
        const { onSearchStatistic } = this.props;
        if (onSearchStatistic != undefined) {
            onSearchStatistic(this.inputSearch, this.state.selectedOption);
        }
        this.getTypeDate();
        this.setState({ isLoadDone: true });
    }

    getTypeDate = () => {
        if (!!this.props.getTypeDate) {
            this.props.getTypeDate(this.state.selectedOption);
        }
    }

    onClearSearch = async () => {
        await this.setState({
            gr_id: undefined,
            listMachineId: undefined,
            rangeDatetime: undefined,
            payment_type: undefined,
        })
        this.handleSubmitSearch();
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 992 || window.innerWidth >= 1200 && window.innerWidth <= 1241;
        return !!isChangeText;
    }

    render() {
        return (
            <div style={{ width: "100%" }}>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
                        <strong>Loại</strong>
                        <Select
                            onChange={async (value) => { await this.setState({ selectedOption: value }); this.handleSubmitSearch() }}
                            value={this.state.selectedOption}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value={eFormatPicker.date}>Ngày</Select.Option>
                            <Select.Option value={eFormatPicker.month}>Tháng</Select.Option>
                            <Select.Option value={eFormatPicker.year}>Năm</Select.Option>
                        </Select>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
                        <strong>Khoảng thời gian rút tiền</strong>
                        <RangePicker
                            style={{ width: "100%" }}
                            placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
                            onChange={async value => { await this.setState({ rangeDatetime: value }); this.handleSubmitSearch() }}
                            picker={this.state.selectedOption as any}
                            format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
                            value={this.state.rangeDatetime as any}
                            allowEmpty={[false, true]}
                            disabledDate={current => current > moment()}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
                        <strong>Phương thức đối soát</strong>
                        <SelectEnum enum_value={this.state.payment_type} onChangeEnum={async (value) => { await this.setState({ payment_type: value }); this.handleSubmitSearch() }} eNum={eReconsile} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine
                            onChangeGroupMachine={(value) => { this.setState({ gr_id: value }); this.handleSubmitSearch() }} groupmachineId={this.state.gr_id} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple
                            onChangeMachine={(value) => { this.setState({ listMachineId: value }); this.handleSubmitSearch() }} listMachineId={this.state.listMachineId} groupMachineId={this.state.gr_id} />
                    </Col>
                    <Col  {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }}>
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{(window.innerWidth >= 576 && window.innerWidth <= 992) ? 'Tìm' : 'Tìm kiếm'}</Button>
                        </Col>
                        {
                            (!!this.state.rangeDatetime || !!this.state.listMachineId || !!this.state.payment_type || !!this.state.gr_id) &&
                            <Col>
                                <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                            </Col>
                        }
                    </Col>

                </Row>
            </div>
        )
    }

}

