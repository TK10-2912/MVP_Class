import { LayoutDto, MachineDetailDto, MachineDto, ProductDto } from '@src/services/services_autogen';
import { Card, Col, Row, Space } from 'antd';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { FormInstance } from 'antd/lib/form';
import ItemProductDetail from '@src/scenes/GeneralManager/Layout/component/ItemProductDetail';
import { ProductDetailDto } from '@src/stores/productStore';
import { eMainBoard } from '@src/lib/enumconst';

interface IProps {
    listProduct: ProductDto[];
    onCancel?: () => void;
    layoutSelected?: LayoutDto;
    machineDetailSelected?: MachineDetailDto[];
    ma_layout?: string;
    ma_rangeDisplayVending?: number;
    machine: MachineDto;
    ma_activeRefill?: boolean;
}

export default class ListProductDetail extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        layout_type: this.props.ma_layout,
        layout: [],
        isLoadDone: false,
        grid: Array(this.props.machineDetailSelected?.length).fill(null),
        idSelected: -1,
        pr_id: undefined,
        pr_name: '',
        pr_price: undefined,
        la_id: undefined,
        openModal: false,
        hoveredIndex: null,
        openModalAddProduct: false,
        visibleModalSetPrice: false,
        visibleModalSetMaxTray: false,
        money: 0,
        maxTray: 0,
        currentPage: 1,
        pageSize: 10,
    }
    listProduct: ProductDto[] = this.props.listProduct;
    layoutListResult: LayoutDto[] = [];
    layoutSelected: LayoutDto = new LayoutDto();
    machineDetailSelected: MachineDetailDto[] = [];
    refill: MachineDetailDto[] | undefined = [];
    vending: MachineDetailDto[] | undefined = [];
    listUpdateMachineDetailMoneyInput: number[] = [];

    async componentDidMount() {
        await stores.layoutStore.getAll(undefined, undefined, undefined, undefined);

        if (this.props.ma_layout && this.props.ma_layout !== '-1' || this.props.ma_rangeDisplayVending) {
            this.setProductToGrid(true);
        }
        else {
            await this.initData(this.props.layoutSelected);
        }
        this.machineDetailSelected = this.props.machineDetailSelected!;
        await this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    componentDidUpdate(nextProps: Readonly<IProps>, prevState) {
        if (this.state.idSelected !== prevState.idSelected) {
            this.initData(this.props.layoutSelected);
        }
        if (nextProps.machineDetailSelected !== this.props.machineDetailSelected) {
            this.setProductToGrid();
        }
    }

    setProductToGrid = async (isResetLayout?: boolean) => {
        if (this.props.ma_layout && this.props.ma_layout !== '-1') {
            const { layoutListResult } = await stores.layoutStore;
            this.layoutListResult = layoutListResult;
            if (isResetLayout) {
                this.setState({
                    layout_type: this.props.ma_layout,
                    layout: this.extractNumbers(this.props.ma_layout)
                });
            }
            await this.initData(this.props.layoutSelected);
            let product: ProductDto[] = [];
            this.refill = this.props.machineDetailSelected?.filter(item => item.dr_type === 1 && !item.ma_de_is_deleted);
            this.vending = this.props.machineDetailSelected?.filter(item => item.dr_type === 0 && !item.ma_de_is_deleted);
            if (this.props.machineDetailSelected && this.props.machineDetailSelected.length > 0) {
                this.props.machineDetailSelected.map((item, index) => {
                    if (index < this.refill?.length!) {
                        product[index] = this.props.ma_activeRefill ? this.props.listProduct.filter(record => record.pr_id === this.refill?.map(re_item => re_item.pr_id)[index])[0] : new ProductDto;
                    }
                    else {
                        product[index] = this.props.listProduct.filter(record => record.pr_id === this.vending?.map(ve_item => ve_item.pr_id)[index - this.refill?.length!])[0];
                    }
                })
            }
            this.layoutSelected = this.props.layoutSelected!;
            await this.setState({ grid: product });
        }
    }

    setDataFromMachine = async () => {
        let product: ProductDto[] = [];
        if (this.machineDetailSelected && this.machineDetailSelected.length > 0) {
            this.machineDetailSelected.map((item, index) => {
                product[index] = this.props.listProduct.filter(record => record.pr_id === item.pr_id)[0];
            })
        }
        await this.setState({ grid: product });
    }

    getProduct = (id: number) => {
        const { listProduct } = this.props;
        let product = listProduct.filter(item => item.pr_id == id);
        return product[0];
    }
    initData = async (input: LayoutDto | undefined) => {
        if (input !== undefined && input.la_id !== undefined) {
            await this.setState({ layout_type: this.refill?.length ? `${this.refill?.length}|${input?.la_type}` : input?.la_type });
            await this.setState({ layout: this.extractNumbers(this.state.layout_type || '') });
            let x = Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null);
            input?.la_slots?.map(item => {
                if (this.refill && item.slot_id < this.refill?.length) {
                    x[item.slot_id] = this.props.ma_activeRefill ? this.getProduct(this.refill[item.slot_id].pr_id) : new ProductDto;
                }
                x[item.slot_id + this.refill?.length!] = this.getProduct(item.pr_id);
            })
            await this.setState({ grid: x });
            if (input?.la_desc == null) {
                input!.la_desc = "";
            }
        }
        else {
            await this.setState({
                grid: Array(this.state.layout.reduce((sum, current) => sum + current, 0)).fill(null)
            });
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.layoutSelected !== undefined && nextProps.layoutSelected.la_id !== prevState.idSelected) {
            return ({ idSelected: nextProps.layoutSelected.la_id });
        }
        return null;
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    };
    extractNumbers = (inputString: string): number[] => {
        const numberMatches = inputString!.match(/\d+/g);
        const numbersArray = numberMatches ? numberMatches.map(Number) : [];
        return numbersArray;
    };
    onReset = async () => {
        if (this.props.layoutSelected?.la_id != undefined && this.props.layoutSelected?.la_id > 0) {
            await this.initData(this.props.layoutSelected);
        }
        this.setProductToGrid();
        await this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    setDefaultLayout = async () => {
        let numberOfProduct = this.props.machineDetailSelected?.length!;
        let numberOfRefill = this.props.machineDetailSelected?.filter(item => item.dr_type === 1).length!;
        let numberOfVending = this.props.machineDetailSelected?.filter(item => item.dr_type === 0).length!;
        let rowSize = this.props.ma_rangeDisplayVending!;
        await this.setState({
            grid: Array(numberOfVending).fill(null),
            layout_type: [numberOfRefill]
                .concat(Array.from({ length: Math.floor((numberOfProduct - numberOfRefill) / rowSize) }, () => rowSize))
                .concat(Array.from({ length: ((numberOfProduct - numberOfRefill) % rowSize) }, () => rowSize))
                .join('|'),
            layout: [numberOfRefill]
                .concat(Array.from({ length: Math.floor((numberOfProduct - numberOfRefill) / rowSize) }, () => rowSize))
                .concat(Array.from({ length: ((numberOfProduct - numberOfRefill) % rowSize) }, () => rowSize))
        });
    }

    onUsedLayout = async (item: LayoutDto) => {
        this.layoutSelected = item;
        this.initData(item);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    handlePageChange = (page: number, pageSize?: number) => {
        this.setState({ currentPage: page, pageSize: pageSize });
    };

    onSelectMachineDetail = (ma_de_id) => {
        this.setState({ isLoadDone: false });
        if (this.listUpdateMachineDetailMoneyInput) {
            const index = this.listUpdateMachineDetailMoneyInput!.findIndex(
                item => item === ma_de_id
            );
            if (index === -1) {
                this.listUpdateMachineDetailMoneyInput.push(ma_de_id);
            } else {
                this.listUpdateMachineDetailMoneyInput.splice(index, 1);
            }
        }

        this.setState({ isLoadDone: true });
    };
    renderTitle = (row: number) => {
        console.log(row);

        if (!this.props.machineDetailSelected || this.props.machineDetailSelected.length == 0) {
            return <></>;
        }
        if (row === 0 && !!this.props.ma_activeRefill) {
            return <div><strong style={{ color: '#1DA57A' }}>Refill</strong></div>
        }
        if (row === 1) {
            return <div><strong style={{ color: '#1DA57A' }}>Vending</strong></div>
        }
    }
    getBackgroundColor = (item: MachineDetailDto): string => {
        const { hostSetting } = stores.settingStore;

        if (item.ma_de_cur <= 0) {
            return "#fce3e3";
        } else if (item.ma_de_cur < hostSetting.general.soLuongSapHetHangVending) {
            return "#fcfccf";
        } else {
            return "white";
        }
    };
    render() {
        return (

            <Card style={{ overflowX: "auto" }}>
                {this.refill!.length > 0 && this.props.machine?.ma_commandRefill != eMainBoard.NONE.num &&
                    <Row gutter={8}>
                        <Col span={24}><span className='product-list__title'>REFILL</span></Col>
                        <Space className='layout'
                            key={`refill_row_${1}`}>
                            {this.refill!.map((item, index) => (
                                <div
                                    className='layout__block'
                                    key={`refill_col_${index}`}
                                    style={{
                                        opacity: item.isError ? 0.5 : 1,
                                        border: "1px solid #536493",
                                        backgroundColor: this.getBackgroundColor(item)
                                    }}
                                >
                                    <ItemProductDetail machineDetail={item} slot={item.ma_de_slot_id + 1} isMachineGridLayout={true} productDetail={new ProductDetailDto(item.productDto, item)} />
                                </div>
                            ))}
                        </Space>
                    </Row>
                }
                <Row gutter={8}>
                    <Col span={24}><span className='product-list__title'>VENDING</span></Col>
                    {this.state.layout.map((cols, rowIndex) => (
                        <Space
                            className='layout'
                            key={`vending_row_${rowIndex}`}
                        >
                            {this.vending!.slice(
                                rowIndex === 0
                                    ? 0
                                    : this.state.layout.slice(0, rowIndex).reduce((a, b) => a + b, 0),
                                this.state.layout.slice(0, rowIndex + 1).reduce((a, b) => a + b, 0)
                            ).map((item, colIndex) => (
                                <div
                                    className='layout__block'
                                    key={`vending_col_${colIndex}`}
                                    style={{
                                        opacity: item.isError ? 0.5 : 1,
                                        border: "1px solid #536493",
                                        backgroundColor: this.getBackgroundColor(item)
                                    }}
                                >
                                    <div onClick={() => this.onSelectMachineDetail(item.ma_de_id)}>
                                        {/* <ItemDetail machineDetail={item} /> */}
                                        <ItemProductDetail machineDetail={item} slot={item.ma_de_slot_id + 1} isMachineGridLayout={true} productDetail={new ProductDetailDto(item.productDto, item)} />
                                    </div>
                                </div>
                            ))}
                        </Space>
                    ))}
                </Row>
            </Card>
        );
    }
}

