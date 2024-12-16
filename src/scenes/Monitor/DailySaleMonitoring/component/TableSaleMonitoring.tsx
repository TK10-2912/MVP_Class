import { EnvironmentOutlined, SendOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import { BillingOfMachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Col, Modal, Row, Space, Table, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import React from 'react';
import { Link } from 'react-router-dom';
import MapComponent from '@src/components/MapComponent';
import moment from 'moment';
export interface IProps {
    billingOfMachine?: BillingOfMachineDto[];
    pagination: TablePaginationConfig | false;
    actionTable?: (item: BillingOfMachineDto, event: EventTable) => void;
    is_printed?: boolean;
    start_date?: any;
    end_date?: any;
    parent?: string;
}
export default class TableSaleMonitoring extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        visibleModalCreateUpdate: false,
        key_selected: undefined,
        clicked: false,
        key: undefined,
        visibleModalGoogleMap: false,
        ma_gps_lat: 0,
        ma_gps_lng: 0,
        ma_mapUrl: '',
        ma_name: undefined,
    };
    onAction = (item: BillingOfMachineDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    };

    isValidLocation = async (item: BillingOfMachineDto, hasUrlMap: boolean) => {
        if (hasUrlMap) {
            await this.setState({ visibleModalGoogleMap: true, ma_mapUrl: item.ma_mapUrl, ma_name: item.ten_may, ma_gps_lat: 0, ma_gps_lng: 0 })
            return;
        }
        await this.setState({ visibleModalGoogleMap: true, ma_name: item.ten_may, ma_gps_lat: +item.ma_gps_lat!, ma_gps_lng: +item.ma_gps_lng! })
    };

    render() {
        const { billingOfMachine, pagination, is_printed } = this.props;
        const checkUndefind = billingOfMachine != undefined && billingOfMachine.length > 0;
        const totalCash = checkUndefind ? billingOfMachine!.reduce((total, record) => total + record.tong_tien_mat_duoc_nhan, 0) : 0;
        const totalQR = checkUndefind ? billingOfMachine!.reduce((total, record) => total + record.tong_tien_qr_duoc_nhan, 0) : 0;
        const totalRFID = checkUndefind ? billingOfMachine!.reduce((total, record) => total + record.tong_tien_rfid_duoc_nhan, 0) : 0;
        const columns: ColumnsType<BillingOfMachineDto> = [
            {
                title: 'STT',
                key: 'stt_machine_index',
                width: 50,
                fixed: 'left',
                render: (_: string, item: BillingOfMachineDto, index: number) => (
                    <div>
                        {pagination != false
                            ? pagination.pageSize! * (pagination.current! - 1) + (index + 1)
                            : index + 1}
                    </div>
                ),
            },
            {
                title: 'Nhóm máy',
                key: 'stt_machine_index',
                render: (_: string, item: BillingOfMachineDto) => (
                    <div>
                        {this.props.is_printed ? (
                            stores.sessionStore.getNameGroupMachinesbyNameDisplayTable(item.ten_nhom)
                        ) : (
                            <div title="Xem chi tiết nhóm máy">
                                <Link
                                    to={
                                        '/general/machine/?gr_id=' +
                                        stores.sessionStore.getIdGroupMachinesStatistic(item.ten_nhom!)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {stores.sessionStore.getNameGroupMachinesbyNameDisplayTable(item.ten_nhom)}
                                </Link>
                            </div>
                        )}
                    </div>
                ),
            },
            {
                title: 'Máy bán nước',
                key: 'stt_machine_index',
                width: 150,
                render: (_: string, item: BillingOfMachineDto) => (
                    <div>
                        {this.props.is_printed ?
                            item.ma_may + "-" + item.ten_may
                            : (
                                <div title="Xem thông tin máy">
                                    <Link
                                        to={'/general/machine/?machine=' + item.ma_may}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <p style={{ margin: 0 }}>{item.ma_may}</p>
                                        <p style={{
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            margin: 0,
                                            color: "gray",
                                            fontSize: 11
                                        }}>{item.ten_may}</p>
                                    </Link>
                                </div>
                            )}
                    </div>
                ),
            },
            {
                title: 'Số đơn hàng đã bán',
                dataIndex: 'so_luong_ban',
                key: 'stt_machine_index',
                sorter: (a, b) => a.so_luong_ban - b.so_luong_ban,
                render: (_: string, item: BillingOfMachineDto) => (
                    <div>
                        <div title="Xem chi tiết giao dịch">{AppConsts.formatNumber(item.so_luong_ban)}</div>
                    </div>
                ),
            },
            {
                title: 'Tổng tiền đơn hàng (VNĐ)',
                dataIndex: 'tong_tien_san_pham',
                key: 'tong_tien_san_pham',
                sorter: (a, b) => a.tong_tien_san_pham - b.tong_tien_san_pham,
                render: (_: string, item: BillingOfMachineDto) => (
                    <div>
                        <div title="Xem chi tiết giao dịch">
                            {AppConsts.formatNumber(item.tong_tien_san_pham)}
                        </div>
                    </div>
                ),
            },
            {
                title: 'Tổng tiền nhận được (VNĐ)',
                dataIndex: 'tong_tien_duoc_nhan',
                key: 'stt_machine_index',
                children: [
                    {
                        title: 'Tiền mặt',
                        sorter: (a, b) => a.tong_tien_mat_duoc_nhan - b.tong_tien_mat_duoc_nhan,
                        render: (_: string, item: BillingOfMachineDto) => (
                            <div>
                                <div title="Xem chi tiết giao dịch">{AppConsts.formatNumber(item.tong_tien_mat_duoc_nhan)}</div>
                            </div>
                        ),
                    },
                    {
                        title: 'Ngân hàng',
                        sorter: (a, b) => a.tong_tien_qr_duoc_nhan - b.tong_tien_qr_duoc_nhan,
                        render: (_: string, item: BillingOfMachineDto) => (
                            <div>
                                <div title="Xem chi tiết giao dịch">{AppConsts.formatNumber(item.tong_tien_qr_duoc_nhan)}</div>
                            </div>
                        ),
                    },
                    {
                        title: 'RFID',
                        sorter: (a, b) => a.tong_tien_rfid_duoc_nhan - b.tong_tien_rfid_duoc_nhan,
                        render: (_: string, item: BillingOfMachineDto) => (
                            <div>
                                <div title="Xem chi tiết giao dịch">{AppConsts.formatNumber(item.tong_tien_rfid_duoc_nhan)}</div>
                            </div>
                        ),
                    },
                ],
            },
            {
                title: 'Số đơn khuyến mãi',
                dataIndex: 'so_don_khuyen_mai',
                key: 'promoCount',
                sorter: (a, b) => a.so_luong_don_khuyen_mai - b.so_luong_don_khuyen_mai,
                render: (_: string, item: BillingOfMachineDto) => (
                    <div>
                        <div title="Xem chi tiết giao dịch">
                            {AppConsts.formatNumber(item.so_luong_don_khuyen_mai)}
                        </div>
                    </div>
                ),
            },
            {
                title: 'Tổng tiền khuyến mãi (VNĐ)',
                dataIndex: 'tong_tien_khuyen_mai',
                key: 'stt_machine_index',
                sorter: (a, b) => a.tong_tien_khuyen_mai - b.tong_tien_khuyen_mai,
                render: (_: string, item: BillingOfMachineDto) => (
                    <div>
                        <div title="Xem chi tiết giao dịch">
                            {AppConsts.formatNumber(item.tong_tien_khuyen_mai)}
                        </div>
                    </div>
                ),
            },
            {
                title: "Tổng tiền hoàn trả", sorter: (a, b) => a.tong_tien_hoan_tra - b.tong_tien_hoan_tra, key: "tong_tien_hoan_tra",
                render: (_: string, item: BillingOfMachineDto) => <div>
                    <div title="Xem chi tiết giao dịch">
                        {AppConsts.formatNumber(!!item && item.tong_tien_hoan_tra)}
                    </div>
                </div>
            },

            {
                title: 'Số mã giảm giá đã dùng',
                dataIndex: 'so_luong_ma_giam_gia',
                key: 'stt_machine_index',
                sorter: (a, b) => a.so_luong_ma_giam_gia - b.so_luong_ma_giam_gia,
                render: (_: string, item: BillingOfMachineDto) => (
                    <div>
                        <div title="Xem chi tiết giao dịch">
                            {AppConsts.formatNumber(item.so_luong_ma_giam_gia)}
                        </div>
                    </div>
                ),
            },
            {
                title: 'Tổng tiền giảm giá (VNĐ)',
                dataIndex: 'tong_tien_giam_gia',
                key: 'stt_machine_index',
                sorter: (a, b) => a.tong_tien_giam_gia - b.tong_tien_giam_gia,
                render: (_: string, item: BillingOfMachineDto) => (
                    <div>
                        <div title="Xem chi tiết giao dịch">
                            {AppConsts.formatNumber(item.tong_tien_giam_gia)}
                        </div>
                    </div>
                ),
            },
            ...(is_printed
                ? []
                : [
                    {
                        title: 'Vị trí',
                        key: 'ma_located',
                        width: 100,
                        render: (_: string, item: BillingOfMachineDto) => (
                            <Space  >
                                {
                                    AppConsts.isValidLocation(item.ma_gps_lat, item.ma_gps_lng) ?
                                        <>
                                            <Button title='Vị trí' icon={<EnvironmentOutlined />} onClick={(event) => {
                                                event.stopPropagation();
                                                this.isValidLocation(item, false);
                                            }}>
                                            </Button>
                                            <Button
                                                icon={<SendOutlined />} title={"Chỉ đường"}
                                                onClick={(e) => {
                                                    AppConsts.actionDirection(item.ma_gps_lat!, item.ma_gps_lng!);
                                                    e.stopPropagation();
                                                }}
                                            ></Button>
                                        </>
                                        :
                                        item.ma_mapUrl ?
                                            <Button
                                                icon={<EnvironmentOutlined />} title={"Vị trí máy"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.isValidLocation(item, true);
                                                }}
                                            ></Button>
                                            : ""
                                }
                            </Space>
                        ),
                    },
                ]),
        ];

        return (
            <>
                <Table
                    onRow={(record) => {
                        return {
                            title: !!record && record.tong_tien_san_pham !== (record.tong_tien_mat_duoc_nhan + record.tong_tien_qr_duoc_nhan + record.tong_tien_rfid_duoc_nhan)
                                ? "Chênh lệch có thể xảy ra do giao dịch thất bại hoặc quá trình trả hàng bị lỗi"
                                : "Xem chi tiết giao dịch",
                            onClick: () => {
                                if (!this.props.is_printed) {
                                    const { start_date, end_date } = this.props;
                                    const machineId = Number(stores.sessionStore.getIdMachine(record.ma_may!));
                                    const groupId = stores.sessionStore.getIDGroupUseName(record.ten_nhom!);
                                    const today = new Date().toISOString().split('T')[0];
                                    let url =
                                        this.props.parent === 'sale_detail'
                                            ? `/history/transaction_detail?gr_id=${groupId}&ma_list_id=${machineId}`
                                            : `/history/transaction_detail?date=${today}&gr_id=${groupId}&ma_list_id=${machineId}`;
                                    if (start_date !== undefined && end_date !== undefined) {
                                        url =
                                            this.props.parent === 'sale_detail'
                                                ? `/history/transaction_detail?gr_id=${groupId}&ma_list_id=${machineId}&start_date=${moment(start_date).format("MM/DD/YYYY")}&end_date=${moment(end_date).format("MM/DD/YYYY")}`
                                                : `/history/transaction_detail?date=${today}&gr_id=${groupId}&ma_list_id=${machineId}&start_date=${moment(start_date).format("MM/DD/YYYY")}&end_date=${moment(end_date).format("MM/DD/YYYY")}`;
                                    }
                                    if (record.tong_tien_san_pham > 0) {
                                        window.open(url, '_blank');
                                    }
                                    else {
                                        message.warning("Không có đơn hàng nào")
                                    }
                                }
                            },
                            style: { cursor: this.props.is_printed ? '' : 'pointer' },
                        };
                    }}
                    className="centerTable"
                    rowClassName={(record) =>
                        this.state.key_selected === record.key ? 'bg-click' : 'bg-white'
                    }
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1000, y: 600 }}
                    loading={!this.state.isLoadDone}
                    rowKey={(record) => 'quanlymaybannuoc_index__' + JSON.stringify(record)}
                    size={'middle'}
                    bordered={true}
                    columns={columns}
                    dataSource={billingOfMachine}
                    footer={
                        () =>
                            <Row justify='center' style={{ marginTop: "8px", fontSize: 14 }}>
                                <Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
                                    <span>Số máy bán nước: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? billingOfMachine?.length : 0}</strong></span>
                                    <br />
                                    <span>Số đơn hàng đã bán: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? AppConsts.formatNumber(billingOfMachine!.reduce((total, record) => total + record.so_luong_ban, 0)) : 0}</strong></span>
                                    <br />
                                    <span>Tổng tiền đơn hàng: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? AppConsts.formatNumber(billingOfMachine!.reduce((total, record) => total + record.tong_tien_san_pham, 0)) : 0} đ</strong></span>
                                    <br />
                                    <span>Tổng tiền hoàn trả: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? AppConsts.formatNumber(billingOfMachine!.reduce((total, record) => total + record.tong_tien_hoan_tra, 0)) : 0} đ</strong></span>
                                </Col>
                                <Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
                                    <span>Tổng tiền nhận được: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? AppConsts.formatNumber(totalCash + totalQR + totalRFID) : 0} đ</strong></span>
                                    <br />
                                    <span>Tổng tiền mặt nhận được: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalCash)} đ</strong></span>
                                    <br />
                                    <span>Tổng tiền ngân hàng nhận được: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalQR)} đ</strong></span>
                                    <br />
                                    <span>Tổng tiền RFID nhận được: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalRFID)} đ</strong></span>
                                </Col>
                                <Col  {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
                                    <span>Số mã giảm giá đã dùng: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? AppConsts.formatNumber(billingOfMachine!.reduce((total, record) => total + record.so_luong_ma_giam_gia, 0)) : 0}</strong></span>
                                    <br />
                                    <span>Tổng tiền giảm giá: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? AppConsts.formatNumber(billingOfMachine!.reduce((total, record) => total + record.tong_tien_giam_gia, 0)) : 0} đ</strong></span>
                                    <br />
                                    <span>Số đơn khuyến mãi: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? AppConsts.formatNumber(billingOfMachine!.reduce((total, record) => total + record.so_luong_don_khuyen_mai, 0)) : 0}</strong></span>
                                    <br />
                                    <span>Tổng tiền khuyến mãi: <strong style={{ color: '#1DA57A' }}>{checkUndefind ? AppConsts.formatNumber(billingOfMachine!.reduce((total, record) => total + record.tong_tien_khuyen_mai, 0)) : 0} đ</strong></span>
                                </Col>
                            </Row>
                    }
                    pagination={this.props.pagination}
                />
                <Modal
                    centered
                    visible={this.state.visibleModalGoogleMap}
                    onCancel={() => this.setState({ visibleModalGoogleMap: false })}
                    title={<h3>{'Vị trí máy: ' + this.state.ma_name}</h3>}
                    width={'70vw'}
                    footer={null}
                >
                    {(this.state.ma_gps_lat && this.state.ma_gps_lng) ?
                        <MapComponent
                            centerMap={{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng }}
                            zoom={15}
                            positionList={[
                                { lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng, title: 'Vị trí máy' },
                            ]}
                        />
                        :
                        <div dangerouslySetInnerHTML={{ __html: this.state.ma_mapUrl! }} />
                    }
                </Modal>
            </>
        );
    }
}
