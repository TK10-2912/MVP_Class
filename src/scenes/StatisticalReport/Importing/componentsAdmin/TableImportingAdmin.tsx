import * as React from 'react';
import AppConsts, { cssColResponsiveSpan, EventTable } from '@src/lib/appconst';
import { ImportingDto } from '@src/services/services_autogen';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { Button, Table, Space, Col, Row } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import { stores } from '@src/stores/storeInitializer';
import { Link } from 'react-router-dom';
import { isGranted } from '@src/lib/abpUtility';
import { SorterResult } from 'antd/lib/table/interface';
import { eMainBoard } from '@src/lib/enumconst';

export interface IProps {
    actionTable?: (item: ImportingDto, event: EventTable) => void;
    pagination: TablePaginationConfig | false;
    isLoadDone?: boolean;
    importingListResult: ImportingDto[];
    noScroll?: boolean;
    changeColumnSort?: (fieldSort: SorterResult<ImportingDto> | SorterResult<ImportingDto>[]) => void;
    isVisibleViewModal?: boolean;
}

export default class TableImportingAdmin extends React.Component<IProps> {
    state = {
        im_id_selected: undefined,
    };

    onAction = (item: ImportingDto, action: EventTable) => {
        this.setState({ im_id_selected: item.im_id });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    };
    isExist = (item: ImportingDto) => {
        return stores.sessionStore.getMainVendingMachineUseMaId(item.ma_id) != -1 &&
            stores.sessionStore.getMainVendingMachineUseMaId(item.ma_id) != eMainBoard.NONE.num;
    };
    isExistVer2 = (item: ImportingDto) => {
        return stores.sessionStore.getMainRefillMachineUseMaId(item.ma_id) !== -1 &&
            stores.sessionStore.getMainRefillMachineUseMaId(item.ma_id) !== eMainBoard.NONE.num;
    };
    render() {
        const { pagination, actionTable, importingListResult } = this.props;
        let action: ColumnGroupType<ImportingDto> = {
            title: 'Chức năng',
            key: 'action_importing_index',
            className: 'no-print',
            children: [],
            fixed: 'right',
            width: 50,
            render: (text: string, item: ImportingDto) => (
                <Space>
                    {isGranted(AppConsts.Permission.Pages_History_LichSuNhapHang_Detail) && (
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            title="Xem thông tin"
                            size="small"
                            onClick={() => this.onAction(item!, EventTable.View)}
                        ></Button>
                    )}
                </Space>
            ),
        };

        const columns: ColumnsType<ImportingDto> = [
            {
                title: 'STT',
                key: 'stt_machine_index',
                width: 50,
                fixed: !this.props.isVisibleViewModal && 'left',
                render: (text: string, item: ImportingDto, index: number) => (
                    <div>
                        {pagination != false
                            ? pagination.pageSize! * (pagination.current! - 1) + (index + 1)
                            : index + 1}
                    </div>
                ),
            },
            {
                title: 'Nhập lúc',
                width: 70,
                dataIndex: 'im_created_at',
                key: 'im_created_at',
                sorter: true,
                fixed: !this.props.isVisibleViewModal && 'left',
                render: (text: string, item: ImportingDto, index: number) => (
                    <div>{moment(item.im_created_at).format('DD/MM/YYYY HH:mm:ss')}</div>
                ),
            },
            {
                title: 'Đợt nhập thứ',
                dataIndex: '',
                key: 'ma_code',
                width: 70,
                fixed: !this.props.isVisibleViewModal && 'left',
                render: (text: string, item: ImportingDto, index: number) => (
                    <div>
                        {!!item.im_period
                            ? item.im_period.match(/Đợt nhập lần (\d+)/)
                                ? item.im_period.match(/Đợt nhập lần (\d+)/)![1]
                                : ''
                            : ''}
                    </div>
                ),
            },
            {
                title: 'Nhóm máy',
                key: 'ma_name',
                width: 100,
                render: (text: string, item: ImportingDto) => (
                    <div
                    // style={{ width: '80px' }}
                    >
                        {this.props.actionTable != undefined ? (
                            <div title="Chi tiết nhóm máy">
                                <Link
                                    target="_blank"
                                    to={
                                        '/general/machine/?gr_id=' + stores.sessionStore.getIDGroupUseMaId(item.ma_id)
                                    }
                                    onDoubleClick={() => this.onAction(item, EventTable.View)}
                                >
                                    {stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}
                                </Link>
                            </div>
                        ) : (
                            <div>{stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}</div>
                        )}
                    </div>
                ),
            },
            {
                title: 'Máy bán nước',
                key: 'ma_name',
                width: 150,
                render: (text: string, item: ImportingDto) => (
                    <div
                        style={
                            this.props.noScroll
                                ? {}
                                : {
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }
                        }
                    >
                        {this.props.actionTable != undefined ? (
                            <div title={`Chi tiết máy ${stores.sessionStore.getNameMachines(item.ma_id)}`}>
                                <Link
                                    target="blank"
                                    to={
                                        '/general/machine/?machine=' + stores.sessionStore.getCodeMachines(item.ma_id)
                                    }
                                    onDoubleClick={() => this.onAction(item, EventTable.View)}
                                >
                                    <div>
                                        <div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
                                        <div style={{
                                            color: "gray",
                                            fontSize: "11",
                                        }}>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div>
                                <div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
                                <div>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
                            </div>
                        )}
                    </div>
                ),
            },
            {
                title: 'Người vận hành',
                dataIndex: '',
                key: 'ma_code',
                width: 100,
                render: (text: string, item: ImportingDto, index: number) => (
                    <div>{stores.sessionStore.getUserNameById(item.us_id_operator)}</div>
                ),
            },
            {
                title: 'Sản phẩm có bao bì',
                key: 'ma_name',
                width: 255,
                children: [
                    {
                        title: 'Tổng trước nhập',
                        width: 100,
                        key: 'ma_money1',
                        sorter: (a: ImportingDto, b: ImportingDto) => {
                            let totalA = -Infinity;
                            if (this.isExist(a)) {
                                totalA = a.importingDetails?.reduce((total, e) => {
                                    return e.im_de_type == 0 && e.im_de_product_type == 0
                                        ? total + e.im_de_quantity
                                        : total;
                                }, 0) || 0;
                            }
                            let totalB = -Infinity;
                            if (this.isExist(b)) {
                                totalB = b.importingDetails?.reduce((total, e) => {
                                    return e.im_de_type == 0 && e.im_de_product_type == 0
                                        ? total + e.im_de_quantity
                                        : total;
                                }, 0) || 0;
                            }
                            return totalA - totalB;
                        },

                        render: (text: string, item: ImportingDto) => {
                            const total = item.importingDetails?.reduce((total, e) => {
                                if (e.im_de_type == 0 && e.im_de_product_type == 0) {
                                    return total + e.im_de_quantity;
                                }
                                return total;
                            }, 0);

                            return stores.sessionStore.getMainVendingMachineUseMaId(item.ma_id) != -1 &&
                                stores.sessionStore.getMainVendingMachineUseMaId(item.ma_id) !=
                                eMainBoard.NONE.num ? (
                                <div style={{ color: total! > 0 ? 'green' : total! < 0 ? 'red' : 'black' }}>
                                    {AppConsts.formatNumber(total)}
                                </div>
                            ) : (
                                ""
                            );
                        },
                    },
                    {
                        title: 'Tổng sau nhập',
                        width: 100,
                        key: 'ma_money2',
                        sorter: (a: ImportingDto, b: ImportingDto) => {
                            let totalA = -Infinity;
                            if (this.isExist(a)) {
                                totalA = a.importingDetails?.reduce((total, e) => {
                                    return e.im_de_type == 1 && e.im_de_product_type == 0
                                        ? total + e.im_de_quantity
                                        : total;
                                }, 0) || 0;
                            }
                            let totalB = -Infinity;
                            if (this.isExist(b)) {
                                totalB = b.importingDetails?.reduce((total, e) => {
                                    return e.im_de_type == 1 && e.im_de_product_type == 0
                                        ? total + e.im_de_quantity
                                        : total;
                                }, 0) || 0;
                            }

                            return totalA - totalB;
                        },
                        render: (text: string, item: ImportingDto) => {
                            const total = item.importingDetails?.reduce((total, e) => {
                                if (e.im_de_type === 1 && e.im_de_product_type === 0) {
                                    return total + e.im_de_quantity;
                                }
                                return total;
                            }, 0);

                            return stores.sessionStore.getMainVendingMachineUseMaId(item.ma_id) !== -1 &&
                                stores.sessionStore.getMainVendingMachineUseMaId(item.ma_id) !==
                                eMainBoard.NONE.num ? (
                                <div style={{ color: total! > 0 ? 'green' : total! < 0 ? 'red' : 'black' }}>
                                    {AppConsts.formatNumber(total)}
                                </div>
                            ) : (
                                ''
                            );
                        },
                    },
                    {
                        title: 'Tổng đã nhập',
                        width: 100,
                        key: 'ma_money3',
                        sorter: (a: ImportingDto, b: ImportingDto) => {
                            let totalA = -Infinity;
                            if (this.isExist(a)) {
                                totalA = (a.im_total_drink || 0)
                            }
                            let totalB = -Infinity;
                            if (this.isExist(b)) {
                                totalB = (b.im_total_drink || 0)
                            }
                            return totalA - totalB;
                        },
                        render: (text: string, item: ImportingDto) => {
                            const total = item.im_total_drink;
                            return stores.sessionStore.getMainVendingMachineUseMaId(item.ma_id) !== -1 &&
                                stores.sessionStore.getMainVendingMachineUseMaId(item.ma_id) !==
                                eMainBoard.NONE.num ? (
                                <div style={{ color: total! > 0 ? 'green' : total! < 0 ? 'red' : 'black' }}>
                                    {AppConsts.formatNumber(total)}
                                </div>
                            ) : (
                                ''
                            );
                        },
                    },
                ],
            },
            {
                title: 'Sản phẩm không có bao bì',
                key: 'ma_name',
                children: [
                    {
                        title: 'Tổng trước nhập (ml)',
                        width: 100,
                        key: 'ma_money4',
                        sorter: (a: ImportingDto, b: ImportingDto) => {
                            let totalA = -Infinity;
                            if (this.isExistVer2(a)) {
                                totalA = a.importingDetails?.reduce((total, e) => {
                                    return e.im_de_type == 0 && e.im_de_product_type == 1
                                        ? total + e.im_de_quantity
                                        : total;
                                }, 0) || 0;
                            }

                            let totalB = -Infinity;
                            if (this.isExistVer2(b)) {
                                totalB = b.importingDetails?.reduce((total, e) => {
                                    return e.im_de_type == 0 && e.im_de_product_type == 1
                                        ? total + e.im_de_quantity
                                        : total;
                                }, 0) || 0;
                            }
                            return (totalA * 100) - (totalB * 100);
                        },
                        render: (text: string, item: ImportingDto) => {
                            const total =
                                item.importingDetails?.reduce((total, e) => {
                                    if (e.im_de_type === 0 && e.im_de_product_type === 1) {
                                        return total + e.im_de_quantity;
                                    }
                                    return total;
                                }, 0)! * 100;

                            return stores.sessionStore.getMainRefillMachineUseMaId(item.ma_id) !== -1 &&
                                stores.sessionStore.getMainRefillMachineUseMaId(item.ma_id) !==
                                eMainBoard.NONE.num ? (
                                <div style={{ color: total! > 0 ? 'green' : total! < 0 ? 'red' : 'black' }}>
                                    {AppConsts.formatNumber(total)}
                                </div>
                            ) : (
                                ''
                            );
                        },
                    },
                    {
                        title: 'Tổng sau nhập (ml)',
                        width: 100,
                        key: 'ma_money5',
                        sorter: (a: ImportingDto, b: ImportingDto) => {
                            let totalA = -Infinity;
                            if (this.isExistVer2(a)) {
                                totalA = a.importingDetails?.reduce((total, e) => {
                                    return e.im_de_type == 0 && e.im_de_product_type == 1
                                        ? total + e.im_de_quantity
                                        : total;
                                }, 0) || 0;
                            }

                            let totalB = -Infinity;
                            if (this.isExistVer2(b)) {
                                totalB = b.importingDetails?.reduce((total, e) => {
                                    return e.im_de_type == 0 && e.im_de_product_type == 1
                                        ? total + e.im_de_quantity
                                        : total;
                                }, 0) || 0;
                            }
                            return (totalA * 100) - (totalB * 100);
                        },
                        render: (text: string, item: ImportingDto) => {
                            const total =
                                item.importingDetails?.reduce((total, e) => {
                                    if (e.im_de_type === 1 && e.im_de_product_type === 1) {
                                        return total + e.im_de_quantity;
                                    }
                                    return total;
                                }, 0)! * 100;

                            return stores.sessionStore.getMainRefillMachineUseMaId(item.ma_id) !== -1 &&
                                stores.sessionStore.getMainRefillMachineUseMaId(item.ma_id) !==
                                eMainBoard.NONE.num ? (
                                <div style={{ color: total! > 0 ? 'green' : total! < 0 ? 'red' : 'black' }}>
                                    {AppConsts.formatNumber(total)}
                                </div>
                            ) : (
                                ''
                            );
                        },
                    },
                    {
                        title: 'Tổng đã nhập (ml)',
                        width: 100,
                        key: 'ma_money6',
                        sorter: (a: ImportingDto, b: ImportingDto) => {
                            const totalA = this.isExistVer2(a) ? (a.im_total_frdrink || 0) * 100 : -Infinity;
                            const totalB = this.isExistVer2(b) ? (b.im_total_frdrink || 0) * 100 : -Infinity;
                            return totalA - totalB;
                        },
                        render: (text: string, item: ImportingDto) => {
                            const total = item.im_total_frdrink * 100;
                            return stores.sessionStore.getMainRefillMachineUseMaId(item.ma_id) !== -1 &&
                                stores.sessionStore.getMainRefillMachineUseMaId(item.ma_id) !==
                                eMainBoard.NONE.num ? (
                                <div style={{ color: total! > 0 ? 'green' : total! < 0 ? 'red' : 'black' }}>
                                    {AppConsts.formatNumber(total)}
                                </div>
                            ) : (
                                ''
                            );
                        },
                    },
                ],
            },
        ];
        if (
            actionTable != undefined &&
            isGranted(AppConsts.Permission.Pages_History_LichSuNhapHang_Detail)
        ) {
            columns.push(action);
        }
        return (
            <Table
                onRow={(record, rowIndex) => {
                    return {
                        onDoubleClick: (event: any) => {
                            {
                                isGranted(AppConsts.Permission.Pages_History_LichSuNhapHang_Detail) &&
                                    this.onAction(record!, EventTable.RowDoubleClick);
                            }
                        },
                    };
                }}
                scroll={this.props.noScroll == true ? { x: undefined, y: undefined } : { x: 1700, y: 600 }}
                className="centerTable"
                columns={columns}
                size={'small'}
                bordered={true}
                dataSource={importingListResult.length > 0 ? importingListResult : []}
                pagination={this.props.pagination}
                rowClassName={(record) =>
                    this.state.im_id_selected === record.im_id ? 'bg-click' : 'bg-white'
                }
                rowKey={(record) => 'importing_table' + JSON.stringify(record)}
                onChange={(a, b, sort: SorterResult<ImportingDto> | SorterResult<ImportingDto>[]) => {
                    if (!!this.props.changeColumnSort) {
                        this.props.changeColumnSort(sort);
                    }
                }}
                footer={() => (
                    <Row style={{ fontSize: 14 }} id='TableImportingAdmin'>
                        <Col
                            {...cssColResponsiveSpan(24, 24, 12, 12, 12, 12)}
                            style={{ border: '1px solid #e4e1e1', }}
                        >
                            <span>
                                Tổng số máy đã nhập:{' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {new Set(importingListResult.map((ImportingDto) => ImportingDto.ma_id)).size}
                                </strong>
                            </span>
                            <br />
                            <span>
                                Tổng số lần nhập:{' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    <strong style={{ color: '#1DA57A' }}>{importingListResult.length!}</strong>
                                </strong>
                            </span>
                        </Col>
                        <Col
                            {...cssColResponsiveSpan(24, 24, 12, 12, 12, 12)}
                            style={{ border: '1px solid #e4e1e1', }}>
                            <span>
                                Tổng sản phẩm có bao bì đã nhập:{' '}
                                <strong
                                    style={{
                                        color:
                                            importingListResult.reduce(
                                                (sum, ImportingDto) => sum + (ImportingDto.im_total_drink || 0),
                                                0
                                            ) >= 0
                                                ? '#1DA57A'
                                                : 'red',
                                    }}
                                >
                                    {
                                        AppConsts.formatNumber(
                                            importingListResult.reduce(
                                                (sum, ImportingDto) => sum + (ImportingDto.im_total_drink || 0),
                                                0
                                            ))
                                    }
                                </strong>
                            </span>
                            <br />
                            <span>
                                Tổng sản phẩm không có bao bì đã nhập:{' '}
                                <strong
                                    style={{
                                        color:
                                            importingListResult.reduce(
                                                (sum, ImportingDto) => sum + (ImportingDto.im_total_frdrink * 100 || 0),
                                                0
                                            ) >= 0
                                                ? '#1DA57A'
                                                : 'red',
                                    }}
                                >
                                    {
                                        AppConsts.formatNumber(
                                            importingListResult.reduce(
                                                (sum, ImportingDto) => sum + (ImportingDto.im_total_frdrink * 100 || 0),
                                                0
                                            ))} ml

                                </strong>
                            </span>
                        </Col>
                    </Row>
                )}
            />
        );
    }
}
