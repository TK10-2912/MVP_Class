import AppConsts, { EventTable } from '@src/lib/appconst';
import { RfidLogDto, ReconcileDto, BillingDto } from '@src/services/services_autogen';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import * as React from 'react';
import { Col, Input, Row, Table, Tag } from 'antd';
import { eBillReconcileStatus, valueOfeBillRequiredFund } from '@src/lib/enumconst';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { stores } from '@src/stores/storeInitializer';
import { CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';


export interface IProps {
    isLoadDone?: boolean;
    actionTable?: (item: RfidLogDto, event: EventTable) => void;
    hasAction?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
    pagination?: TablePaginationConfig | false;
    rfid_id_list?: number[];
    ma_id?: number;
    billing: BillingDto[];
}

export default class TableBillingDetailRFID extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        visibleModalPayment: false,
        visibleModalBillProduct: false,
        bi_code_search: undefined,
        rf_code_search: undefined,
        bi_reconcile_status_search: [],
    }
    componentRef: any | null = null;
    listRfidLog: RfidLogDto[] = [];
    listDataBillFill: RfidLogDto[] = [];
    
    getAll = async () => {
        const { rfid_id_list } = this.props;
        this.setState({ isLoadDone: false });
        await stores.rfidLogStore.getAllLogs(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        const { logRFIDListResult } = stores.rfidLogStore;
        this.listRfidLog = logRFIDListResult != undefined && rfid_id_list != undefined ? logRFIDListResult.filter(bill => rfid_id_list?.includes(bill.rf_lo_id)) : [];
        this.setState({ isLoadDone: true });
    }
    async componentDidMount() {
        await this.getAll();
    }
    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        if (this.state.bi_code_search != undefined) {
            this.listDataBillFill = this.listRfidLog != undefined ? this.listRfidLog.filter(item => item.rf_code?.includes(this.state.bi_code_search!)) : [];
        }
        if (this.state.rf_code_search != undefined) {
            this.listDataBillFill = this.listRfidLog != undefined ? this.listRfidLog.filter(item => item.rf_code?.includes(this.state.rf_code_search!)) : [];
        }
        this.setState({ isLoadDone: true });
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    textJsonParse(jason: string, text: string) {
        const { billing } = this.props
        let firtText = jason.charAt(0)
        let textNotify: string = "";
        if (firtText == '{') {
            const textJason = JSON.parse(jason)
            switch (text) {
                case "Mã hóa đơn":
                    return textJason.ma_hoa_don != undefined ? textJason.ma_hoa_don : "Không có mã hóa đơn";
                case "Tiền khuyến mãi":
                    return textJason.tien_khuyen_mai
                case "Tiền dư":
                    return textJason.tien_du;
                case "Tiền đơn hàng":
                    return textJason.tien_can_thanh_toan
                case "Tiền trừ trong thẻ":
                    return textJason.tien_that;
                case "Yêu cầu hoàn tiền":
                    const bill = billing.find(item => item.bi_code === textJason.ma_hoa_don)
                    return bill != undefined ? bill.bi_required_refund : "";
                default:
                    return "Thiếu thông tin"
            }
        }
        else {
            return textNotify;
        }

    }
    render() {
        const { hasAction } = this.props
        const { logRFIDListResult } = stores.rfidLogStore;
        const columns: ColumnsType<RfidLogDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: RfidLogDto, index: number) => <div>{index + 1}</div> },
            {
                title: "Mã thẻ", key: "ex_code", render: (text: string, item: RfidLogDto, index: number) =>
                    <div>{item.rf_code}</div>
            },
            {
                title: "Mã hóa đơn", key: "ex_code", render: (text: string, item: RfidLogDto, index: number) =>
                    <div dangerouslySetInnerHTML={{ __html: this.textJsonParse(item.rf_lo_content!, "Mã hóa đơn") }}></div>
            },
            {
                title: "Tiền giao dịch", children: [
                    {
                        title: "Tiền đơn hàng", render: (text: string, item: RfidLogDto) => <div>{AppConsts.formatNumber(this.textJsonParse(item.rf_lo_content!, "Tiền đơn hàng"))}</div>
                    },
                    {
                        title: "Tiền dư", render: (text: string, item: RfidLogDto) => <div>{AppConsts.formatNumber(this.textJsonParse(item.rf_lo_content!, "Tiền dư"))}</div>
                    },
                    {
                        title: "Tiền khuyến mãi", render: (text: string, item: RfidLogDto) => <div>{AppConsts.formatNumber(this.textJsonParse(item.rf_lo_content!, "Tiền khuyến mãi"))}</div>
                    },
                    {
                        title: "Tiền trừ trong thẻ", render: (text: string, item: RfidLogDto) => <div >{AppConsts.formatNumber(this.textJsonParse(item.rf_lo_content!, "Tiền trừ trong thẻ"))}</div>
                    },
                ], key: "ex_created_at", render: (text: string, item: RfidLogDto) => <div> </div>
            },
            {
                title: "Yêu cầu hoàn tiền", key: "ex_reconcile_at", render: (text: string, item: RfidLogDto) =>
                    <>
                        {
                            this.textJsonParse(item.rf_lo_content!, "Yêu cầu hoàn tiền") == 0 && <Tag color='default'>{valueOfeBillRequiredFund(this.textJsonParse(item.rf_lo_content!, "Yêu cầu hoàn tiền"))}</Tag>
                        }
                        {
                            this.textJsonParse(item.rf_lo_content!, "Yêu cầu hoàn tiền") == 1 && <Tag icon={<SyncOutlined spin />} color="processing">{valueOfeBillRequiredFund(this.textJsonParse(item.rf_lo_content!, "Yêu cầu hoàn tiền"))}</Tag>
                        }
                        {
                            this.textJsonParse(item.rf_lo_content!, "Yêu cầu hoàn tiền") == 2 && <Tag icon={<CheckCircleOutlined />} color="success">{valueOfeBillRequiredFund(this.textJsonParse(item.rf_lo_content!, "Yêu cầu hoàn tiền"))}</Tag>
                        }
                    </>
            },
        ]
        return (
            <>
                <Row>

                    <Col span={12}>
                        <h2>Chi tiết đơn hàng RFID của máy {stores.sessionStore.getNameMachines(this.props.ma_id != undefined ? this.props.ma_id : -1)}</h2>
                    </Col>
                    <Col span={12} style={{ textAlign: 'end' }}>
                        <ActionExport
                            nameFileExport={'bank_reconcile_admin_detal' + ' ' + moment().format('DD_MM_YYYY')}
                            idPrint={"bank_reconcile_user_detail_billing_print_id"}
                            isPrint={true}
                            isExcel={true}
                            isWord={true}
                            componentRef={this.componentRef}
                            onCancel={this.props.onCancel}
                            isDestroy={true}
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={4}>
                        <strong>Mã Thẻ</strong>
                        <Input allowClear
                            onChange={(e) => {
                                this.setState({ rf_code_search: e.target.value === "" ? undefined : e.target.value.trim() });
                                this.onSearchStatic();
                            }}
                            value={this.state.rf_code_search}>
                        </Input>
                    </Col>
                    <Col span={4}>
                        <strong>Mã hóa đơn</strong>
                        <Input allowClear
                            onChange={(e) => {
                                this.setState({ bi_code_search: e.target.value === "" ? undefined : e.target.value.trim() });
                                this.onSearchStatic();
                            }}
                            value={this.state.bi_code_search}>
                        </Input>
                    </Col>
                </Row>
                <Row ref={this.setComponentRef} id='bank_reconcile_user_detail_billing_print_id'>
                    <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                        <TitleTableModalExport title='Bảng chi tiết đơn hàng'></TitleTableModalExport>
                    </Col>
                    <Col span={24}>
                        <Table
                            className='centerTable'
                            scroll={(hasAction != undefined && hasAction === true) ? { x: 1000, y: 600 } : { x: undefined, y: undefined }}
                            columns={columns}
                            size={'middle'}
                            bordered={true}
                            locale={{ "emptyText": "Không có dữ liệu" }}
                            dataSource={(this.state.bi_code_search != undefined || this.state.rf_code_search != undefined)?this.listDataBillFill: this.listRfidLog}
                            rowKey={record => "billing_table" + JSON.stringify(record)}
                            pagination={this.props.hasAction != false ? {
                                showTotal: (tot) => "Tổng" + ": " + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100', '200', '300', '400', '500'],
                            } : false} />
                    </Col>

                </Row>
            </>
        )
    }

}