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

export interface IProps {
    onSearchStatistic: (input: SearchDailySaleMonitoringInputAdmin) => void;
    getTypeDate?: (type: any) => void;
    datePick?: string;
}
const { RangePicker } = DatePicker;
export class SearchDailySaleMonitoringInputAdmin {
	public us_id;
	public start_date;
	public end_date ;
	public gr_ma_id;
	public ma_id_list;
	constructor(us_id,start_date,end_date,gr_ma_id,ma_id_list) {
        this.us_id = us_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.gr_ma_id = gr_ma_id;
        this.ma_id_list = ma_id_list;
	}
  
}
export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}

export default class SearchDailyMonitoringAdmin extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        groupMachineId: undefined,
        listMachineId: undefined,
        us_id: undefined,
        selectedOption: "date",
        rangeDatetime: undefined,
        start_date:undefined,
        end_date:undefined,
    };
    inputSearch: SearchDailySaleMonitoringInputAdmin = new SearchDailySaleMonitoringInputAdmin(this.state.us_id,this.state.start_date,this.state.end_date,this.state.groupMachineId,this.state.listMachineId);
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
        this.inputSearch.ma_id_list = this.state.listMachineId;
        this.inputSearch.us_id = this.state.us_id;
        this.inputSearch.gr_ma_id = this.state.groupMachineId;
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
            us_id: undefined,
            rangeDatetime: undefined,
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
                    <Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 2)}>
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
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 6)}>
                        <strong>Khoảng thời gian</strong>
                        <RangePicker
                            style={{ width: "100%" }}
                            placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
                            onChange={async value => await this.setState({ rangeDatetime: value })}
                            picker={this.state.selectedOption as any}
                            format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
                            value={this.state.rangeDatetime as any}
                            allowEmpty={[false, true]}
                            disabledDate={current => current > moment()}
                        />
                    </Col>

                    <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
                        <strong>Người sở hữu</strong>
                        <SelectUserMultiple
                            onChangeUser={async (value) => { await this.setState({ us_id: value }) }}
                            us_id_list={this.state.us_id}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => await this.setState({ groupMachineId: value })} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple
                            onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
                    </Col>
                    <Col  {...cssColResponsiveSpan(24, 12, 8, 24, 24, 7)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }}>
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{(window.innerWidth >= 576 && window.innerWidth <= 992) ? 'Tìm' : 'Tìm kiếm'}</Button>
                        </Col>
                        {
                            (!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId || !!this.state.us_id) &&
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

