import { CreateLayoutInput, LayoutDto, LayoutSlotDto, ProductDto, UpdateLayoutInput } from '@src/services/services_autogen'; // Ensure this path is correct
import ItemProductDetail from './ItemProductDetail';
import { Button, Card, Col, Form, Input, Row, Select, Space, message } from 'antd';
import * as React from 'react';
import SelectedProduct from '@src/components/Manager/SelectedProduct';
import rules from '@src/scenes/Validation';
import AppConsts from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { Label } from 'recharts';

interface IProps {
    listProduct: ProductDto[];
    onCancel?: () => void;
    onSuccess?: () => void;
    layoutSelected?: LayoutDto;
}

export default class ProductList extends React.Component<IProps> {
    private formRef: any = React.createRef();
    state = {
        layout_type: '9|9|8',
        layout: [9, 9, 8],
        isLoadDone: false,
        grid: Array(26).fill(null),
        idSelected: -1,
        pr_id: undefined,
    }
    listProduct: ProductDto[] = this.props.listProduct;
    async componentDidMount() {
        await this.initData(this.props.layoutSelected);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.layoutSelected !== undefined && nextProps.layoutSelected.la_id !== prevState.idSelected) {
            return ({ idSelected: nextProps.layoutSelected.la_id });
        }
        return null;
    }
    getProduct = (id: number) => {
        const { listProduct } = this.props;
        let product = listProduct.filter(item => item.pr_id == id);
        return product[0];
    }
    initData = async (input: LayoutDto | undefined) => {
        const { layoutSelected } = this.props;
        this.setState({ isLoadDone: false });
        if (input !== undefined && input.la_id !== undefined) {
            this.formRef.current!.setFieldsValue({ ...input });
            await this.setState({ layout_type: layoutSelected?.la_type });
            await this.setState({ layout: this.extractNumbers(this.state.layout_type) });
            let x = Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null);
            layoutSelected?.la_slots?.map(item => {
                x[item.slot_id] = this.getProduct(item.pr_id);
            })
            await this.setState({ grid: x });
        }
        if (input?.la_desc == null) {
            input!.la_desc = ""
        }
        else {
            this.formRef.current.resetFields();
        }
        this.formRef.current!.setFieldsValue({ ...input });
        this.setState({ isLoadDone: true });
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.idSelected !== prevState.idSelected) {
            this.initData(this.props.layoutSelected);
        }
    }
    handleDragStart = (e: React.DragEvent<HTMLDivElement>, product: ProductDto) => {
        e.dataTransfer.setData("product", JSON.stringify(product));
    };

    handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        const product = JSON.parse(e.dataTransfer.getData("product")) as ProductDto;
        const newGrid = [...this.state.grid];
        newGrid[index] = product;
        this.setState({ grid: newGrid });
        e.dataTransfer.clearData();
    };

    handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    };
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    };
    handleChangeProduct = async () => {
        if (this.state.pr_id != undefined) {
            this.listProduct = this.props.listProduct.filter(item => item.pr_id == this.state.pr_id);
        } else this.listProduct = this.props.listProduct;
    }
    extractNumbers = (inputString: string): number[] => {
        const numberMatches = inputString.match(/\d+/g);
        const numbersArray = numberMatches ? numberMatches.map(Number) : [];
        return numbersArray;
    };
    handleChangeLayout = async () => {
        this.setState({ isLoadDone: false });
        this.setState({ layout: this.extractNumbers(this.state.layout_type) });
        this.setState({ grid: Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null), })
        this.setState({ isLoadDone: true });

    }
    onCreateUpdate = () => {
        const { layoutSelected } = this.props;
        const form = this.formRef.current;
        this.setState({ isLoadDone: false })
        form!.validateFields().then(async (values: any) => {
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
                this.onSuccess();
                this.onCancel();
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
                this.onSuccess();
                this.onCancel();
                message.success("Chỉnh sửa bố cục thành công");
            }
        })
        this.setState({ isLoadDone: true })
    };
    render() {
        const { layoutSelected } = this.props;
        let currentIndex = 0;
        return (
            <Row gutter={[8, 8]}>
                <h2>{(layoutSelected?.la_id != undefined && layoutSelected?.la_id > 0) ? "Chỉnh sửa bố cục " + layoutSelected.la_name : "Thêm mới bố cục"}</h2>
                <Form ref={this.formRef} style={{ width: '100%' }}>
                    <Row>
                        <Col span={8}>  <Form.Item label="Tên bố cục"  {...AppConsts.formItemLayout} rules={[rules.required]} name={"la_name"}>
                            <Input placeholder='Nhập tên bố cục...' />
                        </Form.Item>
                        </Col>
                        <Col span={8}>  <Form.Item label="Kiểu bố cục" rules={[rules.required]} {...AppConsts.formItemLayout} name={"la_type"}>
                            <Select
                                defaultValue={this.state.layout_type}
                                style={{ width: "100%" }}
                                onChange={async (value) => { await this.setState({ layout_type: value }); this.handleChangeLayout() }}
                                options={[
                                    { value: '9|9|8', label: '9|9|8' },
                                    { value: '8|8|7', label: '8|8|7' },
                                    { value: '8|8|8|8', label: '8|8|8|8' },
                                    { value: 'FC:8|8|8|10', label: 'FC:8|8|8|10' },
                                ]}
                            />
                        </Form.Item>
                        </Col>
                        <Col span={8}>  <Form.Item label="Ghi chú" rules={[rules.required]} {...AppConsts.formItemLayout} name={"la_desc"}>
                            <Input placeholder='Ghi chú...' />
                        </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Col span={8}>
                    <Card>
                        <Row gutter={[8, 8]}>
                            <Col span={6}>
                                Sản phẩm
                            </Col>
                            <Col span={18}>
                                <SelectedProduct
                                    productId={this.state.pr_id}
                                    onChangeProduct={async (value) => {
                                        this.setState({ isLoadDone: false });
                                        await this.setState({ pr_id: value }); this.handleChangeProduct(); this.setState({ isLoadDone: true });

                                    }}
                                />
                            </Col>
                        </Row>
                        <Row gutter={[8, 8]}>
                            {this.listProduct.map((product) => (
                                <Col key={product.pr_id}>
                                    <div
                                        draggable
                                        onDragStart={(e) => this.handleDragStart(e, product)}
                                    >
                                        <ItemProductDetail productDetail={product} isBorder={true} />
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
                <Col span={16}>
                    <Card style={{ overflowX: "auto" }}>
                        <Row gutter={[8, 8]}>
                            <Col span={24}>
                                Bố cục
                            </Col>
                        </Row>
                        {this.state.layout.map((colCount, rowIndex) => (
                            <div key={rowIndex} style={{ display: "flex" }}>
                                {Array.from({ length: colCount }).map((_, colIndex) => {
                                    const index = currentIndex++;
                                    return (
                                        <div key={colIndex}>
                                            <div
                                                onDrop={(e) => this.handleDrop(e, index)}
                                                onDragOver={this.handleDragOver}
                                                style={{
                                                    width: '100px',
                                                    height: '220px',
                                                    border: '1px solid black',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'white',
                                                }}
                                            >
                                                {this.state.grid[index] ? (
                                                    <ItemProductDetail productDetail={this.state.grid[index]} isBorder={false} />
                                                ) : (
                                                    <span>{index + 1}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </Card>
                    <Space>
                        <Col>
                            <Button type='primary' onClick={this.onCreateUpdate}>Lưu</Button>
                        </Col>
                        <Col>
                            <Button danger onClick={this.onCancel}>Huỷ</Button>
                        </Col>
                    </Space>
                </Col>
            </Row >
        );
    }
}

