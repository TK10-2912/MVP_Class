import * as React from 'react';
import { Col, Image, Modal, Result, Row, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AttachmentItem, MachineOutOfStockQueryDto, ProductDailyMonitoringDto, RepositoryDetails } from '@src/services/services_autogen';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { TableRowSelection } from 'antd/lib/table/interface';
import { stores } from '@src/stores/storeInitializer';
import { isGranted } from '@src/lib/abpUtility';
import FileAttachments from '@src/components/FileAttachments';

export interface Iprops {
    productList: ProductDailyMonitoringDto[];
    is_printed?: boolean;
    ma_id?: number;
    export?: boolean;
    us_id?: number;
    getNameProductNotEnough?: (nameList: string[]) => void;
    rowSelection?: TableRowSelection<ProductDailyMonitoringDto>
    titleModalDetail?: string;
}

export default class DetailProductOfMachine extends React.Component<Iprops> {
    static dictionary: { [key: number]: ProductDailyMonitoringDto[] }[] = [];
    state = {
        isLoadDone: false,
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
        nameSelected: "",
        visibleModalImage: false,
    };
    listNameProductNotEnough: string[] = [];
    listMaid: number[] = [];
    dictionary: { [key: number]: ProductDailyMonitoringDto[] }[] = [];
    fileActtachment: AttachmentItem = new AttachmentItem();
    getNameProductNotEnough = (nameList: string[]) => {
        if (!!this.props.getNameProductNotEnough) {
            this.props.getNameProductNotEnough(nameList);
        }
    }
    getStatus = (item: ProductDailyMonitoringDto) => {
        const { machineListResult } = stores.machineStore;
        const quantityProduct = item.pr_quantityInRepository;
        const machine = machineListResult.find(item => item.ma_id == this.props.ma_id);
        if (machine != undefined && quantityProduct != undefined) {
            if (quantityProduct > 0 && (item.ma_de_max - item.pr_quantityInMachine) > 0 && quantityProduct >= (item.ma_de_max - item.pr_quantityInMachine)) {
                return <Tag color='success'>Còn hàng</Tag>
            }
            else if (quantityProduct == 0) {
                return <Tag color='error'>Hết hàng</Tag>
            }
            else if (item.ma_de_max - item.pr_quantityInMachine == 0) {
                return <Tag color='cyan'>Khay đã đủ</Tag>
            }
            else {
                return <Tag color='warning'>Không đủ hàng</Tag>
            }
        }
        else {
            return <Tag color='magenta'>Sản phẩm chưa nhập vào kho</Tag>
        }
    }
    getStatusPrint = (item: ProductDailyMonitoringDto) => {
        const { machineListResult } = stores.machineStore;
        const quantityProduct = item.pr_quantityInRepository;
        const machine = machineListResult.find(item => item.ma_id == this.props.ma_id);
        if (machine != undefined && quantityProduct != undefined) {
            if (quantityProduct > 0 && (item.ma_de_max - item.pr_quantityInMachine) > 0 && quantityProduct >= (item.ma_de_max - item.pr_quantityInMachine)) {
                return <div>Còn hàng</div>
            }
            else if (quantityProduct == 0) {
                return <div>Hết hàng</div>
            }
            else if (item.ma_de_max - item.pr_quantityInMachine == 0) {
                return <div>Khay đã đủ</div>
            }
            else {
                return <div>Không đủ hàng</div>
            }
        }
        else {
            return <div>Sản phẩm chưa nhập vào kho</div>
        }
    }
    handleRowSelection = async (listItemProduct: React.Key[], listItem: ProductDailyMonitoringDto[]) => {
        this.setState({ isLoadDone: false });
        const key = this.props.ma_id!;
        const index = DetailProductOfMachine.dictionary.findIndex(item => item.hasOwnProperty(key));
        const listProducEnough = listItem.filter(item => item.pr_quantityInRepository > 0);
        if (index !== -1) {
            if (listProducEnough.length === 0) {
                DetailProductOfMachine.dictionary.splice(index, 1);
            } else {
                DetailProductOfMachine.dictionary[index][key] = listProducEnough;
            }
        } else {
            DetailProductOfMachine.dictionary.push({ [key]: listProducEnough });
        }
        const prNameNotEnough = listItem.filter(item => item.pr_quantityInRepository! <= 0)
        this.listNameProductNotEnough = prNameNotEnough.map(item => item.pr_name!);
        this.listNameProductNotEnough = Array.from(new Set(this.listNameProductNotEnough));
        this.getNameProductNotEnough(this.listNameProductNotEnough)
        this.setState({ isLoadDone: true });
    }
    getImageProduct(md5: string) {
        let fi_md5_modified = encodeURI(md5);
        return AppConsts.remoteServiceBaseUrl + "download/imageProduct?path=" + fi_md5_modified;
    }
    render() {
        const { productList } = this.props;
        const self = this;
        const rowSelection: TableRowSelection<ProductDailyMonitoringDto> = {
            onChange: this.handleRowSelection
        };

        const columns: ColumnsType<ProductDailyMonitoringDto> = [
            {
                title: "STT", key: "stt_machine_index", width: 50, fixed: 'left',
                render: (_: string, __: ProductDailyMonitoringDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div>,
            },
            {
                title: "Tên sản phẩm",
                key: "stt_machine_index",
                onCell: (item) => ({
                    onClick: () => {
                        this.fileActtachment = stores.sessionStore.getImageProduct(item.pr_name!);
                        this.setState({ visibleModalImage: true });
                    }
                }),
                render: (_: string, item: ProductDailyMonitoringDto) => (
                    <div style={{ color: "#1da57a", cursor: "pointer" }} title='Xem ảnh sản phẩm'>
                        {item.pr_name}
                    </div>
                ),
            },
            {
                title: "Vị trí khay", key: "stt_machine_index",
                render: (_: string, item: ProductDailyMonitoringDto) => <div>{item.pr_slot_id + 1}</div>
            },
            {
                title: "Giá sản phẩm", key: "stt_machine_index",
                render: (_: string, item: ProductDailyMonitoringDto) => <div>{AppConsts.formatNumber(item.pr_price)}</div>
            },
            {
                title: "Số lượng/Dung tích tối đa trong khay",
                sorter: (a, b) => a.ma_de_max - b.ma_de_max,
                render: (_: string, item: ProductDailyMonitoringDto) => <div>{AppConsts.formatNumber(item.ma_de_max)}</div>
            },
            {
                title: "Số lượng/Dung tích trong máy",
                sorter: (a, b) => a.pr_quantityInMachine - b.pr_quantityInMachine,
                render: (_: string, item: ProductDailyMonitoringDto) => <div>{AppConsts.formatNumber(item.pr_quantityInMachine)}</div>
            },
            {
                title: "Số lượng/Dung tích cần nạp",
                sorter: (a, b) => a.ma_de_max - a.pr_quantityInMachine - b.ma_de_max + b.pr_quantityInMachine,
                render: (_: string, item: ProductDailyMonitoringDto) => <div>{AppConsts.formatNumber(item.ma_de_max - item.pr_quantityInMachine)}</div>
            },
            {
                title: "Số lượng trong kho",
                sorter: (a, b) => a.pr_quantityInRepository - b.pr_quantityInRepository,
                render: (_: string, item: ProductDailyMonitoringDto) => <div>{AppConsts.formatNumber(item.pr_quantityInRepository)}</div>
            },
            {
                title: "Trạng thái trong kho",
                render: (_: string, item: ProductDailyMonitoringDto) => <div>
                    {this.props.is_printed == true ? this.getStatusPrint(item) : this.getStatus(item)}
                </div>
            },
        ];

        return (
            <>
                <Table
                    className='centerTable'
                    rowKey={record => "product_index__" + record.pr_name + record.pr_slot_id}
                    size={'small'}
                    bordered={true}
                    
                    columns={columns}
                    rowSelection={this.props.is_printed != undefined && this.props.is_printed == false ? rowSelection : undefined}
                    dataSource={productList || []}
                    pagination={this.props.is_printed ? false : {
                        total: productList.length,
                        showTotal: (tot) => ("Tổng: ") + tot + "",
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onChange(page, pageSize) {
                            self.setState({ pageSize: pageSize, currentPage: page })
                        }
                    }}
                    footer={() => (
                        <Row>
                            <Col span={8}>
                                <span>{!!this.props.titleModalDetail ? this.props.titleModalDetail : "Tổng số sản phẩm"}: <strong>{AppConsts.formatNumber(productList.reduce((total, record) =>
                                    total + (record.ma_de_max), 0))}</strong>
                                </span>
                            </Col>
                            <Col span={8}>
                                <span>Tổng số sản phẩm trong máy: <strong style={{ color: '#1DA57A' }}>{productList.length}</strong>
                                </span>
                            </Col>
                            <Col span={8}>
                                <span>Tổng sản phẩm cần nạp: <strong style={{ color: 'red' }}>{AppConsts.formatNumber(productList.reduce((total, record) =>
                                    total + (record.ma_de_max - record.pr_quantityInMachine), 0))}</strong>
                                </span>
                            </Col>
                        </Row>
                    )}
                />
                <Image
                    preview={{
                        visible: this.state.visibleModalImage,
                        onVisibleChange: (visible) => this.setState({ visibleModalImage: visible }),
                    }}
                    src={this.getImageProduct(this.fileActtachment.md5!)}
                    style={{ display: 'none' }}
                />



            </>

        );
    }
}
