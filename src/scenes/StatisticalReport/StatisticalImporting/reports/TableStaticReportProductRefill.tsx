import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { StatisticBillingOfProductDto } from '@src/services/services_autogen';
import { TablePaginationConfig, ColumnsType } from 'antd/lib/table';
import * as React from 'react';
import { Col, Row, Table } from 'antd';
import { SorterResult } from 'antd/lib/table/interface';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
    pagination: TablePaginationConfig | false;
    isLoadDone?: boolean;
    isPrint?: boolean;
    type?: string;
    listBillingOfDrinkProduct: StatisticBillingOfProductDto[];
    changeColumnSort?: (
        fieldSort:
            | SorterResult<StatisticBillingOfProductDto>
            | SorterResult<StatisticBillingOfProductDto>[]
    ) => void;
    currentPage?: number;
    pageSize?: number;
}

export default class TableStaticReportProductRefill extends React.Component<IProps> {
    render() {
        const { pagination, listBillingOfDrinkProduct, type } = this.props;
        const columns: ColumnsType<StatisticBillingOfProductDto> = [
            {
                title: 'STT',
                key: 'stt',
                width: 50,
                render: (text: string, item: StatisticBillingOfProductDto, index: number) => (
                    <div>
                        {pagination !== false
                            ? pagination.pageSize! * (pagination.current! - 1) + (index + 1)
                            : index + 1}
                    </div>
                ),
            },
            {
                title: 'Tên sản phẩm',
                key: 'productname',
                width: 150,
                render: (text: string, item: StatisticBillingOfProductDto) => (
                    <div>
                        {item.productname == '' ? (
                            <div style={{ color: 'red' }}>Sản phẩm đã bị xóa</div>
                        ) : (
                            item.productname
                        )}
                    </div>
                ),
            },
            {
                title: 'Loại hình thanh toán',
                key: 'loai_hinh_thanh_toan',
                children: [
                    {
                        title: 'Tiền mặt',
                        width: 110,
                        sorter: true,
                        key: 'cash',
                        render: (text: string, item: StatisticBillingOfProductDto) => (
                            <div>{AppConsts.formatNumber(item.cash)}</div>
                        ),
                    },
                    {
                        title: 'Số lượng ' + this.props.type,
                        width: 50,
                        sorter: true,
                        key: 'cash_count',
                        render: (text: string, item: StatisticBillingOfProductDto) => (
                            <div>{AppConsts.formatNumber(item.cash_quantity * 100)}</div>
                        ),
                    },
                    {
                        title: 'Mã QR',
                        key: 'moneyQr',
                        width: 110,
                        sorter: true,
                        render: (text: string, item: StatisticBillingOfProductDto) => (
                            <div>{AppConsts.formatNumber(item.moneyQr)}</div>
                        ),
                    },
                    {
                        title: 'Số lượng ' + this.props.type,
                        width: 50,
                        key: 'qr_count',
                        sorter: true,
                        render: (text: string, item: StatisticBillingOfProductDto) => (
                            <div>{AppConsts.formatNumber(item.qr_quantity * 1000)}</div>
                        ),
                    },
                    {
                        title: 'RFID',
                        width: 110,
                        key: 'moneyRFID',
                        sorter: true,
                        render: (text: string, item: StatisticBillingOfProductDto) => (
                            <div>{AppConsts.formatNumber(item.moneyRFID)}</div>
                        ),
                    },
                    {
                        title: 'Số lượng ' + this.props.type,
                        key: 'rfid_count',
                        width: 50,
                        sorter: true,
                        render: (text: string, item: StatisticBillingOfProductDto) => (
                            <div>{AppConsts.formatNumber(item.rfid_quantity * 1000)}</div>
                        ),
                    }, {
                        title: 'Khuyến mãi',
                        width: 100,
                        key: 'moneyPromo',
                        sorter: true,
                        render: (_: string, item: StatisticBillingOfProductDto) => (
                            // <div>{AppConsts.formatNumber(item.moneyRFID)}</div>
                            <div>chưa có api</div>
                        ),
                    },
                    {
                        title: 'Số lượng ' + this.props.type,
                        key: 'promo_count',
                        width: 100,
                        sorter: true,
                        render: (_: string, item: StatisticBillingOfProductDto) => (
                            // <div>{AppConsts.formatNumber(item.rfid_quantity)}</div>
                            <div>chưa có api</div>
                        ),
                    },
                ],
            },
            {
                title: <b>{'Tổng số lượng sản phẩm' + this.props.type}</b>,
                key: 'totalQuantity',
                width: 100,
                sorter: true,
                render: (text: string, item: StatisticBillingOfProductDto) => (
                    <div>
                        <b>{AppConsts.formatNumber(item.totalQuantity)}</b>
                    </div>
                ),
            },
            {
                title: <b>{'Tổng cộng (VNĐ)'}</b>,
                key: 'total',
                sorter: true,
                width: 140,
                render: (text: string, item: StatisticBillingOfProductDto) => (
                    <div>
                        <b>{AppConsts.formatNumber(item.totalMoney)}</b>
                    </div>
                ),
            },
        ];
        const calculateTotalQuantity = (key) => {
            const slicedList = listBillingOfDrinkProduct;
            const totalQuantity = slicedList.reduce((sum, item) => sum + (item[key] || 0), 0);
            return type === '(ml)' ? totalQuantity : totalQuantity;
        };
        const { totalBillingFreshDrinkStatistic } = stores.statisticStore;
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={this.props.isPrint ? { x: undefined, y: undefined } : { x: 1000, y: 500 }}
                    columns={columns}
                    size={'small'}
                    bordered={true}
                    dataSource={listBillingOfDrinkProduct || []}
                    pagination={this.props.pagination}
                    rowKey={(record) => 'billing_table' + JSON.stringify(record)}
                    onChange={(
                        _a,
                        _b,
                        sort:
                            | SorterResult<StatisticBillingOfProductDto>
                            | SorterResult<StatisticBillingOfProductDto>[]
                    ) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    footer={() =>
                        this.props.isPrint ? (
                            <></>
                        ) : (
                            <Row style={{ marginTop: '8px', fontSize: 14 }} id='TableStaticReportProductRefill'>
                                <Col
                                    {...cssColResponsiveSpan(24, 24, 24, 5, 5, 8)}
                                    style={{ border: '1px solid #e4e1e1', padding: 15, alignContent: 'center' }}
                                >
                                    <span>
                                        Tổng sản phẩm: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(
                                                totalBillingFreshDrinkStatistic
                                            )}
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        Tổng số lượng sản phẩm: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(
                                                listBillingOfDrinkProduct.length
                                            )}
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        Tổng doanh thu: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(
                                                listBillingOfDrinkProduct
                                                    .reduce(
                                                        (sum, StatisticBillingOfProductDto) =>
                                                            sum + (StatisticBillingOfProductDto.totalMoney || 0),
                                                        0
                                                    )
                                            )}
                                            đ
                                        </strong>
                                    </span>
                                </Col>
                                <Col
                                    {...cssColResponsiveSpan(24, 24, 24, 9, 9, 8)}
                                    style={{ border: '1px solid #e4e1e1', padding: 15 }}>
                                    <span>
                                        Tổng sản phẩm mua bằng tiền mặt: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(calculateTotalQuantity('cash_quantity'))}
                                            {type === '(ml)' ? <> ml</> : ''}
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        Tổng sản phẩm mua bằng ngân hàng: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(calculateTotalQuantity('qr_quantity'))}
                                            {type === '(ml)' ? <> ml</> : ''}
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        Tổng sản phẩm mua bằng RFID: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(calculateTotalQuantity('rfid_quantity'))}
                                            {type === '(ml)' ? <> ml</> : ''}
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        Tổng sản phẩm mua bằng khuyến mãi: <strong style={{ color: '#1DA57A' }}>
                                            chưa có api
                                            {/* {AppConsts.formatNumber()} */}
                                            {type === '(ml)' ? <> ml</> : ''}
                                        </strong>
                                    </span>
                                </Col>
                                <Col
                                    {...cssColResponsiveSpan(24, 24, 24, 10, 10, 8)}
                                    style={{ border: '1px solid #e4e1e1', padding: 15 }}>
                                    <span>
                                        Tổng doanh thu sản phẩm mua bằng tiền mặt: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(
                                                listBillingOfDrinkProduct
                                                    .reduce(
                                                        (sum, StatisticBillingOfProductDto) =>
                                                            sum + (StatisticBillingOfProductDto.cash || 0),
                                                        0
                                                    )
                                            )}
                                            đ
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        Tổng doanh thu sản phẩm mua bằng ngân hàng: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(
                                                listBillingOfDrinkProduct.reduce(
                                                    (sum, StatisticBillingOfProductDto) =>
                                                        sum + (StatisticBillingOfProductDto.moneyQr || 0),
                                                    0
                                                )
                                            )}
                                            đ
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        Tổng doanh thu sản phẩm mua bằng RFID: <strong style={{ color: '#1DA57A' }}>
                                            {AppConsts.formatNumber(
                                                listBillingOfDrinkProduct
                                                    .reduce(
                                                        (sum, StatisticBillingOfProductDto) =>
                                                            sum + (StatisticBillingOfProductDto.moneyRFID || 0),
                                                        0
                                                    )
                                            )}
                                            đ
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        Tổng doanh thu sản phẩm mua bằng khuyến mãi: <strong style={{ color: '#1DA57A' }}>
                                            {/* {AppConsts.formatNumber(
                                                listBillingOfDrinkProduct
                                                    .reduce(
                                                        (sum, StatisticBillingOfProductDto) =>
                                                            sum + (StatisticBillingOfProductDto.moneyRFID || 0),
                                                        0
                                                    )
                                            )}
                                            đ */}
                                            chưa có api
                                        </strong>
                                    </span>
                                </Col>
                            </Row>
                        )
                    }
                />
            </>
        );
    }
}
