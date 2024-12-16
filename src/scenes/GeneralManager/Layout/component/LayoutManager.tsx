import { CreateLayoutInput, LayoutDto, LayoutSlotDto, ProductDto, UpdateLayoutInput } from '@src/services/services_autogen';
import ItemProductDetail from './ItemProductDetail';
import { AutoComplete, Button, Card, Col, Divider, Form, Input, Pagination, Popover, Row, Space, message } from 'antd';
import * as React from 'react';
import rules from '@src/scenes/Validation';
import AppConsts, { cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { ArrowLeftOutlined, QuestionCircleTwoTone } from '@ant-design/icons';
import SelectedProductPrice from '@src/components/Manager/SelectedProductPrice';
import { ProductDetailDto } from '@src/stores/productStore';
import './../style.css'

interface IProps {
    listProduct: ProductDetailDto[];
    onCancel?: () => void;
    onSuccess?: () => void;
    layoutSelected?: LayoutDto;
}

export default class LayoutManager extends AppComponentBase<IProps> {
    private formRef: any = React.createRef();
    state = {
        layout_type: '',
        layout: [],
        isLoadDone: false,
        grid: Array(60).fill(null),
        idSelected: -1,
        pr_id: undefined,
        pr_price: undefined,
        pr_price_from: 0,
        pr_price_to: 0,
        pr_name: '',
        la_id: undefined,
        openModal: false,
        currentPage: 1,
        pageSize: 20,
        hasErrorLayoutType: false,
    }

    listProduct: ProductDetailDto[] = this.props.listProduct;
    layoutSelected: LayoutDto = new LayoutDto();

    async componentDidMount() {
        await this.initData(this.props.layoutSelected);
        this.formRef.current!.setFieldsValue({ la_type: this.state.layout_type });
        await this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    async componentDidUpdate(_prevProps, prevState) {
        if (this.state.idSelected !== prevState.idSelected) {
            this.initData(this.props.layoutSelected);
        }
        if (prevState.layout_type !== this.state.layout_type) {
            this.formRef.current!.setFieldsValue({ la_type: this.state.layout_type });
        }
        console.log(123, this.state.grid);

    }

    getProduct = (id: number) => {
        const { listProduct } = this.props;
        let product = listProduct.find(item => item.pr_id == id);
        let data: ProductDto = ProductDto.fromJS({ pr_id: -2 });
        return product ?? data;
    }
    initData = async (input: LayoutDto | undefined) => {
        this.setState({ isLoadDone: false });
        if (input !== undefined && input.la_id !== undefined) {
            this.formRef.current!.setFieldsValue({ ...input });
            let layoutType = input?.la_type!;
            await this.setState({ layout_type: layoutType, layout: this.extractNumbers(layoutType) });
            let x = Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null);
            input?.la_slots?.map(item => {
                x[item.slot_id] = this.getProduct(item.pr_id);
            })
            await this.setState({ grid: x });
            if (input?.la_desc == null) {
                input!.la_desc = ""
            }
            this.formRef.current!.setFieldsValue({ ...input });
        }
        else {
            this.formRef.current.resetFields();
            await this.setState({
                grid: Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null)
            });
        }
        this.setState({ isLoadDone: true });
    }

    handleDragStart = (e: React.DragEvent<HTMLDivElement>, product: ProductDto, index?: number) => {
        if (index !== undefined) {
            e.dataTransfer.setData("product", JSON.stringify({ type: "gridItem", oldIndex: index }));
        } else {
            e.dataTransfer.setData("product", JSON.stringify({ type: "product", product }));
        }
    };

    handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        const droppedData = JSON.parse(e.dataTransfer.getData("product"));
        const newGrid = [...this.state.grid];

        if (droppedData.type === "gridItem") {
            const { oldIndex } = droppedData;

            if (index === -1) {
                newGrid[oldIndex] = null;
            } else {
                const movedProduct = newGrid[oldIndex];
                newGrid[oldIndex] = newGrid[index];
                newGrid[index] = movedProduct;
            }
        } else if (droppedData.type === "product") {
            const product = droppedData.product as ProductDto;
            newGrid[index] = product;
        }

        this.setState({ grid: newGrid });
        e.dataTransfer.clearData();
    };


    handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    handleChangeProduct = () => {
        const { pr_price_from, pr_price_to, pr_name } = this.state;
        const prNameLower = pr_name?.toLocaleLowerCase();

        this.listProduct = this.props.listProduct.filter(item => {
            const isPriceMatch = (!pr_price_from || item.pr_price >= pr_price_from) &&
                (!pr_price_to || item.pr_price <= pr_price_to);
            const isNameMatch = !pr_name || item.pr_name?.toLocaleLowerCase().includes(prNameLower);
            return isPriceMatch && isNameMatch;
        });
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    extractNumbers = (inputString: string): number[] => {
        const numberMatches = inputString!.match(/\d+/g);
        const numbersArray = numberMatches ? numberMatches.map(Number) : [];
        return numbersArray;
    };

    onCreateUpdate = async () => {
        const { layoutSelected } = this.props;
        this.formRef.current!.validateFields().then(async (values: any) => {
            if (layoutSelected?.la_id === undefined || layoutSelected.la_id < 0) {
                let unitData = new CreateLayoutInput(values);
                unitData.la_type = this.state.layout_type;
                let y: LayoutSlotDto[] = [];
                this.state.grid.map((item, index) => {
                    if (item != null) {
                        let x: LayoutSlotDto = new LayoutSlotDto();
                        x.slot_id = index;
                        x.pr_id = item.pr_id;
                        y.push(x);
                    }
                })
                unitData.layoutSlotDtos = y;
                await stores.layoutStore.createLayout(unitData);
                this.props.onSuccess!();
                this.props.onCancel!();
                message.success("Thêm mới bố cục thành công!");
            } else {
                let unitData = new UpdateLayoutInput({ la_id: layoutSelected.la_id, ...values });
                unitData.la_type = this.state.layout_type;
                let y: LayoutSlotDto[] = [];
                this.state.grid.map((item, index) => {
                    if (item != null) {
                        let x: LayoutSlotDto = new LayoutSlotDto();
                        x.slot_id = index;
                        x.pr_id = item.pr_id;
                        y.push(x);
                    }
                })
                unitData.layoutSlotDtos = y;
                await stores.layoutStore.updateLayout(unitData);
                this.props.onSuccess!();
                this.props.onCancel!();
                message.success("Chỉnh sửa bố cục thành công");
            }
        })
        this.setState({ isLoadDone: !this.state.isLoadDone });
    };

    onReset = () => {
        this.initData(this.props.layoutSelected);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    getPaginatedProducts() {
        const { currentPage, pageSize } = this.state;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return this.listProduct.sort((a, b) => a.pr_price - b.pr_price).slice(start, end);
    }
    handlePageChange = (page: number, pageSize?: number) => {
        this.setState({ currentPage: page, pageSize: pageSize });
    };
    onShowSizeChange = (current, size) => {
        this.handlePageChange(current, size);
    };
    handleChangeLayout = async (value: string) => {
        const { hostSetting } = stores.settingStore;
        const arrLayoutType = value.split('|');
        if (arrLayoutType.length > hostSetting.general.soLuongCotToiDaBoCucMau) {
            await this.setState({ hasErrorLayoutType: true });
            message.error('Vượt quá số lượng cột cho phép!');
        }
        else if (arrLayoutType.some(value => +value > hostSetting.general.soLuongHangToiDaBoCucMau)) {
            await this.setState({ hasErrorLayoutType: true });
            message.error("Vượt quá số lượng tối đa 1 hàng!");
        }
        else {
            await this.setState({ layout_type: value, hasErrorLayoutType: false });
            this.setState({
                layout: this.extractNumbers(this.state.layout_type),
                grid: Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null)
            });
        }
    }

    handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab' || e.key === '|') {
            e.preventDefault();
            if (this.state.layout_type.slice(-1) !== '|' && this.state.layout_type.length > 0) {
                await this.setState({ layout_type: `${this.state.layout_type + '|'}` });
            }
        }
        else if (!AppConsts.testNumber(e.key) &&
            e.key !== 'Backspace' &&
            e.key !== 'ArrowLeft' &&
            e.key !== 'ArrowRight'
        ) {
            e.preventDefault();
        }
    };

    render() {
        const { layoutSelected } = this.props;
        const { layoutListResult } = stores.layoutStore;
        const { hostSetting } = stores.settingStore;
        const layoutOptions = Array.from(new Set(layoutListResult.map(item => item.la_type!)))
            .sort((a, b) => a.localeCompare(b))
            .map(item => ({ value: item, label: item }));
        let currentIndex = 0;
        return (
            <>
                <Row>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={this.props.onCancel}></Button>
                        <h2 style={{ margin: 0 }}>{(layoutSelected?.la_id != undefined && layoutSelected?.la_id > 0) ? "Chỉnh sửa bố cục " + layoutSelected.la_name : "Thêm mới bố cục"}</h2>
                    </Space>
                </Row>
                <Row>
                    <Form ref={this.formRef} style={{ width: '100%' }}>
                        <Row>
                            <Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)}>
                                <Form.Item label="Tên bố cục" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces]} name={"la_name"}>
                                    <Input placeholder='Nhập tên bố cục...' />
                                </Form.Item>
                            </Col>
                            <Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)}>
                                <Form.Item
                                    label={
                                        <Space size={4}>
                                            Kiểu bố cục
                                            <Popover
                                                trigger="hover"
                                                placement="bottom"
                                                content={
                                                    <Space direction='vertical'>
                                                        <span>Bố cục có dạng 1|2|3|4|5|...</span>
                                                        <span>{`Tối đa ${hostSetting.general.soLuongHangToiDaBoCucMau} hàng, mỗi hàng chứa ${hostSetting.general.soLuongCotToiDaBoCucMau} sản phẩm`}</span>
                                                        <span>Nhấn Tab để thêm |</span>
                                                    </Space>
                                                }
                                            >
                                                <QuestionCircleTwoTone />
                                            </Popover>
                                        </Space>
                                    }
                                    rules={[rules.required, rules.layout, rules.maxLengthLayout, rules.noAllSpaces, {
                                        validator: () => {
                                            if (this.state.hasErrorLayoutType) {
                                                return Promise.reject(new Error("Định dạng bố cục không hợp lệ!"));
                                            }
                                            return Promise.resolve();
                                        }
                                    }]}
                                    {...AppConsts.formItemLayout}
                                    name={"la_type"}
                                >
                                    <AutoComplete
                                        style={{ width: "100%" }}
                                        onChange={this.handleChangeLayout}
                                        onKeyDown={this.handleKeyDown}
                                        options={layoutOptions}
                                        value={this.state.layout_type}
                                        placeholder="Nhấn Tab để thêm |"
                                    />
                                </Form.Item>
                            </Col>
                            <Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)}>
                                <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={"la_desc"}>
                                    <Input maxLength={255} placeholder='Ghi chú...' />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                <Row gutter={8} className='product-list'>
                    <Col span={10}>
                        <Card
                            className='product-list__card'
                            onDrop={(e) => this.handleDrop(e, -1)}
                            onDragOver={this.handleDragOver}
                        >
                            <Row gutter={[8, 8]} >
                                <Col span={12}>
                                    <h3><strong>Sản phẩm</strong></h3>
                                </Col>
                                <Col span={12}>
                                    <Input
                                        allowClear
                                        placeholder={"Nhập tên sản phẩm"}
                                        style={{ width: '100%' }}
                                        value={this.state.pr_name}
                                        onChange={async e => {
                                            await this.setState({ pr_name: e.target.value });
                                            this.handleChangeProduct();
                                            this.handlePageChange(1, this.state.pageSize);
                                        }}
                                    >
                                    </Input>
                                </Col>
                                <Col span={24}>
                                    <SelectedProductPrice
                                        onChangePrice={async (price_from, price_to) => {
                                            await this.setState({ pr_price_from: price_from, pr_price_to: price_to });
                                            this.handleChangeProduct();
                                            this.handlePageChange(1, this.state.pageSize);
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={[4, 4]}>
                                {this.getPaginatedProducts().map((product) => (
                                    <Col key={product.pr_id}>
                                        <div
                                            className='product-list__block-product'
                                            draggable
                                            onDragStart={(e) => this.handleDragStart(e, product)}
                                        >
                                            <ItemProductDetail productDetail={product} isMachineGridLayout={false} />
                                        </div>
                                    </Col>
                                ))}
                                <Col span={24} className='product-list__col product-list__col--aligh-right'>
                                    <Pagination
                                        className='product-list__pagination'
                                        size='small'
                                        showQuickJumper
                                        current={this.state.currentPage}
                                        pageSize={this.state.pageSize}
                                        total={this.listProduct.length}
                                        onChange={this.handlePageChange}
                                        onShowSizeChange={this.onShowSizeChange}
                                        pageSizeOptions={pageSizeOptions}
                                        showTotal={(total) => (
                                            <span>
                                                Tổng <strong style={{ color: '#389e0d' }}>{total}</strong>
                                            </span>
                                        )}
                                    />

                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={14}>
                        <Card style={{ overflowX: "auto" }}>
                            <Row style={{ marginBottom: 8 }}>
                                <Col span={10}>
                                    <h3><strong>Bố cục mẫu</strong></h3>
                                </Col>
                                <Col span={14} style={{ textAlign: 'right' }}>
                                    <Space>
                                        <Button title='Lưu' type='primary' onClick={this.onCreateUpdate}>Lưu</Button>
                                        <Button title='Làm mới' danger type='primary' onClick={() => this.setState({ grid: Array(60).fill(null) })}>Làm mới</Button>
                                        <Button title='Huỷ' danger onClick={this.onReset}>Huỷ</Button>
                                    </Space>
                                </Col>
                            </Row>
                            {this.state.layout.map((colCount, rowIndex) => (
                                <Space
                                    className='layout'
                                    key={rowIndex}
                                >
                                    {Array.from({ length: colCount }).map((_, colIndex) => {
                                        const index = currentIndex++;
                                        return (
                                            <div
                                                key={colIndex}
                                                className='layout__block'
                                                onDragStart={(e) => this.handleDragStart(e, this.state.grid[index], index)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => this.handleDrop(e, index)}
                                                draggable={!!this.state.grid[index]}
                                            >
                                                <ItemProductDetail productDetail={this.state.grid[index]} isMachineGridLayout={false} slot={index + 1} />
                                            </div>
                                        );
                                    })}
                                </Space>
                            ))}
                        </Card>
                    </Col>
                </Row>
            </>
        );
    }
}

