import { LayoutDto, MachineDetailDto } from '@src/services/services_autogen';
import ItemProductDetail from './ItemProductDetail';
import { Button, Card, Col, Row, Space } from 'antd';
import * as React from 'react';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedLayout from '@src/components/Manager/SelectedLayout';
import { ProductDetailDto } from '@src/stores/productStore';

interface IProps {
    ma_layout?: string;
    layoutListResult: LayoutDto[];
    listProduct: ProductDetailDto[];
    onSuccess?: (item: LayoutDto) => void;
    onCancel?: () => void;
}

export default class ExampleLayout extends AppComponentBase<IProps> {
    state = {
        layout_type: '',
        layout: [],
        grid: Array(60).fill(null),
        pr_id: undefined,
        la_id: undefined,
        isLoadDone: false,
    }
    listProduct: ProductDetailDto[] = this.props.listProduct;
    layoutSelected: LayoutDto = new LayoutDto();
    async componentDidUpdate(prevState) {
        if (this.state.layout_type !== prevState.layout_type) {
            if (this.layoutSelected.la_id != undefined) {
                this.initData(this.layoutSelected);
            }
        }
    }

    getProduct = (id: number) => {
        const { listProduct } = this.props;
        let product = listProduct.filter(item => item.pr_id == id);
        return product[0];
    }

    initData = async (input: LayoutDto | undefined) => {
        this.setState({ isLoadDone: false });
        if (input !== undefined && input.la_id !== undefined) {
            await this.setState({ layout_type: input?.la_type });
            await this.setState({ layout: this.extractNumbers(this.state.layout_type) });
            let x = Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null);
            input?.la_slots?.map(item => {
                x[item.slot_id] = this.getProduct(item.pr_id);
            })
            await this.setState({ grid: x });
        }
        else {
            await this.setState({
                grid: Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null)
            });
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    };

    onSuccess = (item: LayoutDto) => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess(item);
        }
    };

    extractNumbers = (inputString: string): number[] => {
        const numberMatches = inputString.match(/\d+/g);
        const numbersArray = numberMatches ? numberMatches.map(Number) : [];
        return numbersArray;
    };

    getLayout(id: number) {
        if (id != undefined) {
            let x = this.props.layoutListResult.find(item => item.la_id == id);
            return x;
        }
        return undefined;
    }

    render() {
        let currentIndex = 0;
        return (
            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Card style={{ overflowX: "auto" }}>
                        <Row style={{ marginBottom: 8 }}>
                            <Col span={4}>
                                <h3><strong>Chọn bố cục</strong></h3>
                            </Col>
                            <Col span={8}>
                                <SelectedLayout la_id={this.state.la_id} onChangeLayoutSelected={async (value) => { await this.setState({ la_id: value }); this.initData(this.getLayout(this.state.la_id!)) }} />
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button title='Sử dụng' type='primary' onClick={() => { this.onSuccess(this.getLayout(this.state.la_id!)!); this.onCancel() }}>Sử dụng</Button>
                                    <Button title='Huỷ' danger onClick={this.onCancel}>Huỷ</Button>
                                </Space>
                            </Col>
                        </Row>
                        {this.state.layout.map((colCount, rowIndex) => (
                            <Space key={rowIndex} style={{ display: "flex", marginBottom: 8 }}>
                                {Array.from({ length: colCount }).map((_, colIndex) => {
                                    const index = currentIndex++;
                                    return (
                                        <div
                                            className='layout__block'
                                            key={index}
                                            style={{
                                                backgroundColor: 'white',
                                                border: "2px solid darkgray",
                                                paddingBottom: 3,
                                            }}
                                        >
                                            <ItemProductDetail slot={index + 1} productDetail={this.state.grid[index]} isMachineGridLayout={false} />
                                        </div>
                                    );
                                })}
                            </Space>
                        ))}
                    </Card>
                </Col>
            </Row >
        );
    }
}

