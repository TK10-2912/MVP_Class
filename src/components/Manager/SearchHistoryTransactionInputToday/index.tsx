import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { ePaidStatus, eBillMethod } from '@src/lib/enumconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { Button, Col, DatePicker, Input, Row, Select, Space } from "antd";
import moment from 'moment';
import AppComponentBase from "../AppComponentBase";
import SelectEnum from '../SelectEnum';
import SelectedGroupMachine from '../SelectedGroupMachine';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import * as React from 'react';

export class SearchHistoryTransactionTodayType {
    public us_id;
    public payment_type;
    public bi_status;
    public bi_code;
    public gr_ma_id;
    public ma_id_list;
    public fieldSort;
    public sort;
    constructor(us_id, payment_type, bi_status, bi_code, gr_ma_id, ma_id_list, fieldSort, sort) {
        this.us_id = us_id;
        this.payment_type = payment_type;
        this.bi_status = bi_status;
        this.bi_code = bi_code;
        this.gr_ma_id = gr_ma_id;
        this.ma_id_list = ma_id_list;
        this.fieldSort = fieldSort;
        this.sort = sort;
    }
}
export interface IProps {
    onSearchStatistic: (input: SearchHistoryTransactionTodayType) => void;
    datePick?: string;
    cash_payment?: boolean;
    ma_id?: number;
}

export default class SearchHistoryTransactionToday extends AppComponentBase<IProps> {
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
    inputSearch: SearchHistoryTransactionTodayType = new SearchHistoryTransactionTodayType(this.state.us_id, this.state.payment_type, this.state.bi_status, this.state.bi_code, this.state.groupMachineId, this.state.listMachineId, undefined, undefined);
    machineListResult: MachineAbstractDto[] = [];
    async componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        let ma_list_id = urlParams.get('ma_list_id') == null || urlParams.get('ma_list_id') == "undefined" ? undefined : [Number(urlParams.get('ma_list_id'))];
        let gr_id = urlParams.get('gr_id') == null || urlParams.get('gr_id') == undefined ? [] : isNaN(Number(urlParams.get('gr_id'))) ? undefined : Number(urlParams.get('gr_id'));
        let paymentType = urlParams.get('paymentType') == null || urlParams.get('paymentType') == "paymentType" ? undefined : [Number(urlParams.get('paymentType'))];
        if (ma_list_id != undefined || paymentType != undefined) {
            let paymentType = urlParams.get('paymentType') == null || urlParams.get('paymentType') == "paymentType" ? [] : [Number(urlParams.get('paymentType'))];
            await this.setState({ listMachineId: ma_list_id?.length! > 0 ? ma_list_id : undefined, groupMachineId: gr_id ?? undefined, payment_type: paymentType })
        }
        await this.handleSubmitSearch();
    }
    handleSubmitSearch = async () => {
        await this.setState({ isLoadDone: false });
        this.inputSearch.ma_id_list = this.state.listMachineId;
        this.inputSearch.gr_ma_id = this.state.groupMachineId;
        this.inputSearch.bi_status = this.state.bi_status!;
        this.inputSearch.bi_code = this.state.bi_code!;
        if (this.props.cash_payment != true) {
            this.inputSearch.payment_type = this.state.payment_type!;
        }
        else {
            this.inputSearch.payment_type = eBillMethod.TIEN_MAT.num;
        }
        this.inputSearch.us_id = this.state.us_id;
        const { onSearchStatistic } = this.props;
        if (onSearchStatistic != undefined) {
            onSearchStatistic(this.inputSearch);
        }
        await this.setState({ isLoadDone: true });
    }

    onClearSearch = async () => {
        await this.setState({
            groupMachineId: undefined,
            listMachineId: undefined,
            bi_status: undefined,
            payment_type: undefined,
            us_id: undefined,
            rangeDatetime: undefined,
            bi_code: undefined,
        })
        this.handleSubmitSearch();
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 1900;
        return !!isChangeText;
    }

    render() {
        return (
            <div style={{ width: "100%" }}>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 4, 4)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => { await this.setState({ groupMachineId: value }); this.handleSubmitSearch() }} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 4, 4)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple
                            onChangeMachine={(value) => { this.setState({ listMachineId: value }); this.handleSubmitSearch() }} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 4, 4)}>
                        <strong>Mã đơn hàng</strong>
                        <Input allowClear
                            onChange={async (e) => { await this.setState({ bi_code: e.target.value }); await this.handleSubmitSearch() }} placeholder={"Nhập tìm kiếm..."}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.bi_code}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 4, 4)}>
                        <strong>Trạng thái trả hàng</strong>
                        <SelectEnum
                            placeholder='Trạng thái...'
                            eNum={ePaidStatus}
                            onChangeEnum={async (e) => { await this.setState({ bi_status: e }); await this.handleSubmitSearch() }}
                            enum_value={this.state.bi_status}
                        ></SelectEnum>
                    </Col>

                    {this.props.cash_payment != true && <Col {...cssColResponsiveSpan(24, 12, 8, 6, 4, 4)}>
                        <strong>Hình thức thanh toán</strong>
                        <SelectEnum
                            placeholder='Hình thức...'
                            eNum={eBillMethod}
                            onChangeEnum={async (e) => { await this.setState({ payment_type: e }); await this.handleSubmitSearch() }}
                            enum_value={this.state.payment_type}
                        ></SelectEnum>
                    </Col>}

                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 4, 4)}>
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

