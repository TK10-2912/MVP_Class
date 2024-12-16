import { EMainBoard, LayoutDto, MachineDetailDto, ProductDto, UpdateListMachineDetailInput, UpdateMachineDetailInput, } from '@src/services/services_autogen';
import ItemProductDetail from './ItemProductDetail';
import { Button, Card, Col, Input, Modal, Pagination, Row, Space, Tooltip, message } from 'antd';
import * as React from 'react';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { BorderlessTableOutlined, DollarOutlined, ExclamationCircleFilled, LockOutlined, LockTwoTone, UnlockOutlined, UnlockTwoTone } from '@ant-design/icons';
import ExampleLayout from './ExampleLayout';
import SelectedProductPrice from '@src/components/Manager/SelectedProductPrice';
import { ProductDetailDto } from '@src/stores/productStore';
import { eDrinkType, eMainBoard } from '@src/lib/enumconst';
import './../style.css'

const { confirm } = Modal;

interface IProps {
    listProductDetail: ProductDetailDto[];
    onCancel?: () => void;
    onSuccess?: () => void;
    layoutSelected?: LayoutDto;
    machineDetailSelected: MachineDetailDto[];
    ma_layout?: string;
    ma_rangeDisplayVending?: number;
    ma_name?: string;
    ma_commandRefill?: EMainBoard;
}

export default class ProductListMachineDetail extends AppComponentBase<IProps> {
    state = {
        layout_type: "",
        currentLayout: "",
        layoutVending: [],
        isLoadDone: false,
        pr_id: undefined,
        pr_name: '',
        pr_price: undefined,
        pr_price_from: 0,
        pr_price_to: 0,
        la_id: undefined,
        openModal: false,
        hovered_ma_de_id: null,
        visibleModalSetPrice: false,
        money: 0,
        currentPage: 1,
        pageSize: 10,
    }
    layoutSelected: LayoutDto = new LayoutDto();
    listProductDetail: ProductDetailDto[] = this.props.listProductDetail;
    refillMachineDetail: MachineDetailDto[] | undefined = [];
    vendingMachineDetail: MachineDetailDto[] | undefined = [];
    listMachineDetailSelect: number[] = [];

    async componentDidMount() {
        await stores.layoutStore.getAll(undefined, undefined, undefined, undefined);
        if (this.props.ma_layout && this.props.ma_layout !== '-1' || this.props.ma_rangeDisplayVending) {
            this.setProductToGrid();
        }
        this.refillMachineDetail = this.props.machineDetailSelected.filter(item => item.dr_type === 1);
        this.vendingMachineDetail = this.props.machineDetailSelected.filter(item => item.dr_type === 0);
        this.setState({ currentLayout: this.props.ma_layout, isLoadDone: !this.state.isLoadDone });
    }

    setProductToGrid = async () => {
        if (this.props.ma_layout && this.props.ma_layout !== '-1') {
            this.setState({
                layout_type: this.props.ma_layout,
                layoutVending: this.extractNumbers(this.props.ma_layout)
            });
            await this.initData(this.props.layoutSelected);
            this.layoutSelected = this.props.layoutSelected!;
            this.setState({ isLoadDone: !this.state.isLoadDone });
        }
    }

    initData = async (input: LayoutDto | undefined) => {
        if (input !== undefined && input.la_id !== undefined) {
            const layoutType = input?.la_type!;
            await this.setState({
                layout_type: layoutType,
                layoutVending: this.extractNumbers(layoutType)
            });
            this.vendingMachineDetail?.map(machineDetail => machineDetail.productDto = new ProductDto());
            this.vendingMachineDetail = this.props.machineDetailSelected.filter(item => item.dr_type === 0);
            input.la_slots!.map((item) => {
                let currentProduct = this.listProductDetail.find((itemProduct) => itemProduct.pr_id === item.pr_id)!
                this.vendingMachineDetail![item.slot_id].ma_de_is_deleted = false;
                this.vendingMachineDetail![item.slot_id].productDto = currentProduct;
                this.vendingMachineDetail![item.slot_id].pr_money = currentProduct?.pr_price;
            });
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    handleMouseEnter = (index) => {
        this.setState({ hovered_ma_de_id: index });
    };

    handleMouseLeave = () => {
        this.setState({ hovered_ma_de_id: null });
    };
    handleDragStart = (e: React.DragEvent<HTMLDivElement>, productDetail: ProductDetailDto, ma_de_id?: number) => {
        if (ma_de_id != undefined) {
            e.dataTransfer.setData("dataSend", JSON.stringify({ type: "machineDetail", ma_de_id }));
        } else {
            e.dataTransfer.setData("dataSend", JSON.stringify({ type: "productDetail", productDetail }));
        }
    };
    handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    handleDrop = (e: React.DragEvent<HTMLDivElement>, machineDetail: MachineDetailDto) => {
        this.setState({ isLoadDone: false });
        const droppedData = JSON.parse(e.dataTransfer.getData("dataSend"));

        const newRefillList = this.refillMachineDetail;
        const newVendingList = this.vendingMachineDetail;
        let newIndex = this.props.machineDetailSelected!.findIndex(item => item.ma_de_id == machineDetail.ma_de_id);

        if (droppedData.type === "machineDetail") {
            const { ma_de_id } = droppedData;
            let oldIndex = this.props.machineDetailSelected!.findIndex(item => item.ma_de_id == ma_de_id);
            const oldProduct = this.props.machineDetailSelected![oldIndex] != undefined ? this.props.machineDetailSelected![oldIndex].productDto : new ProductDto();
            const newProduct = this.props.machineDetailSelected![newIndex] != undefined ? this.props.machineDetailSelected![newIndex].productDto : new ProductDto();
            const priceTemp = this.props.machineDetailSelected![oldIndex].pr_money;
            const numberCurrentTemp = this.props.machineDetailSelected![oldIndex].ma_de_cur;
            const numberMaxTemp = this.props.machineDetailSelected![oldIndex].ma_de_max;

            if (this.props.machineDetailSelected![oldIndex] != undefined) {
                this.props.machineDetailSelected![oldIndex].productDto = newProduct;
                this.props.machineDetailSelected![oldIndex].pr_money = this.props.machineDetailSelected![newIndex]?.pr_money || 0;
                this.props.machineDetailSelected![oldIndex].ma_de_cur = this.props.machineDetailSelected![newIndex]?.ma_de_cur || 0;
                this.props.machineDetailSelected![oldIndex].ma_de_max = this.props.machineDetailSelected![newIndex]?.ma_de_max || 0;

            }
            if (this.props.machineDetailSelected![newIndex] != undefined) {
                this.props.machineDetailSelected![newIndex].productDto = oldProduct;
                this.props.machineDetailSelected![newIndex].pr_money = priceTemp;
                this.props.machineDetailSelected![newIndex].ma_de_cur = numberCurrentTemp;
                this.props.machineDetailSelected![newIndex].ma_de_max = numberMaxTemp;
            }

        } else if (droppedData.type === "productDetail") {
            try {
                const productDetail = new ProductDetailDto(droppedData.productDetail, this.props.machineDetailSelected[newIndex]);
                this.props.machineDetailSelected![newIndex].productDto = productDetail;
                this.props.machineDetailSelected![newIndex].pr_money = productDetail.pr_price;
                this.props.machineDetailSelected![newIndex].ma_de_cur = productDetail.so_luong_con;
                this.props.machineDetailSelected![newIndex].ma_de_max = productDetail.so_luong_toi_da;
            }
            catch {
            }
        }

        this.refillMachineDetail = newRefillList;
        this.vendingMachineDetail = newVendingList;
        this.setState({ isLoadDone: true });
        e.dataTransfer.clearData();
    };

    onSelectMachineDetail = (ma_de_id: number) => {
        if (this.listMachineDetailSelect.includes(ma_de_id)) {
            let index = this.listMachineDetailSelect.findIndex(item => item == ma_de_id);
            this.listMachineDetailSelect.splice(index, 1);
        } else {
            this.listMachineDetailSelect.push(ma_de_id);
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    };

    extractNumbers = (inputString: string): number[] => {
        const numberMatches = inputString!.match(/\d+/g);
        const numbersArray = numberMatches ? numberMatches.map(Number) : [];
        return numbersArray;
    };

    onCreateUpdate = async () => {
        let initMachineDetailData: UpdateListMachineDetailInput = new UpdateListMachineDetailInput();
        initMachineDetailData.ma_id = this.props.machineDetailSelected![0].ma_id;
        initMachineDetailData.layout = this.state.layout_type;
        let input: UpdateMachineDetailInput[] = [];
        this.vendingMachineDetail?.map((value, index) => {
            let item: UpdateMachineDetailInput = new UpdateMachineDetailInput();
            item.ma_de_id = value.ma_de_id;

            if (index < this.extractNumbers(this.state.layout_type).reduce((sum, cur) => sum + cur, 0)) {
                item.pr_id = value.productDto?.pr_id || -1;
            }
            else {
                item.pr_id = -2;
            }
            item.gia_ban_san_pham = value.pr_money;
            item.isError = value.isError;
            input.push(item);
        })
        this.refillMachineDetail?.map((value, index, array) => {
            let item: UpdateMachineDetailInput = new UpdateMachineDetailInput();
            item.ma_de_id = value.ma_de_id;
            if (index < array.length) {
                item.pr_id = value.productDto?.pr_id || -1;
            }
            else {
                item.pr_id = -2;
            }
            item.gia_ban_san_pham = value.pr_money;
            item.isError = value.isError;
            input.push(item);
        })

        initMachineDetailData.listMachineDetail = input;
        await stores.machineDetailStore.updateListMachineDetail(initMachineDetailData);
        message.success("Chỉnh sửa bố cục thành công");
        this.onReload();
        this.setState({ currentLayout: this.state.layout_type, isLoadDone: !this.state.isLoadDone });
    };

    updateMachineDetailMoney = async () => {
        if (this.state.money) {
            this.refillMachineDetail?.map(item => {
                if (this.listMachineDetailSelect.includes(item.ma_de_id)) {
                    item.pr_money = this.state.money;
                }
            })
            this.vendingMachineDetail?.map(item => {
                if (this.listMachineDetailSelect.includes(item.ma_de_id)) {
                    item.pr_money = this.state.money;
                }
            })
            message.success("Thiết lập thành công")
            this.setState({ visibleModalSetPrice: false });
        }
        else {
            message.error("Chưa thiết lập giá!")
        }
    }
    onUsedLayout = async (item: LayoutDto) => {
        this.layoutSelected = item;
        await this.initData(item);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onClearLayout = () => {
        this.props.machineDetailSelected.map(item => item.productDto = new ProductDto());
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onReset = () => {
        const self = this;
        confirm({
            title: 'Tải lại dữ liệu?',
            icon: <ExclamationCircleFilled />,
            content: 'Mọi thay đổi trước khi lưu sẽ bị loại bỏ!',
            cancelText: 'Hủy',
            async onOk() {
                self.onReload();
            },
        });

        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onReload = async () => {
        await this.props.onSuccess!();
        this.listMachineDetailSelect = [];
        this.refillMachineDetail = this.props.machineDetailSelected.filter(item => item.dr_type === 1);
        this.vendingMachineDetail = this.props.machineDetailSelected.filter(item => item.dr_type === 0);
        this.props.machineDetailSelected.map(itemMachineDetail => {
            itemMachineDetail.productDto = this.listProductDetail.find(itemProduct => itemProduct.pr_id == itemMachineDetail.pr_id)!;
        })
        this.setState({
            layout_type: this.state.currentLayout,
            layoutVending: this.extractNumbers(this.state.currentLayout || '')
        });
    }

    handlePageChange = (page: number, pageSize?: number) => {
        this.setState({ currentPage: page, pageSize: pageSize });
    };

    onShowSizeChange = (current, size) => {
        this.handlePageChange(current, size);
    };

    handleChangeProduct = () => {
        const { pr_price_from, pr_price_to, pr_name } = this.state;
        const prNameLower = pr_name?.toLocaleLowerCase();

        this.listProductDetail = this.props.listProductDetail.filter(item => {
            const isPriceMatch = (!pr_price_from || item.pr_price >= pr_price_from) &&
                (!pr_price_to || item.pr_price <= pr_price_to);
            const isNameMatch = !pr_name || item.pr_name?.toLocaleLowerCase().includes(prNameLower);
            return isPriceMatch && isNameMatch;
        });
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    lockProduct(machineDetailIdList: number[], isLock: boolean) {
        const { machineDetailSelected } = this.props;

        machineDetailIdList.forEach(id => {
            const selectedMachineDetail = machineDetailSelected.find(item => item.ma_de_id === id);

            if (!selectedMachineDetail) return;

            const { dr_type } = selectedMachineDetail;
            if (dr_type === eDrinkType.Do_tuoi.num) {
                const refillDetail = this.refillMachineDetail?.find(refill => refill.ma_de_id === id);
                if (refillDetail) refillDetail.isError = isLock;
            } else if (dr_type === eDrinkType.Do_dong_chai.num) {
                const vendingDetail = this.vendingMachineDetail?.find(vending => vending.ma_de_id === id);
                if (vendingDetail) vendingDetail.isError = isLock;
            }
        });

        this.setState({ isLoadDone: !this.state.isLoadDone });
    }


    getPaginatedProducts() {
        const { currentPage, pageSize } = this.state;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return this.listProductDetail.slice(start, end).sort((a, b) => a.pr_price - b.pr_price);
    }

    handleChange = (e) => {
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        this.setState({ money: onlyNumbers });
    };

    render() {
        const { layoutListResult } = stores.layoutStore;
        const isLayoutFromMachine = this.props.machineDetailSelected && this.props.machineDetailSelected.length > 0;
        return (
            <>
                <Row gutter={8} className='product-list'>
                    <Col span={10}>
                        <Card
                            className='product-list__card'
                            onDrop={(e) => this.handleDrop(e, new MachineDetailDto())}
                            onDragOver={this.handleDragOver}
                        >
                            <Row gutter={[8, 8]} className='product-list__row product-list__row--margin-bottom'>
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
                            <Row gutter={4}>
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
                                        total={this.listProductDetail.length}
                                        onChange={this.handlePageChange}
                                        onShowSizeChange={this.onShowSizeChange}
                                        pageSizeOptions={pageSizeOptions}
                                        showTotal={total =>
                                            <span>Tổng <strong style={{ color: '#389e0d' }}>{total}</strong> sản phẩm</span>
                                        }
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={14}>
                        <Card style={{ overflowX: "auto" }}>
                            <Row style={{ marginBottom: 8 }}>
                                <Col span={10}>
                                    <h3><strong>{'Bố cục ' + this.props.ma_name}</strong></h3>
                                </Col>
                                <Col span={14} style={{ textAlign: 'right' }}>
                                    {this.isGranted(AppConsts.Permission.Pages_Manager_General_MachineDetail_Update) &&
                                        <Space>
                                            <Button title='Lưu' type='primary' onClick={this.onCreateUpdate}>Lưu</Button>
                                            <Button title='Làm mới' danger type='primary' onClick={this.onClearLayout}>Làm mới</Button>
                                            {isLayoutFromMachine && <Button style={{ border: 'solid 1px #1da47a', color: '#1da47a' }} title='Tải lại dữ liệu' color='primary' onClick={this.onReset}>Tải lại</Button>}
                                        </Space>
                                    }
                                </Col>
                            </Row>
                            <Row style={{ marginBottom: 8 }}>
                                <Col>
                                    <Space>
                                        {isLayoutFromMachine && <Button title='Bố cục mẫu' icon={<BorderlessTableOutlined />} type='primary' onClick={() => { this.setState({ openModal: true }) }}></Button>}
                                        {this.isGranted(AppConsts.Permission.Pages_Manager_General_MachineDetail_Update) &&
                                            <Space>
                                                {(isLayoutFromMachine && this.listMachineDetailSelect.length > 0)
                                                    && <Button title='Thiết lập giá' icon={<DollarOutlined />} type='primary' onClick={() => this.setState({ visibleModalSetPrice: true })}></Button>}
                                                {(isLayoutFromMachine && this.listMachineDetailSelect.length > 0)
                                                    && <Button title='Khóa' icon={<LockOutlined />} type='primary' onClick={() => this.lockProduct(this.listMachineDetailSelect, true)}></Button>}
                                                {(isLayoutFromMachine && this.listMachineDetailSelect.length > 0)
                                                    && <Button title='Mở khóa' icon={<UnlockOutlined />} type='primary' onClick={() => this.lockProduct(this.listMachineDetailSelect, false)}></Button>}
                                            </Space>
                                        }
                                    </Space>
                                </Col>
                            </Row>
                            {this.props.ma_commandRefill !== eMainBoard.NONE.num ?
                                <>
                                    <Row><span className='product-list__title'>REFILL</span></Row>
                                    <Space
                                        className='layout'
                                        key={"refill_row"}
                                    >
                                        {this.refillMachineDetail!.map((item, index) => (
                                            <div
                                                key={`refill_row_${index}`}
                                                className='layout__block'
                                                onMouseEnter={() => this.handleMouseEnter(item.ma_de_id)}
                                                onMouseLeave={this.handleMouseLeave}
                                                onDragStart={(e) => this.handleDragStart(e, new ProductDetailDto(item.productDto, item), item.ma_de_id)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => this.handleDrop(e, item)}
                                                draggable={!!item}
                                                style={{
                                                    backgroundColor: this.listMachineDetailSelect.includes(item.ma_de_id) ? 'aliceblue' : 'white',
                                                    border: item.isError ? "2px solid red" : "2px solid darkgray",
                                                    opacity: item.isError ? 0.5 : 1,
                                                }}
                                            >
                                                <div onClick={() => this.onSelectMachineDetail(item.ma_de_id)}>
                                                    <ItemProductDetail
                                                        machineDetail={item}
                                                        slot={item.ma_de_slot_id + 1}
                                                        isLayoutDeleted={item.ma_de_is_deleted}
                                                        isMachineGridLayout={true}
                                                        productDetail={new ProductDetailDto(item.productDto, item)}
                                                    />
                                                </div>
                                                {this.state.hovered_ma_de_id === item.ma_de_id && isLayoutFromMachine && (
                                                    <>
                                                        <Tooltip title={item.isError ? "Mở khoá" : "Khoá"}>
                                                            <button onClick={() => this.lockProduct([item.ma_de_id], !item.isError)}
                                                                className='layout__button layout__button--lock'
                                                            >
                                                                {item.isError ? <UnlockTwoTone style={{ fontSize: 16 }} twoToneColor='#AD6800' /> : <LockTwoTone style={{ fontSize: 16 }} twoToneColor='#AD6800' />}
                                                            </button>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </Space>
                                </> : ""
                            }

                            <Row><span className='product-list__title'>VENDING</span></Row>
                            {this.state.layoutVending.map((_cols, rowIndex) => (
                                <Space
                                    className='layout'
                                    key={`vending_row_${rowIndex}`}
                                >
                                    {this.vendingMachineDetail!.slice(
                                        rowIndex === 0
                                            ? 0
                                            : this.state.layoutVending.slice(0, rowIndex).reduce((a, b) => a + b, 0),
                                        this.state.layoutVending.slice(0, rowIndex + 1).reduce((a, b) => a + b, 0)
                                    ).map((item, colIndex) => (
                                        <div
                                            className='layout__block'
                                            key={`vending_col_${colIndex}`}
                                            onMouseEnter={() => this.handleMouseEnter(item.ma_de_id)}
                                            onMouseLeave={this.handleMouseLeave}
                                            onDragStart={(e) => this.handleDragStart(e, new ProductDetailDto(item.productDto, item), item.ma_de_id)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => this.handleDrop(e, item)}
                                            draggable={!!item}
                                            style={{
                                                backgroundColor: this.listMachineDetailSelect.includes(item.ma_de_id) ? 'aliceblue' : 'white',
                                                border: item.isError ? "2px solid red" : "2px solid darkgray",
                                                opacity: item.isError ? 0.5 : 1,
                                            }}
                                        >
                                            <div onClick={() => this.onSelectMachineDetail(item.ma_de_id)}>
                                                <ItemProductDetail
                                                    machineDetail={item}
                                                    slot={item.ma_de_slot_id + 1}
                                                    isLayoutDeleted={item.ma_de_is_deleted}
                                                    isMachineGridLayout={true}
                                                    productDetail={new ProductDetailDto(item.productDto, item)}
                                                />
                                            </div>
                                            {this.state.hovered_ma_de_id === item.ma_de_id && isLayoutFromMachine && (
                                                <Tooltip title={item.isError ? "Mở khoá" : "Khoá"}>
                                                    <button
                                                        className='layout__button layout__button--lock'
                                                        onClick={() => this.lockProduct([item.ma_de_id], !item.isError)}
                                                    >
                                                        {item.isError ? <UnlockTwoTone style={{ fontSize: 16 }} twoToneColor='#AD6800' /> : <LockTwoTone style={{ fontSize: 16 }} twoToneColor='#AD6800' />}
                                                    </button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    ))}
                                </Space>
                            ))}
                        </Card>
                    </Col>
                </Row >
                <Modal
                    centered
                    width={"80vw"}
                    title={"Bố cục mẫu"}
                    visible={this.state.openModal}
                    onCancel={() => this.setState({ openModal: false })}
                    footer={null}
                    destroyOnClose={true}
                    maskClosable={true}
                >
                    <ExampleLayout
                        listProduct={this.props.listProductDetail}
                        onCancel={() => this.setState({ openModal: false })}
                        onSuccess={item => this.onUsedLayout(item)}
                        layoutListResult={layoutListResult}
                    />
                </Modal>
                <Modal
                    centered
                    title={<h2>Thiết lập giá bán</h2>}
                    width={"30vw"}
                    visible={this.state.visibleModalSetPrice}
                    onCancel={() => this.setState({ visibleModalSetPrice: false })}
                    footer={null}
                    destroyOnClose={true}
                    maskClosable={true}
                    closable={false}
                >
                    <Row align='middle'>
                        <Col span={6}>{"Giá bán"}:</Col>
                        <Col span={16}>
                            <Input
                                maxLength={6}
                                style={{ width: 'auto' }}
                                placeholder={"Giá"}
                                value={this.state.money}
                                onChange={this.handleChange}
                            />
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 10, display: "flex", flexDirection: "row" }}>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Button danger onClick={() => this.setState({ visibleModalSetPrice: false })}>{("Hủy")}</Button>
                            &nbsp;&nbsp;
                            <Button type="primary" onClick={this.updateMachineDetailMoney}>{"Xác nhận"}</Button>
                        </Col>
                    </Row>
                </Modal>
            </>
        );
    }
}

