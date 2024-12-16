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
import SelectEnum from '../SelectEnum';
import { eReconcileStatus } from '@src/lib/enumconst';
import { unescape } from 'querystring';

export interface IProps {
    onSearchStatistic: (input: SearchReconcileInputAdmin) => void;
    getTypeDate?: (type: any) => void;
    datePick?: string;
    hideSearch?: boolean;
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
    public status;
    constructor(us_id, start_date, end_date, gr_ma_id, ma_id_list, status) {
        this.us_id = us_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.gr_ma_id = gr_ma_id;
        this.ma_id_list = ma_id_list;
        this.status = status;
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
        re_status: undefined,
        month_select: undefined,
    };
    inputSearch: SearchReconcileInputAdmin = new SearchReconcileInputAdmin(undefined, undefined, undefined, undefined, undefined, undefined);
    machineListResult: MachineAbstractDto[] = [];
    async componentDidMount() {
        await this.setState({ selectedOption: eFormatPicker.month, });
        this.handleSubmitSearch();
    }
    handleSubmitSearch = async () => {
        this.setState({ isLoadDone: false });
        this.inputSearch.start_date = !!this.state.month_select ? moment(this.state.month_select!).subtract(1, "month").date(22).startOf("day").toDate() : undefined;
        this.inputSearch.end_date = !!this.state.month_select ? moment(this.state.month_select).date(21).endOf("day").toDate() : undefined;
        this.inputSearch.ma_id_list = this.state.listMachineId;
        this.inputSearch.gr_ma_id = this.state.groupMachineId;
        this.inputSearch.us_id = this.state.us_id;
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
            us_id: undefined,
            re_status: undefined,
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
        const spanMonth = this.props.hideSearch == false ? {...cssColResponsiveSpan(12,5, 5, 5, 5, 5 )} : {...cssColResponsiveSpan(24, 12, 8, 3, 3, 3)};
        const spanBtnSearch = this.props.hideSearch == false ? {...cssColResponsiveSpan(24,10, 9,11 , 11, 11 )} : {...cssColResponsiveSpan(24, 24, 16, 7, 7, 5)};
        const spanDate = this.props.hideSearch == false ? {...cssColResponsiveSpan(12,9, 10, 8, 8, 8 )} : {...cssColResponsiveSpan(24, 24, 16, 7, 7, 5)};
        return (
            <div style={{ width: "100%" }}>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col {...spanMonth} >
                        <strong>Tháng đối soát</strong>
                        <DatePicker
                            style={{ width: "100%" }}
                            placeholder={"Chọn tháng"}
                            onChange={async (value) => { await this.setState({ month_select: value ==null ? undefined: value });console.log(2222,value);
                             await this.handleChangeMonth(value); await this.handleSubmitSearch() }
                            }
                            picker={"month"}
                            format={'MM/YYYY'}
                            value={this.state.month_select}
                            disabledDate={current => current > moment().add(1, "month")}
                        />
                    </Col>
                    {this.state.month_select &&
                        <Col {...spanDate}>
                            <strong>Thời gian đối soát</strong>
                            <RangePicker
                                style={{ width: "100%" }}
                                value={this.state.rangeDatetime}
                                format={"DD/MM/YYYY"}
                                disabled />
                        </Col>}
                    {this.props.hideSearch != false &&
                        <>
                            <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                                <strong>Nhóm máy</strong>
                                <SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => { await this.setState({ groupMachineId: value }); await this.handleSubmitSearch() }} />
                            </Col>
                            <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                                <strong>Máy bán nước</strong>
                                <SelectedMachineMultiple
                                    onChangeMachine={async (value) => { await this.setState({ listMachineId: value }); await this.handleSubmitSearch() }} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
                            </Col>
                            <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                                <strong>Người vận hành</strong>
                                <SelectUserMultiple
                                    onChangeUser={async (value) => { await this.setState({ us_id: value }); await this.handleSubmitSearch() }}
                                    us_id_list={this.state.us_id}
                                />
                            </Col>
                            <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                                <strong>Trạng thái đối soát</strong>
                                <SelectEnum
                                    eNum={eReconcileStatus}
                                    onChangeEnum={async value => {
                                        await this.setState({ re_status: value }); await this.handleSubmitSearch();
                                    }}
                                    enum_value={this.state.re_status}
                                />
                            </Col>
                            </>
                    }
                    <Col  {...spanBtnSearch} style={{ display: "flex", flexWrap: "wrap", padding: 0 }}>
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >Tìm kiếm</Button>
                        </Col>
                        {
                            (!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId || !!this.state.us_id || this.state.re_status !== undefined) &&
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

