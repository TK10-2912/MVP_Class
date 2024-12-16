import * as React from 'react';
import { Button, Checkbox, Image, Modal, Space, Tooltip } from 'antd';
import { ImageProductDto } from '@src/services/services_autogen';
import { DownloadOutlined, EditOutlined, FileImageTwoTone, FullscreenOutlined, } from '@ant-design/icons';
import moment from 'moment';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { actionTable } from './ListFile';
import { Column, Table, AutoSizer, SortDirection } from 'react-virtualized';
import 'react-virtualized/styles.css';
import './../style.css';
import { stores } from '@src/stores/storeInitializer';

export interface Iprops {
    filesInside: ImageProductDto[];
    fileSelected: ImageProductDto;
    onAction: (action: number, item: ImageProductDto) => void;
    onSelectImage: (listImage: ImageProductDto[]) => void;
    handleScroll?: () => void;
}
export default class TableViewImage extends AppComponentBase<Iprops> {
    state = {
        isLoadDone: false,
        visibleModalViewFile: false,
        isSelectAll: undefined,
        sortBy: 'im_pr_created_at',
        sortDirection: SortDirection.DESC,
    };
    listImageSelected: ImageProductDto[] = [];
    listIndexImageSelected: number[] = [];
    fileHover: ImageProductDto = new ImageProductDto();
    dataSource: ImageProductDto[] = this.props.filesInside.slice();

    async componentDidMount() {
        const { imageProductListResult } = stores.imageProductStore;
        this.dataSource = imageProductListResult;
        const { sortBy, sortDirection } = this.state;
        await this.handleSort({ sortBy, sortDirection });
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }


    onSelectAll = async (isChecked: boolean) => {
        this.setState({ isSelectAll: isChecked });
        const arrInput: any = document.getElementsByClassName('checkboxClassName');
        [...arrInput].map(input => input.checked = isChecked);
        this.listImageSelected = isChecked ? this.props.filesInside : [];
        this.listIndexImageSelected = isChecked ? Array.from({ length: this.props.filesInside.length }, (_, index) => index) : [];
        this.props.onSelectImage(this.listImageSelected);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onSelectImage = (isChecked: boolean, imageSelected: ImageProductDto, rowIndex: number) => {
        if (isChecked) {
            this.listImageSelected.push(imageSelected);
            this.listIndexImageSelected.push(rowIndex);
        }
        else {
            this.setState({ isSelectAll: false });
            this.listImageSelected = this.listImageSelected.filter(image => image !== imageSelected);
            this.listIndexImageSelected = this.listIndexImageSelected.filter(value => value !== rowIndex);
        }
        this.props.onSelectImage(this.listImageSelected);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    handleScrollTable = () => {
        const arrInput: any = document.getElementsByClassName('checkboxClassName');
        [...arrInput].map(item => {
            this.listIndexImageSelected.forEach(value => {
                if (value === +item.offsetParent.ariaRowIndex - 1) {
                    item.checked = true;
                }
            })
        })
    }

    onHoverFile = async (file: ImageProductDto) => {
        this.fileHover = file;
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onAction = async (action: number, item: ImageProductDto) => {
        if (this.props.onAction != undefined) {
            this.props.onAction(action, item);
        }
    }
    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }
    openImage = () => {
        this.setState({ visibleModalViewFile: true });
    }
    handleSort = ({ sortBy, sortDirection }) => {
        this.dataSource = this.sortList(sortBy, sortDirection);
        this.setState({ sortBy, sortDirection });
    };
    sortList = (sortBy, sortDirection) => {
        const { filesInside } = this.props;
        return filesInside.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            if (sortBy === 'im_pr_created_at') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            if (sortDirection === SortDirection.ASC) {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };
    render() {
        return (
            <div className='image-product-block1'>
                <div className="image-product-block2">
                    <AutoSizer>
                        {({ height, width }) => (
                            <Table
                                className='centerTable'
                                onScroll={this.handleScrollTable}
                                onRowMouseOver={(row) => this.onHoverFile(row.rowData)}
                                onRowDoubleClick={this.openImage}
                                width={width}
                                height={height}
                                headerHeight={45}
                                rowHeight={45}
                                rowCount={[...this.dataSource].length}
                                rowGetter={({ index }) => [...this.dataSource][index]}
                                sort={this.handleSort}
                                sortBy={this.state.sortBy}
                                sortDirection={this.state.sortDirection}
                            >
                                <Column
                                    disableSort
                                    className='cell-center'
                                    dataKey='stt'
                                    width={width / 10}
                                    label={<Checkbox onChange={(e) => this.onSelectAll(e.target.checked)} />}
                                    cellRenderer={({ rowData, rowIndex }) => (
                                        <input type="checkbox" className="checkboxClassName" onChange={(e) => this.onSelectImage(e.target.checked, rowData, rowIndex)} />
                                    )}
                                />
                                <Column disableSort width={width / 2} label="Ảnh" dataKey="im_pr_name"
                                    cellRenderer={({ cellData }) => (
                                        <div style={{ cursor: "pointer", display: 'flex', justifyContent: 'start' }}
                                            onClick={this.openImage}
                                            title={cellData}
                                        >
                                            <Space>
                                                <Tooltip
                                                    title={<img src={this.getImageProduct(this.fileHover.im_pr_md5!)} alt="Preview" style={{ width: 200, height: 'auto' }} />}
                                                    placement="top"
                                                    overlayStyle={{ zIndex: 1000 }}
                                                >
                                                    <FileImageTwoTone style={{ fontSize: 22 }} twoToneColor='#f5222d' />
                                                    {cellData}
                                                </Tooltip>
                                            </Space>
                                        </div>
                                    )}
                                />
                                <Column headerRenderer={() => <div title="Sắp xếp ">Kích thước <svg width={8} height={25} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150"><path d="M137.4 41.4c12.5-12.5 32.8-12.5 45.3 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9s-16.6 19.8-29.6 19.8L32 224c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9l128-128zm0 429.3l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8l256 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128c-12.5 12.5-32.8 12.5-45.3 0z" fill="#BDBDBD" /></svg></div>} className='cell-center' disableSort={false} width={width / 2} label="Kích thước" dataKey="im_pr_size"
                                    cellRenderer={({ cellData }) => (
                                        <>{AppConsts.convertResourceFile(Math.round(cellData / 1024 * 10) / 10)}</>
                                    )}
                                />
                                <Column headerRenderer={() => <div title="Sắp xếp">Thời gian tạo <svg width={8} height={25} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150"><path d="M137.4 41.4c12.5-12.5 32.8-12.5 45.3 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9s-16.6 19.8-29.6 19.8L32 224c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9l128-128zm0 429.3l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8l256 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128c-12.5 12.5-32.8 12.5-45.3 0z" fill="#BDBDBD" /></svg></div>} className='cell-center' width={width / 2} label="Thời gian tạo" dataKey="im_pr_created_at"
                                    cellRenderer={({ cellData }) => (
                                        <>{moment(cellData).format("DD/MM/YYYY HH:mm:ss")}</>
                                    )}
                                />
                                <Column disableSort className='cell-center' width={600} label="Chức năng" dataKey='action'
                                    cellRenderer={() => (
                                        <Space>
                                            <Button title='Mở' icon={<FullscreenOutlined />} size='small' onClick={() => this.openImage()}></Button>
                                            <Button title='Tải xuống' icon={<DownloadOutlined />} type='primary' size='small' onClick={() => this.onAction(actionTable.onDownload, this.fileHover)}></Button>
                                            <Button title='Đổi tên ảnh' icon={<EditOutlined />} type='primary' size='small' onClick={() => { this.onAction(actionTable.initDataFile, this.fileHover); this.onAction(actionTable.onRenameModal, this.fileHover) }}></Button>
                                        </Space>
                                    )}
                                />
                            </Table>
                        )}
                    </AutoSizer >
                    <Image
                        preview={{
                            visible: this.state.visibleModalViewFile,
                            onVisibleChange: (visible) => this.setState({ visibleModalViewFile: visible }),
                        }}
                        src={this.getImageProduct(this.fileHover.im_pr_md5!)}
                        style={{ display: 'none' }}
                    />
                    <Modal>

                    </Modal>
                </div>
            </div>
        )
    }
}