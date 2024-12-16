import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment, { Moment } from 'moment';
import AppComponentBase from "../AppComponentBase";
import SelectedGroupMachine from '../SelectedGroupMachine';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import * as React from 'react';
import SelectUserMultiple from '../SelectUserMultiple';

export interface IProps {
    onSearchStatistic: (input: SearchReconcileInputAdmin) => void;
    getTypeDate?: (type: any) => void;
    datePick?: string;
}
export const eFormatPicker = {
    month: "month",
    year: "year",
}
const { RangePicker } = DatePicker;

export class SearchReconcileInputAdmin {
    public us_id;
    public start_date;
    public end_date;
    public gr_ma_id;
    public ma_id_list;
    constructor(us_id, start_date, end_date, gr_ma_id, ma_id_list) {
        this.us_id = us_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.gr_ma_id = gr_ma_id;
        this.ma_id_list = ma_id_list;
    }

}
export default class SearchReconcileAdmin extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        groupMachineId: undefined,
        listMachineId: undefined,
        selectedOption: "month",
        rangeDatetime: undefined,
        us_id: undefined,
        month_select: undefined,
    };
    inputSearch: SearchReconcileInputAdmin = new SearchReconcileInputAdmin(undefined, undefined, undefined, undefined, undefined);
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
        this.inputSearch.us_id = this.state.us_id;
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
            us_id: undefined,
        })
        this.handleSubmitSearch();
    }
    handleChangeMonth = async (e: any) => {
        let start_date = !!this.state.month_select ? moment(this.state.month_select).subtract(1, 'month').date(22).startOf('day') : undefined;
        let end_date = !!this.state.month_select ? moment(this.state.month_select).date(22).startOf('day') : undefined;
        this.setState({ rangeDatetime: [start_date, end_date] });
    }
    render() {
        return (
            <Row gutter={[8, 8]} align='bottom'>
                <Col {...cssColResponsiveSpan(24, 12, 6, 4, 4, 4)}>
                    <strong>Tháng</strong>
                    <DatePicker
                        style={{ width: "100%" }}
                        placeholder={"Chọn tháng"}
                        onChange={async (value) => { await this.setState({ month_select: value }); this.handleChangeMonth(value); }}
                        picker={"month"}
                        format={'MM/YYYY'}
                        value={this.state.month_select}
                        disabledDate={current => current > moment()}
                    />
                </Col>
                {this.state.month_select &&
                    <Col {...cssColResponsiveSpan(24, 12, 6, 4, 4, 4)}>
                        <strong>Khoảng thời gian đối soát</strong>
                        <RangePicker
                            value={this.state.rangeDatetime}
                            format={"DD/MM/YYYY"}
                            disabled />
                    </Col>}
                <Col {...cssColResponsiveSpan(24, 12, 6, 4, 4, 4)}>
                    <strong>Nhóm máy</strong>
                    <SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => await this.setState({ groupMachineId: value })} />
                </Col>
                <Col {...cssColResponsiveSpan(24, 12, 6, 4, 4, 4)}>
                    <strong>Máy bán nước</strong>
                    <SelectedMachineMultiple
                        onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
                </Col>
                <Col {...cssColResponsiveSpan(24, 12, 6, 4, 4, 4)}>
                    <strong>Người sở hữu</strong>
                    <SelectUserMultiple
                        onChangeUser={async (value) => { await this.setState({ us_id: value }) }}
                        us_id_list={this.state.us_id}
                    />
                </Col>
                <Col  {...cssColResponsiveSpan(24, 24, 16, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }}>
                    <Col>
                        <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >Tìm kiếm</Button>
                    </Col>
                    {
                        (!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId||!!this.state.us_id) &&
                        <Col>
                            <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >Xóa tìm kiếm</Button>
                        </Col>
                    }
                </Col>
            </Row>
        )
    }

}

