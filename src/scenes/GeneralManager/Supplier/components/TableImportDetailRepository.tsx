import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { ImportRepositoryDto } from '@src/services/services_autogen';
import { Modal, Table, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import DetailInfomationImportRepositorySupplier from './ModalDetailInfomationImportRepository';

export interface IProps {
    su_id: number;
}
export default class TableImportDetailRepositorySupplier extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        pr_id_selected: undefined,
        listIdProduct: 0,
        visibleModal: false,
        pageSize: 10,
        currentPage: 1,
    };
    listProduct: ImportRepositoryDto[] = [];
    importRepostitorySelected: ImportRepositoryDto = new ImportRepositoryDto();
    componentDidMount() {
        this.initData(this.props.su_id!);
    }
    initData = (su_id: number) => {
        this.setState({ isLoadDone: false });
        const { importRepositoryListResult } = stores.importRepositoryStore;
        this.listProduct = importRepositoryListResult.filter((item) => item.su_id === su_id);
        this.setState({ isLoadDone: true });
    };
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            // this.getAll();
        });
    };
    render() {
        const { } = this.props;
        const self = this;
        const columns: ColumnsType<ImportRepositoryDto> = [
            {
                title: 'STT',
                key: 'stt_fresh_drink_index',
                width: 50,
                render: (text: string, item: ImportRepositoryDto, index: number) => <div>{index + 1}</div>,
            },
            {
                title: 'Mã phiếu nhập',
                key: 'im_re_code',
                render: (text: string, item: ImportRepositoryDto) => <div> {item.im_re_code} </div>,
            },
            {
                title: 'Nhà cung cấp',
                key: 'su_id',
                render: (text: string, item: ImportRepositoryDto) => (
                    <div>{stores.sessionStore.getNameSupplier(item.su_id)}</div>
                ),
            },
            {
                title: 'Tổng số sản phẩm',
                sorter: (a, b) => a.listProductImport!.length - b.listProductImport!.length,
                key: 'im_re_code',
                render: (text: string, item: ImportRepositoryDto) => (
                    <div> {item.listProductImport?.length} </div>
                ),
            },
            {
                title: 'Tổng số lượng',
                sorter: (a, b) =>
                    a.listProductImport!.reduce(
                        (total, currenttotal) => total + currenttotal.pr_im_quantity,
                        0
                    ) -
                    b.listProductImport!.reduce(
                        (total, currenttotal) => total + currenttotal.pr_im_quantity,
                        0
                    ),
                key: 'im_re_code',
                render: (text: string, item: ImportRepositoryDto) => (
                    <div>
                        {' '}
                        {AppConsts.formatNumber(
                            item.listProductImport?.reduce(
                                (total, currenttotal) => total + currenttotal.pr_im_quantity,
                                0
                            )
                        )}{' '}
                    </div>
                ),
            },
            {
                title: 'Tổng tiền hàng',
                sorter: (a, b) =>
                    a.listProductImport!.reduce(
                        (total, currenttotal) => total + currenttotal.pr_im_total_money,
                        0
                    ) -
                    b.listProductImport!.reduce(
                        (total, currenttotal) => total + currenttotal.pr_im_total_money,
                        0
                    ),
                key: 'im_re_code',
                render: (text: string, item: ImportRepositoryDto) => (
                    <div>
                        {' '}
                        {AppConsts.formatNumber(
                            item.listProductImport?.reduce(
                                (total, currenttotal) => total + currenttotal.pr_im_total_money,
                                0
                            )
                        )}{' '}
                    </div>
                ),
            },
            {
                title: 'Trạng thái nhập hàng',
                key: 'im_re_status',
                dataIndex: 'im_re_status',
                render: (text: string, item: ImportRepositoryDto) =>
                    item.im_re_status ? (
                        <Tag color="success">Đã nhập kho</Tag>
                    ) : (
                        <Tag color="processing">Phiếu tạm</Tag>
                    ),
            },
            {
                title: 'Thời gian tạo phiếu ',
                key: 'im_re_imported_at',
                sorter: (a: ImportRepositoryDto, b: ImportRepositoryDto) => {
                    return moment(a.im_re_created_at).unix() - moment(b.im_re_created_at).unix();
                },
                render: (text: string, item: ImportRepositoryDto) => (
                    <div>{moment(item.im_re_created_at).format('DD/MM/YYYY HH:mm')}</div>
                ),
            },
            {
                title: 'Thời gian nhập hàng',
                key: 'im_re_imported_at',
                sorter: (a: ImportRepositoryDto, b: ImportRepositoryDto) => {
                    return moment(a.im_re_imported_at).unix() - moment(b.im_re_imported_at).unix();
                },
                render: (text: string, item: ImportRepositoryDto) => (
                    <div>{moment(item.im_re_imported_at).format('DD/MM/YYYY HH:mm')}</div>
                ),
            },
        ];
        return (
            <>
                <Table
                    className="centerTable customTable"
                    scroll={{ x: 1200, y: 600 }}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: (event: any) => {
                                this.setState({ visibleModal: true });
                                this.importRepostitorySelected.init(record);
                            },
                        };
                    }}
                    columns={columns}
                    size={'small'}
                    bordered={true}
                    
                    dataSource={this.listProduct}
                    rowKey={(record) => record.im_re_id}
                    pagination={{
                        position: ['topRight'],
                        pageSize: this.state.pageSize,
                        total: stores.importingStore.importingListResult.length,
                        current: this.state.currentPage,
                        showTotal: (tot) => 'Tổng' + ': ' + tot + '',
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onShowSizeChange(current: number, size: number) {
                            self.onChangePage(current, size);
                        },
                        onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize),
                    }}
                />
                <Modal
                    width={'80%'}
                    visible={this.state.visibleModal}
                    footer={false}
                    title={
                        <b>
                            {'Chi tiết phiếu nhập ' +
                                this.importRepostitorySelected.im_re_code +
                                ' của nhà cung cấp ' +
                                `${stores.sessionStore.getNameSupplier(this.props.su_id)}`}
                        </b>
                    }
                    maskClosable={false}
                    onCancel={() => this.setState({ visibleModal: false })}
                >
                    <DetailInfomationImportRepositorySupplier
                        importRepostitorySelected={this.importRepostitorySelected}
                        listProductImport={this.importRepostitorySelected.listProductImport}
                    />
                </Modal>
            </>
        );
    }
}
