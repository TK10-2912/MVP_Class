import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { ePaidStatus, eBillMethod } from '@src/lib/enumconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { Button, Col, DatePicker, Input, Row, Select, Space } from "antd";
import moment from 'moment';
import AppComponentBase from "../AppComponentBase";
import SelectEnum from '../SelectEnum';
import * as React from 'react';
import { SearchHistoryTransactionInputRef } from '@src/scenes/StatisticalReport/StatisticalImporting/reports/ThongKeDoanhThuTheoMay/ThongKeDoanhThuTheoMayAdmin';
export class SearchHistoryTransactionInput {
    public payment_type;
    public bi_status;
    public bi_code;
    public start_date;
    public end_date;
    constructor(payment_type, bi_status, bi_code, start_date, end_date) {
        this.payment_type = payment_type;
        this.bi_status = bi_status;
        this.bi_code = bi_code;
        this.start_date = start_date;
        this.end_date = end_date;
    }
}
export interface IProps {
    onSearchStatistic: (input: SearchHistoryTransactionInput) => void;
    getTypeDate?: (type: any) => void;
    defaultStartDate: Date;
    defaultEndDate: Date;
}
const { RangePicker } = DatePicker;

export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}
export default class SearchHistoryTransaction extends AppComponentBase<IProps> implements SearchHistoryTransactionInputRef {
    state = {
        isLoadDone: false,
        groupMachineId: undefined,
        listMachineId: undefined,
        payment_type: undefined,
        bi_status: undefined,
        us_id: undefined,
        selectedOption: "date",
        rangeDatetime: undefined,
        bi_code: undefined,
        start_date: undefined,
        end_date: undefined,

    };
    inputSearch: SearchHistoryTransactionInput = new SearchHistoryTransactionInput(this.state.payment_type, this.state.bi_status, this.state.bi_code, this.state.start_date, this.state.end_date);
    machineListResult: MachineAbstractDto[] = [];
    async componentDidMount() {
        this.setState({ selectedOption: eFormatPicker.date, });
        if (this.props.defaultStartDate || this.props.defaultEndDate) {
            this.inputSearch.start_date = moment(this.props.defaultStartDate).startOf(this.state.selectedOption as any).toDate();
            this.inputSearch.end_date = moment(this.props.defaultEndDate).endOf(this.state.selectedOption as any).toDate();
            await this.setState({ rangeDatetime: [moment(this.props.defaultStartDate), moment(this.props.defaultEndDate)] })
            await this.props.onSearchStatistic(this.inputSearch);
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    handleSubmitSearch = async () => {
        this.setState({ isLoadDone: false });
        this.inputSearch.start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
        this.inputSearch.end_date = !!this.state.rangeDatetime?.[1] ? moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() : undefined;
        this.inputSearch.bi_status = this.state.bi_status!;
        this.inputSearch.bi_code = this.state.bi_code!;
        this.inputSearch.payment_type = this.state.payment_type!;
        const { onSearchStatistic } = this.props;
        if (onSearchStatistic != undefined) {
            onSearchStatistic(this.inputSearch);
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
            bi_status: undefined,
            payment_type: undefined,
            rangeDatetime: undefined,
            bi_code: undefined,
        })
        this.handleSubmitSearch();
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 992;
        return !!isChangeText;
    }

    render() {
        return (
            <div style={{ width: "100%" }}>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 2, 2)}>
                        <strong>Loại</strong>
                        <Select
                            onChange={async (value) => await this.setState({ selectedOption: value })}
                            value={this.state.selectedOption}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value={eFormatPicker.date}>Ngày</Select.Option>
                            <Select.Option value={eFormatPicker.month}>Tháng</Select.Option>
                            <Select.Option value={eFormatPicker.year}>Năm</Select.Option>
                        </Select>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 4, 4)}>
                        <strong>Khoảng thời gian thanh toán</strong>
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
                    <Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 3)}>
                        <strong>Mã đơn hàng</strong>
                        <Input allowClear
                            onChange={async (e) => await this.setState({ bi_code: e.target.value })} placeholder={"Nhập tìm kiếm..."}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.bi_code}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
                        <strong>Trạng thái trả hàng</strong>
                        <SelectEnum
                            placeholder='Trạng thái...'
                            eNum={ePaidStatus}
                            onChangeEnum={async (e) => { await this.setState({ bi_status: e }); await this.handleSubmitSearch() }}
                            enum_value={this.state.bi_status}
                        ></SelectEnum>
                    </Col>

                    <Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 3)}>
                        <strong>Hình thức thanh toán</strong>
                        <SelectEnum
                            placeholder='Hình thức...'
                            eNum={eBillMethod}
                            onChangeEnum={async (e) => { await this.setState({ payment_type: e }); await this.handleSubmitSearch() }}
                            enum_value={this.state.payment_type}
                        ></SelectEnum>
                    </Col>

                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 6)}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{this.shouldChangeText() ? 'Tìm' : 'Tìm kiếm'}</Button>
                            {
                                (this.state.payment_type != undefined || this.state.bi_code || this.state.rangeDatetime !== undefined || this.state.bi_status !== undefined) &&
                                <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                            }
                        </Space>
                    </Col>
                </Row>
            </div>
        )
    }

}

