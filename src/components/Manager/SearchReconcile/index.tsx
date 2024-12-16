import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import {
    MachineAbstractDto
} from '@src/services/services_autogen';
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment, { Moment } from 'moment';
import AppComponentBase from "../AppComponentBase";
import SelectedGroupMachine from '../SelectedGroupMachine';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import * as React from 'react';
import { SearchInputUser } from '@src/stores/statisticStore';
import SelectEnum from '../SelectEnum';
import { eReconcileStatus } from '@src/lib/enumconst';

export interface IProps {
    onSearchStatistic: (input: SearchReconcileInputUser) => void;
    getTypeDate?: (type: any) => void;
    datePick?: string;
    date?: boolean;
}
export const eFormatPicker = {
    month: "month",
    year: "year",
}
const { RangePicker } = DatePicker;
export class SearchReconcileInputUser {
    public start_date;
    public end_date;
    public gr_ma_id;
    public ma_id_list;
    public fieldSort;
    public sort;
    public status;
    constructor(start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, status) {
        this.fieldSort = fieldSort;
        this.sort = sort;
        this.start_date = start_date;
        this.end_date = end_date;
        this.gr_ma_id = gr_ma_id;
        this.ma_id_list = ma_id_list;
        this.status = status;
    }

}

export default class SearchReconcile extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        groupMachineId: undefined,
        listMachineId: undefined,
        selectedOption: "month",
        rangeDatetime: undefined,
        month_select: undefined,
        re_status: undefined,
    };
    inputSearch: SearchReconcileInputUser = new SearchReconcileInputUser(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    machineListResult: MachineAbstractDto[] = [];
    async componentDidMount() {
        await this.setState({ selectedOption: eFormatPicker.month, });
        this.handleSubmitSearch();
    }
    handleSubmitSearch = async () => {
        this.setState({ isLoadDone: false });
        this.inputSearch.start_date = !!this.state.month_select ? moment(this.state.month_select!).subtract(1, "month").date(22).startOf("day").toDate() : undefined;
        this.inputSearch.end_date = !!this.state.month_select ?
            moment(this.state.month_select).date(21).endOf("day").toDate() :
            undefined;
        this.inputSearch.ma_id_list = this.state.listMachineId;
        this.inputSearch.gr_ma_id = this.state.groupMachineId;
        this.inputSearch.status = this.state.re_status;
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
            rangeDatetime: undefined,
            month_select: undefined,
        })
        this.handleSubmitSearch();
    }
    handleChangeMonth = async (e: any) => {
        let start_date = !!this.state.month_select
            ? moment(this.state.month_select).subtract(1, 'month').date(22).startOf('day')
            : undefined;
        let end_date = !!this.state.month_select
            ? moment(this.state.month_select).date(21).endOf('day')
            : undefined;
        this.setState({
            rangeDatetime: [start_date, end_date]
        });
    }
    render() {
        return (
            <div style={{ width: "100%" }}>
                <Row gutter={[8, 8]} align='bottom'>
                    {this.props.date &&
                        <>
                            <Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 3)}>
                                <strong>Tháng đối soát</strong>
                                <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder={"Chọn tháng"}
                                    onChange={async (value) => { await this.setState({ month_select: value }); await this.handleChangeMonth(value); this.handleSubmitSearch() }
                                    }
                                    picker={"month"}
                                    format={'MM/YYYY'}
                                    value={this.state.month_select}
                                    disabledDate={current => current > moment().add(1, "month")}
                                />
                            </Col>
                            {this.state.month_select &&
                                <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)}>
                                    <strong>Khoảng thời gian đối soát</strong>
                                    <RangePicker
                                        value={this.state.rangeDatetime}
                                        format={"DD/MM/YYYY"}
                                        disabled />
                                </Col>}</>}
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => { await this.setState({ groupMachineId: value }); await this.handleSubmitSearch() }} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple
                            onChangeMachine={async (value) => { await this.setState({ listMachineId: value }); await this.handleSubmitSearch() }} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                        <strong>Trạng thái đối soát</strong>
                        <SelectEnum
                            eNum={eReconcileStatus}
                            onChangeEnum={async value => { await this.setState({ re_status: value }); this.handleSubmitSearch() }}
                            enum_value={this.state.re_status}
                        />
                    </Col>
                    <Col  {...cssColResponsiveSpan(24, 24, 16, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }}>
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >Tìm kiếm</Button>
                        </Col>
                        {
                            (!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId || this.state.re_status!=undefined) &&
                            <Col>
                                <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >Xóa tìm kiếm</Button>
                            </Col>
                        }
                    </Col>

                </Row>
            </div>
        )
    }

}

