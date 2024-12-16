import { AttachmentItem, HandoverDto } from '@src/services/services_autogen';
import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Carousel, Col, Form, Input, Row, Space, Tag, Tree } from 'antd';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import { eHandoverStatus, eHandoverType, } from '@src/lib/enumconst';
import { EditOutlined } from '@ant-design/icons';
import TableProductRepositoryDetail from './TableProductRepositoryDetail';
import { ListProductHandOver } from './CreateHandover';


export interface IProps {
    openUpdateHandover?: (item: HandoverDto) => void;
    onCancel?: () => void;
    handoverSelected: HandoverDto;
}
const { TreeNode } = Tree;
const { Search } = Input;
export default class DetailInfomationHandOver extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        listProduct: [] as ListProductHandOver[],
        selectedValues: [],
        expandedKeys: [],
        autoExpandParent: true,
        searchValue: '',

    }
    carouselRef: any = React.createRef();
    handoverSelected: HandoverDto;
    async componentDidMount() {
        this.setState({ isLoadDone: false });
        this.handoverSelected = this.props.handoverSelected.clone();
        if (!!this.handoverSelected) {
            let listProductRepository = stores.sessionStore.getAllProductInRepository(-2);
            let listProductHandover = this.handoverSelected.productHandoverInputs;
            let listProduct: ListProductHandOver[] = [];
            listProductRepository.forEach(item => {
                const foundItem = listProductHandover?.find(itemHandover => itemHandover.pr_id === item.pr_id);
                const isAlreadyAdded = listProduct.some(product => product.pr_id === item.pr_id);
                if (foundItem && !isAlreadyAdded) {
                    let x = new ListProductHandOver(
                        item.pr_id,
                        item.pr_name,
                        foundItem.pr_quantity,
                        item.fi_id,
                        item.pr_quantity,
                        item.pr_unit
                    );
                    listProduct.push(x);
                }
            });
            this.setState({ listProduct: listProduct })
        }
        if (!!this.handoverSelected.ma_id_list && this.handoverSelected.ma_id_list.length > 0) {
            this.setState({ selectedValues: this.handoverSelected.ma_id_list.map(String) });
        }
        this.setState({ isLoadDone: true });
    }
    openUpdateHandover = (item: HandoverDto) => {
        if (!!this.props.openUpdateHandover) {
            this.props.openUpdateHandover(item!);
        }
    }
    handlePrev = () => {
        this.carouselRef.current.prev();
    };

    handleNext = () => {
        this.carouselRef.current.next();
    };
    renderTreeNodes = data =>
        data.map(item => {
            const index = item.title?.toLowerCase().indexOf(this.state.searchValue.toLowerCase());
            const beforeStr = item.title?.substr(0, index);
            const afterStr = item.title?.substr(index + this.state.searchValue.length);
            const title =
                index > -1 ? (
                    <span>
                        {beforeStr}
                        <span style={{ color: '#f50' }}>{this.state.searchValue}</span>
                        {afterStr}
                    </span>
                ) : (
                    <span>{item.title}</span>
                );
            const containsSearchValue = this.findInTree(item, this.state.searchValue);
            if (!containsSearchValue) {
                return null;
            }
            if (item.children) {
                return (
                    <TreeNode title={title} key={item.key} >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode {...item} title={title} key={item.key} />;
        });
    findInTree = (node, searchValue) => {
        if (node.title?.toLowerCase().includes(searchValue?.toLowerCase())) {
            return true;
        }
        if (node.children) {
            for (let child of node.children) {
                if (this.findInTree(child, searchValue)) {
                    return true;
                }
            }
        }
        return false;
    };
    render() {
        return (
            <Card>
                <Form labelCol={{ ...cssColResponsiveSpan(24, 24, 12, 12, 8, 8) }}>
                    <Row gutter={24}>
                        <Col {...cssColResponsiveSpan(24, 24, 24, 6, 6, 6)}>
                            <Carousel autoplaySpeed={3000} autoplay ref={this.carouselRef} dots={false} >
                                {
                                    this.handoverSelected?.fi_id_list!?.length > 0 &&
                                    this.handoverSelected.fi_id_list!.map((item, index) =>
                                        <div title={item.key} key={'image_' + index} style={{ display: "flex", justifyContent: 'center' }}>
                                            <FileAttachmentsImages
                                                className='auto-size-upload'
                                                showRemoveIcon={false}
                                                maxLength={5}
                                                files={[item]}
                                                isLoadFile={this.state.isLoadDone}
                                                allowRemove={false}
                                                isMultiple={false}
                                                onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                                    this.handoverSelected.fi_id_list = itemFile.slice(0, 5);
                                                }}
                                                isDownload={true}
                                            />
                                        </div>
                                    )
                                }
                            </Carousel>
                            <Space>
                                <Button
                                    onClick={this.handlePrev}>
                                    &lt;
                                </Button>
                                <Button
                                    onClick={this.handleNext}
                                >
                                    &gt;
                                </Button>
                            </Space>
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 24, 24, 6, 6, 6)}>
                            <Form.Item
                                label={'Người bàn giao:'}
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{stores.sessionStore.getUserNameById(this.handoverSelected?.handover_user!)}</b>
                            </Form.Item>
                            <Form.Item
                                label={'Người nhận bàn giao:'}
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{stores.sessionStore.getUserNameById(this.handoverSelected?.receive_user!)}</b>
                            </Form.Item>
                            <Form.Item
                                label={'Loại bàn giao:'}
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{this.handoverSelected?.ha_type! == eHandoverType.HANDOVER_BOTH.num ? <Tag color='success'>Bàn giao máy + hàng</Tag> : this.handoverSelected?.ha_type! == eHandoverType.HANDOVER_ONLYMACHINE.num ? <Tag color='warning'>Chỉ bàn giao máy</Tag> : this.handoverSelected?.ha_type! == eHandoverType.HANDOVER_ONLYPRODUCT.num ? <Tag color='warning'>Chỉ bàn giao hàng</Tag> : <Tag color='error'>Chưa bàn giao</Tag>}</b>
                            </Form.Item>
                            <Form.Item
                                label={'Trạng thái bàn giao:'}
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{this.handoverSelected?.ha_status! == eHandoverStatus.HANDOVER_COMPLETE.num ? <Tag color='success'>Đã bàn giao</Tag> : this.handoverSelected?.ha_status! == eHandoverStatus.HANDOVER_ONEPART.num ? <Tag color='warning'>Bàn giao 1 phần</Tag> : <Tag color='error'>Chưa bàn giao</Tag>}</b>
                            </Form.Item>
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 24, 24, 6, 6, 6)}>
                            <Form.Item
                                label='Máy bán nước'
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                {this.handoverSelected?.ma_id_list?.map((item) => (
                                    <b key={item}>{`${stores.sessionStore.getNameGroupUseMaId(item)} - ${stores.sessionStore.getNameMachines(item)}`}</b>
                                ))}
                            </Form.Item>
                            <Form.Item
                                label={'Ghi chú'}
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <span >{this.handoverSelected?.ha_note!}</span>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Row justify='end'>
                    {this.handoverSelected?.ha_status != eHandoverStatus.HANDOVER_COMPLETE.num && <Button type='primary' icon={<EditOutlined />} onClick={() => this.openUpdateHandover(this.handoverSelected)}>Cập nhật</Button>}
                </Row>
                {
                    this.state.listProduct.length > 0 &&
                    <Row>
                        <Col span={24}>
                            <h2>Danh sách sản phẩm bàn giao</h2>
                        </Col>
                        <Col span={24}>
                            <TableProductRepositoryDetail
                                listProductResult={this.state.listProduct}
                                pagination={false}
                                hasAction={false}
                                edit={false}
                            />
                        </Col>
                    </Row>

                }
            </Card >
        )
    }
}