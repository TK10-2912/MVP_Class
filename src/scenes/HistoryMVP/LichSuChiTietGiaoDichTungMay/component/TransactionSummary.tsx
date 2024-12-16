import React from 'react';
import { Row, Col, Popover, Space, Tooltip } from 'antd';
import { TransactionByMachineDto } from '@src/services/services_autogen';
import { QuestionCircleTwoTone } from '@ant-design/icons';

interface TransactionSummaryProps {
    listTransactionByMachine: TransactionByMachineDto[];
    parent?: string;
    is_printed?: boolean;
    calculateTotalSuccess: (item: TransactionByMachineDto) => number;
}

interface SummaryItemProps {
    label: string;
    value: string | number;
    isNegative?: boolean;
}
interface TitleConfig {
    text: string;
    color: string;
}

const TITLE_CONFIGS: Record<string, TitleConfig> = {
    Tổng: { text: 'Tổng', color: 'black' }, // Green
    '1.Tiền mặt': { text: '1.Tiền mặt', color: '#1890ff' }, // Blue
    '2.Ngân hàng': { text: '2.Ngân hàng', color: '#722ed1' }, // Purple
    '3.RFID': { text: '3.RFID', color: '#fa8c16' }, // Orange
    '4.Khuyến mãi': { text: '4.Khuyến mãi', color: '#1DA57A' },
};

const SummaryItem: React.FC<SummaryItemProps> = ({ label, value, isNegative }) => (
    <span>
        {label}{' '}
        <strong style={{ color: isNegative ? 'red' : '#1DA57A' }}>
            {value} {typeof value === 'number' ? '' : 'đ'}
        </strong>
    </span>
);

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
    listTransactionByMachine,
    parent,
    is_printed,
    calculateTotalSuccess,
}) => {
    // if (is_printed) return null;

    const getCurrentPageData = () => {
        // const startIndex = (currentPage - 1) * pageSize;
        // const endIndex = currentPage * pageSize;
        // return listTransactionByMachine.slice(startIndex, endIndex);
        return listTransactionByMachine
    };

    const calculateSummary = (data: TransactionByMachineDto[], paymentType?: number) => {
        const filteredData =
            paymentType !== undefined
                ? data.filter((item) => item.hinh_thuc_thanh_toan === paymentType)
                : data;

        const successfulTransactions = filteredData.filter(
            (item) => item.trang_thai_tra_hang === 2 || item.trang_thai_tra_hang === 3
        );

        return {
            orderCount: filteredData.length!,
            orderAmount: filteredData.reduce((sum, item) => sum + (item.so_tien_thanh_toan || 0), 0),
            depositAmount: filteredData.reduce(
                (sum, item) =>
                    sum +
                    (paymentType === 0
                        ? item.so_tien_nap_vao_cash || 0
                        : paymentType === 1
                            ? item.so_tien_nap_vao_qr || 0
                            : paymentType === 2
                                ? item.so_tien_nap_vao_rfid || 0
                                : (item.so_tien_nap_vao_cash || 0) +
                                (item.so_tien_nap_vao_qr || 0) +
                                (item.so_tien_nap_vao_rfid || 0)),
                0
            ),
            successAmount: successfulTransactions.reduce(
                (sum, item) => sum + calculateTotalSuccess(item),
                0
            ),
            remainingAmount: filteredData.reduce((sum, item) => sum + (item.so_tien_du || 0), 0),
            refundAmount: filteredData.reduce((sum, item) => sum + (item.totalMoneyRefund || 0), 0),
        };
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const renderSummarySection = (title: string, data: ReturnType<typeof calculateSummary>) => (
        <Col span={title == "Tổng" ? 4 : 5} style={{ border: '1px solid #e4e1e1', padding: 15 }}>
            {title && (
                <div
                    className="font-bold mb-2"
                    style={{
                        color: is_printed ? '' : TITLE_CONFIGS[title]?.color || '#1DA57A',
                        fontSize: '16px',
                        // borderBottom: `2px solid ${TITLE_CONFIGS[title]?.color || '#1DA57A'}`,
                        // paddingBottom: '4px',
                        // marginBottom: '12px'
                    }}
                >
                    {title}
                    {title == "Tổng" &&
                        <Popover

                            trigger="hover"
                            placement="bottom"
                            content={
                                <Space direction='vertical'>
                                    <span>{"Tổng = (1+2+3+4)"}</span>
                                </Space>
                            }
                        >
                            <QuestionCircleTwoTone style={{ marginLeft: "10px" }} />
                        </Popover>}
                </div>
            )}
            <div>
                {title == "Tổng" ?
                    <Tooltip
                        placement="leftTop"
                        style={{ padding: 0, margin: 0 }}
                        title={(
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Tiền mặt: <b>{calculateSummary(currentPageData, 0).orderCount || 0}</b></li>
                                <li>Ngân hàng: <b>{calculateSummary(currentPageData, 1).orderCount || 0}</b></li>
                                <li>RFID: <b>{calculateSummary(currentPageData, 2).orderCount || 0}</b></li>
                                <li>Khuyến mãi: <b>{calculateSummary(currentPageData, 5).orderCount || 0}</b></li>
                            </ul>
                        )}
                        color="#20C997"
                        key="cyan"
                    >
                        <div style={{ margin: 0 }}>
                            <SummaryItem label="Đơn hàng:" value={data.orderCount || 0} />
                        </div>
                    </Tooltip> :
                    <div style={{ margin: 0 }}>
                        <SummaryItem label="Đơn hàng:" value={data.orderCount || 0} />
                        <br />
                    </div>
                }
                {title == "Tổng" ?
                    <Tooltip
                        placement="leftTop"
                        style={{ padding: 0, margin: 0 }}
                        title={(
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Tiền mặt: <b>{formatNumber(calculateSummary(currentPageData, 0).orderAmount || 0)} đ</b></li>
                                <li>Ngân hàng: <b>{formatNumber(calculateSummary(currentPageData, 1).orderAmount || 0)} đ</b></li>
                                <li>RFID: <b>{formatNumber(calculateSummary(currentPageData, 2).orderAmount || 0)} đ</b></li>
                                <li>Khuyến mãi: <b>{formatNumber(calculateSummary(currentPageData, 5).orderAmount || 0)} đ</b></li>
                            </ul>
                        )}
                        color="#20C997"
                        key="cyan"
                    >
                        <div style={{ margin: 0 }}>
                            <SummaryItem label="Tiền đơn hàng:" value={formatNumber(data.orderAmount)} />
                        </div>
                    </Tooltip> :
                    <div style={{ margin: 0 }}>
                        <SummaryItem label="Tiền đơn hàng:" value={formatNumber(data.orderAmount)} />
                        <br />
                    </div>
                }
                {title != "Khuyến mãi" &&
                    title == "Tổng" ?
                    <Tooltip
                        placement="leftTop"
                        style={{ padding: 0, margin: 0 }}
                        title={(
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Tiền mặt: <b>{formatNumber(calculateSummary(currentPageData, 0).depositAmount || 0)} đ</b></li>
                                <li>Ngân hàng: <b>{formatNumber(calculateSummary(currentPageData, 1).depositAmount || 0)} đ</b></li>
                                <li>RFID: <b>{formatNumber(calculateSummary(currentPageData, 2).depositAmount || 0)} đ</b></li>
                                <li>Khuyến mãi: <b>{formatNumber(calculateSummary(currentPageData, 5).depositAmount || 0)} đ</b></li>
                            </ul>
                        )}
                        color="#20C997"
                        key="cyan"
                    >
                        <div style={{ margin: 0 }}>
                            <SummaryItem label="Tổng tiền nạp vào:" value={formatNumber(data.depositAmount)} />
                        </div>
                    </Tooltip> :
                    <div style={{ margin: 0 }}>
                        <SummaryItem label="Tổng tiền nạp vào:" value={formatNumber(data.depositAmount)} />
                        <br />
                    </div>
                }
                {title != "Khuyến mãi" &&
                    title == "Tổng" ?
                    <Tooltip
                        placement="leftTop"
                        style={{ padding: 0, margin: 0 }}
                        title={(
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Tiền mặt: <b>{formatNumber(calculateSummary(currentPageData, 0).successAmount || 0)} đ</b></li>
                                <li>Ngân hàng: <b>{formatNumber(calculateSummary(currentPageData, 1).successAmount || 0)} đ</b></li>
                                <li>RFID: <b>{formatNumber(calculateSummary(currentPageData, 2).successAmount || 0)} đ</b></li>
                                <li>Khuyến mãi: <b>{formatNumber(calculateSummary(currentPageData, 5).successAmount || 0)} đ</b></li>
                            </ul>
                        )}
                        color="#20C997"
                        key="cyan"
                    >
                        <div style={{ margin: 0 }}>
                            <SummaryItem label={"Tổng tiền thành công:"} value={formatNumber(data.successAmount)} />
                        </div>
                    </Tooltip> :
                    <div style={{ margin: 0 }}>
                        <SummaryItem label={"Tổng tiền thành công:"} value={formatNumber(data.successAmount)} />
                        <br />
                    </div>
                }
                {title != "Khuyến mãi" &&
                    title == "Tổng" ?
                    <Tooltip
                        placement="leftTop"
                        style={{ padding: 0, margin: 0 }}
                        title={(
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Tiền mặt: <b>{formatNumber(calculateSummary(currentPageData, 0).remainingAmount || 0)} đ</b></li>
                                <li>Ngân hàng: <b>{formatNumber(calculateSummary(currentPageData, 1).remainingAmount || 0)} đ</b></li>
                                <li>RFID: <b>{formatNumber(calculateSummary(currentPageData, 2).remainingAmount || 0)} đ</b></li>
                                <li>Khuyến mãi: <b>{formatNumber(calculateSummary(currentPageData, 5).remainingAmount || 0)} đ</b></li>
                            </ul>
                        )}
                        color="#20C997"
                        key="cyan"
                    >
                        <div style={{ margin: 0 }}>
                            <SummaryItem
                                label="Số tiền dư:"
                                value={formatNumber(data.remainingAmount)}
                                isNegative={data.remainingAmount < 0}
                            />
                        </div>
                    </Tooltip> :
                    <div style={{ margin: 0 }}>
                        <SummaryItem
                            label="Số tiền dư:"
                            value={formatNumber(data.remainingAmount)}
                            isNegative={data.remainingAmount < 0}
                        />
                        <br />
                    </div>
                }
                {title != "Khuyến mãi" &&
                    title == "Tổng" ?
                    <Tooltip
                        placement="leftTop"
                        style={{ padding: 0, margin: 0 }}
                        title={(
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Tiền mặt: <b>{formatNumber(calculateSummary(currentPageData, 0).refundAmount || 0)} đ</b></li>
                                <li>Ngân hàng: <b>{formatNumber(calculateSummary(currentPageData, 1).refundAmount || 0)} đ</b></li>
                                <li>RFID: <b>{formatNumber(calculateSummary(currentPageData, 2).refundAmount || 0)} đ</b></li>
                                <li>Khuyến mãi: <b>{formatNumber(calculateSummary(currentPageData, 5).refundAmount || 0)} đ</b></li>
                            </ul>
                        )}
                        color="#20C997"
                        key="cyan"
                    >
                        <div style={{ margin: 0 }}>
                            <SummaryItem
                                label="Số tiền hoàn trả:"
                                value={formatNumber(data.refundAmount)}
                                isNegative={data.refundAmount < 0}
                            />
                        </div>
                    </Tooltip> :
                    <div style={{ margin: 0 }}>
                        <SummaryItem
                            label="Số tiền hoàn trả:"
                            value={formatNumber(data.refundAmount)}
                            isNegative={data.refundAmount < 0}
                        />
                        <br />
                    </div>

                }
            </div>
        </Col>
    );

    const currentPageData = getCurrentPageData();
    const totalSummary = calculateSummary(currentPageData);
    const cashSummary = calculateSummary(currentPageData, 0);
    const bankSummary = calculateSummary(currentPageData, 1);
    const rfidSummary = calculateSummary(currentPageData, 2);
    const couponSummary = calculateSummary(currentPageData, 5);

    return (
        <Row style={{ marginTop: '8px', fontSize: 14 }}>
            {renderSummarySection('Tổng', totalSummary)}
            {parent !== 'history' && (
                <>
                    {renderSummarySection('1.Tiền mặt', cashSummary)}
                    {renderSummarySection('2.Ngân hàng', bankSummary)}
                    {renderSummarySection('3.RFID', rfidSummary)}
                    {renderSummarySection('4.Khuyến mãi', couponSummary)}
                </>
            )}
        </Row>
    );
};

export default TransactionSummary;
