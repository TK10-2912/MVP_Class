import * as React from 'react';
import AppComponentBase from "../AppComponentBase";
import { Button, Col, DatePicker, Input, Row, Select, Space } from "antd";
import moment from 'moment';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectedGroupMachine from '../SelectedGroupMachine';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import SelectEnum from '../SelectEnum';
import { eBillStatus, ePaidStatus, eBillMethod } from '@src/lib/enumconst';
export class SearchHistoryTransactionInput {
    public payment_type;
    public bi_status;
    public bi_code;
    public start_date;
    public end_date;
    public gr_ma_id;
    public ma_id_list;
    public fieldSort;
    public sort;

    constructor(payment_type, bi_status, bi_code, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort) {
        this.payment_type = payment_type;
        this.bi_status = bi_status;
        this.bi_code = bi_code;
        this.start_date = start_date;
        this.end_date = end_date;
        this.gr_ma_id = gr_ma_id;
        this.ma_id_list = ma_id_list;
        this.fieldSort = fieldSort;
        this.sort = sort;
    }
}
export interface IProps {
    onSearchStatistic: (input: SearchHistoryTransactionInput) => void;
    getTypeDate?: (type: any) => void;
    datePick?: string;
    cash_payment?: boolean;
    ma_id?: number;
}
export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}
const { RangePicker } = DatePicker;

export default class SearchHistoryTransactionInputUser extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        groupMachineId: undefined,
        listMachineId: undefined,
        payment_type: undefined,
        bi_status: undefined,
        selectedOption: "date",
        rangeDatetime: undefined,
        bi_code: undefined,
    };
    inputSearch: SearchHistoryTransactionInput = new SearchHistoryTransactionInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    machineListResult: MachineAbstractDto[] = [];
    async componentDidMount() {
        await this.setState({ selectedOption: eFormatPicker.date, });
        const urlParams = new URLSearchParams(window.location.search);
        let ma_list_id = urlParams.get('ma_list_id') == null || urlParams.get('ma_list_id') == "undefined" ? undefined : [Number(urlParams.get('ma_list_id'))];
        let gr_id = urlParams.get('gr_id') == null || urlParams.get('gr_id') == undefined ? [] : isNaN(Number(urlParams.get('gr_id'))) ? undefined : Number(urlParams.get('gr_id'));
        let paymentType = urlParams.get('paymentType') == null || urlParams.get('paymentType') == "paymentType" ? undefined : [Number(urlParams.get('paymentType'))];
        let isDate = urlParams.get('date') == null || urlParams.get('date') == "undefined" ? undefined : urlParams.get('date');
        let bi_code = urlParams.get("bi_code") || undefined;
        this.setState({ bi_code: bi_code });
        
        if (ma_list_id != undefined || paymentType != undefined) {
            if (!!isDate) {
                const start_date = moment();
                const end_date = moment();
                this.setState({ rangeDatetime: [start_date, end_date] })
            }
            let paymentType = urlParams.get('paymentType') == null || urlParams.get('paymentType') == "paymentType" ? [] : [Number(urlParams.get('paymentType'))];
            this.setState({ listMachineId: ma_list_id?.length! > 0 ? ma_list_id : undefined, groupMachineId: gr_id ?? undefined, payment_type: paymentType })
            await this.handleSubmitSearch();
        }
        await this.handleSubmitSearch();
    }

    handleSubmitSearch = async () => {
        this.setState({ isLoadDone: false });
        this.inputSearch.start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
        this.inputSearch.end_date = !!this.state.rangeDatetime?.[1] ? moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() : undefined;
        this.inputSearch.ma_id_list = this.state.listMachineId;
        this.inputSearch.gr_ma_id = this.state.groupMachineId;
        this.inputSearch.bi_status = this.state.bi_status!;
        this.inputSearch.bi_code = this.state.bi_code!;
        if (this.props.cash_payment) {
            this.inputSearch.payment_type = eBillMethod.TIEN_MAT.num;
        }
        else {
            this.inputSearch.payment_type = this.state.payment_type!;
        }
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
            groupMachineId: undefined,
            listMachineId: undefined,
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
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 4)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => { await this.setState({ groupMachineId: value }); this.handleSubmitSearch() }} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 4)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple
                            onChangeMachine={(value) => { this.setState({ listMachineId: value }); this.handleSubmitSearch() }} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 3)}>
                        <strong>Mã đơn hàng</strong>
                        <Input allowClear
                            onChange={async (e) => { await this.setState({ bi_code: e.target.value }); this.handleSubmitSearch() }} placeholder={"Nhập tìm kiếm..."}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.bi_code}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 3)}>
                        <strong>Trạng thái trả hàng</strong>
                        <SelectEnum
                            placeholder='Trạng thái...'
                            eNum={ePaidStatus}
                            onChangeEnum={async (e) => { await this.setState({ bi_status: e }); await this.handleSubmitSearch() }}
                            enum_value={this.state.bi_status}
                        ></SelectEnum>
                    </Col>

                    {this.props.cash_payment != true && <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 3)}>
                        <strong>Hình thức thanh toán</strong>
                        <SelectEnum
                            placeholder='Hình thức...'
                            eNum={eBillMethod}
                            onChangeEnum={async (e) => { await this.setState({ payment_type: e }); await this.handleSubmitSearch() }}
                            enum_value={this.state.payment_type}
                        ></SelectEnum>
                    </Col>}

                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 4)}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{this.shouldChangeText() ? 'Tìm' : 'Tìm kiếm'}</Button>
                            {
                                (this.state.payment_type != undefined || this.state.bi_code || this.state.rangeDatetime !== undefined || this.state.bi_status !== undefined || this.state.groupMachineId !== undefined || this.state.listMachineId != undefined) &&
                                <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >{'Xóa tìm kiếm'}</Button>
                            }
                        </Space>
                    </Col>
                </Row>
            </div>
        )
    }

}

