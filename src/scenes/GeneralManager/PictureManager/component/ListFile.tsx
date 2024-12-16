import * as React from 'react';
import { Card, Checkbox, Dropdown, Image, Menu } from 'antd';
import { AttachmentItem, ImageProductDto } from '@src/services/services_autogen';
import { DownloadOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import List from 'rc-virtual-list';

export const actionTable = {
    initDataFolder: 1,
    initDataFile: 2,
    onStarred: 3,
    onRenameModal: 4,
    onDelete: 5,
    onDoubleClickRow: 6,
    onDetailModal: 7,
    onMoveLocation: 8,
    onShareItem: 9,
    onChangeTypeFileOrFolder: 10,
    onDownload: 11,
};

export interface Iprops {
    filesInside: ImageProductDto[];
    fileSelected: ImageProductDto;
    onAction: (action: number, item?) => void;
    onSelectImage: (listItem: ImageProductDto[]) => void;
    handleScroll?: () => void;
}

export default class ListFile extends AppComponentBase<Iprops> {
    private divRef = React.createRef<any>();
    state = {
        isLoadDone: false,
        hoveredItem: null,
        selectedItems: [] as ImageProductDto[],
        itemHeight: 0,
    };
    attachmentItem: AttachmentItem = new AttachmentItem();
    listImage: ImageProductDto[] = [];
    imageSelect: ImageProductDto = new ImageProductDto();

    async componentDidMount() {
        await this.setState({ itemHeight: 190 / Math.floor(this.divRef.current.clientWidth / 140 + 1) });
    }

    onAction = async (action: number, item: ImageProductDto) => {
        if (this.props.onAction != undefined) {
            await this.props.onAction(action, item);
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    };

    handleSelectItem = (item: ImageProductDto) => {
        let selectedItems = [...this.state.selectedItems];
        if (selectedItems.some(i => i.im_pr_id === item.im_pr_id)) {
            selectedItems = selectedItems.filter(i => i.im_pr_id !== item.im_pr_id);
        } else {
            selectedItems.push(item);
        }
        this.setState({ selectedItems: selectedItems });
        this.props.onSelectImage(selectedItems);
    };

    handleSelectAll = () => {
        const allItems = this.props.filesInside;
        const selectedItems = this.state.selectedItems.length === allItems.length ? [] : allItems;
        this.setState({ selectedItems });
        this.props.onSelectImage(selectedItems);
    };

    render() {
        const { filesInside } = this.props;
        const menuClickRow = (
            <Menu>
                <Menu.Item key="Row_download" onClick={() => this.onAction(actionTable.onDownload, this.imageSelect)}>
                    <DownloadOutlined style={{ fontSize: '18px' }} /> Tải xuống
                </Menu.Item>
                <Menu.Item key="Row_change_name" onClick={() => this.onAction(actionTable.onRenameModal, this.imageSelect)}>
                    <EditOutlined style={{ fontSize: '18px' }} /> Đổi tên ảnh
                </Menu.Item>
            </Menu>
        );

        return (
            <div ref={this.divRef} className='image-product'>
                <Checkbox className='image-product-checkbox' onClick={this.handleSelectAll}>{this.state.selectedItems.length === filesInside.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</Checkbox>
                <List
                    className="image-product-list"
                    height={window.innerHeight}
                    itemHeight={this.state.itemHeight}
                    itemKey="im_pr_id"
                    data={filesInside}
                >
                    {(item) => (
                        <Card
                            key={`key__${item.im_pr_id}`}
                            onMouseEnter={() => (this.imageSelect = item)}
                            className={`cardHover card-image`}
                            style={{ height: 190, width: 140 }}
                            hoverable
                            cover={
                                <div className="card-image__image-cover">
                                    <Image title={item.im_pr_name} src={this.getImageProduct(item.im_pr_md5!)} alt={item.im_pr_name} />
                                </div>
                            }
                        >
                            <span
                                style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title={item.im_pr_name}
                            >
                                {item.im_pr_name}
                            </span>
                            <div
                                className={`card-image__actions ${this.state.selectedItems.some(i => i.im_pr_id === item.im_pr_id) && '--display-flex'}`}
                            >
                                <Checkbox
                                    className="card-image__check-box"
                                    checked={this.state.selectedItems.some(i => i.im_pr_id === item.im_pr_id)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.handleSelectItem(item);
                                    }}
                                />
                                <Dropdown overlay={menuClickRow} trigger={['hover']}>
                                    <MoreOutlined
                                        className="card-image__more-icon"
                                        onMouseEnter={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
                                            e.stopPropagation();
                                            this.onAction(actionTable.initDataFile, item);
                                        }}
                                    />
                                </Dropdown>
                            </div>
                        </Card>
                    )}
                </List>
            </div>
        );
    }
}
