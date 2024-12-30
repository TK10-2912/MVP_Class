import * as React from 'react';
import {
  DeleteFilled,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import AppConsts, {
  EventTable,
  cssCol,
  cssColResponsiveSpan,
  pageSizeOptions,
} from '@src/lib/appconst';
import { ImageProductDto, ProductDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, Space, message } from 'antd';
import { L, isGranted } from '@src/lib/abpUtility';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import UpdateModal from './component/UpdateModal';
import CreateModal from './component/CreateModal';
import ProductTable from './component/ProductTable';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eSort, eStatusProduct } from '@src/lib/enumconst';
import Export from './component/Export';
import debounce from 'lodash.debounce';
const { confirm } = Modal;

export default class index extends React.Component {
  debounceSearch: () => void;
  constructor(props) {
    super(props);
    this.debounceSearch = debounce(() => { }, 500);
  }
  state = {
    isLoadDone: false,
    visibleModalCreateUpdate: false,
    visibleExportExcelFreshDrink: false,
    visibleModalImport: false,
    visibleModalSelect: true,
    pr_name: undefined,
    us_id_list: undefined,
    su_id_list: undefined,
    skipCount: 0,
    maxResultCount: 10,
    onChangePage: 1,
    currentPage: 1,
    pageSize: 10,
    clicked: false,
    numberSelected: 0,
    select: false,
    status: undefined,
    sort: undefined,
    visibleImportExcelProduct: undefined,
  };
  productSelected: ProductDto = new ProductDto();
  listItemProduct: ProductDto[] = [];
  keySelected: number[] = [];
  listIdImage: number[] = [];
  selectedField: string;

  async componentDidMount() {
    stores.imageProductStore.getAll(undefined, undefined, undefined);
    await this.getAll();
  }

  rowSelection: TableRowSelection<ProductDto> = {
    onChange: async (_listItemProduct: React.Key[], listItem: ProductDto[]) => {
      this.setState({ isLoadDone: false });
      this.listItemProduct = listItem;

      this.keySelected = listItem.map((item) => item.pr_id);
      await this.setState({ select: !!this.listItemProduct.length });
      this.setState({ isLoadDone: true, numberSelected: listItem.length });
    },
  };
  async getAll() {
    this.setState({ isLoadDone: false });
    await stores.productStore.getAll(
      this.state.pr_name,
      this.state.status,
      this.state.su_id_list,
      this.selectedField,
      this.state.sort,
      this.state.skipCount,
      this.state.pageSize
    );
    this.setState({ isLoadDone: true });
  }
  onUpdateSuccess = () => {
    this.setState({ isLoadDone: false });
    this.getAll();
    this.setState({ isLoadDone: true, })
  }
  showCreateOrUpdateModel = async (input: ProductDto) => {
    if (input !== undefined && input !== null) {
      this.productSelected.init(input);
      await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
    }
  };
  handleVisibleChange = (visible) => {
    this.setState({ clicked: visible });
  }
  onCreateUpdateSuccess = () => {
    this.setState({ visibleModalCreateUpdate: false });
    this.getAll();
  };

  actionTable = async (product: ProductDto, event: EventTable) => {
    if (event === EventTable.Delete) {
      this.productSelected.init(product);
      let title = (
        <div>
          Bạn có chắc muốn xóa sản phẩm: <strong>{product.pr_name}</strong>.
        </div>
      );
      confirm({
        title: title,
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
          await stores.productStore.delete(product);
          await this.getAll();
          message.success('Xóa thành công !');
        },
        onCancel() { },
      });
    }
  };
  render() {
    const { productListResult, totalProduct } = stores.productStore;
    const left = this.state.visibleModalCreateUpdate
      ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14)
      : cssCol(24);
    const right = this.state.visibleModalCreateUpdate
      ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10)
      : cssCol(0);

    if (!productListResult) {
      console.log('productList empty');
    }

    return (
      <Card>
        <>
          <Row style={{ marginBottom: 8 }} gutter={[8, 8]} align="bottom">
            <Col {...cssColResponsiveSpan(24, 24, 12, 12, 12, 3)} order={1}>
              <h2>Sản phẩm</h2>
            </Col>
            <Col
              xs={{ span: 24, order: 2 }}
              sm={{ span: 24, order: 2 }}
              md={{ span: 12, order: 2 }}
              lg={{ span: 12, order: 2 }}
              xl={{ span: 12, order: 2 }}
              xxl={{ span: 8, order: 5 }}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Space>
                {isGranted(AppConsts.Permission.Pages_Manager_General_Product_Create) && (
                  <Button
                    type="primary"
                    title="Thêm mới"
                    icon={<PlusOutlined />}
                    onClick={() => this.showCreateOrUpdateModel(new ProductDto())}
                  >
                    {'Thêm mới'}
                  </Button>
                )}
                {isGranted(AppConsts.Permission.Pages_Manager_General_Product_Export) && (
                  <Button
                    type="primary"
                    title="Xuất dữ liệu"
                    icon={<ExportOutlined />}
                    onClick={() => this.setState({ visibleExportExcelFreshDrink: true })}
                  >
                    {'Xuất dữ liệu'}
                  </Button>
                )}
                {isGranted(AppConsts.Permission.Pages_Manager_General_Product_Export) && (
                  <Button
                    type="primary"
                    title="Nhập dữ liệu"
                    icon={<ImportOutlined />}
                    onClick={() => this.setState({ visibleExportExcelFreshDrink: true })}
                  >
                    {'Nhập dữ liệu'}
                  </Button>
                )}
              </Space>
            </Col>
            {this.state.visibleExportExcelFreshDrink && (
              <Export
                productListResult={this.state.select ? this.listItemProduct : productListResult}
                visible={this.state.visibleExportExcelFreshDrink}
                onCancel={() => this.setState({ visibleExportExcelFreshDrink: false })}
                noScroll={true}
              />
            )}
          </Row>

          <Row gutter={[8, 8]} align='bottom'>
            {this.state.visibleModalCreateUpdate == false &&
              <>
                <Col span={12}>
                  <Badge count={this.state.numberSelected}>

                  </Badge>
                </Col>
              </>
            }
          </Row>

          <Row>
            <Col {...left}>
              <ProductTable
                rowSelection={this.rowSelection}
                actionTable={this.actionTable}
                hasAction={this.keySelected.length > 0 ? false : true}
                productListResult={productListResult}
                checkExpand={this.state.visibleModalCreateUpdate}
                isLoadDone={this.state.isLoadDone}
                formatImage={false}
                onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                isPrint={false}
                onUpdateSuccess={() => { this.onUpdateSuccess(); this.setState({ visibleModalCreateUpdate: false }); }}
                pagination={{
                  pageSize: this.state.pageSize,
                  current: this.state.currentPage,
                }}
              />
            </Col>
            <Col {...right}>
              {this.state.visibleModalCreateUpdate &&
                (this.productSelected.pr_id ? (
                  // <UpdateModal
                  //   productSelected={this.productSelected}
                  //   // onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                  //   onCreateUpdateSuccess={this.onCreateUpdateSuccess}
                  //   productListResult={productListResult}
                  //   layoutDetail={true}
                  // />
                  <></>
                ) : (
                  <CreateModal
                    productListResult={productListResult}
                    onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                    onCreateUpdateSuccess={this.onCreateUpdateSuccess}
                    productSelected={this.productSelected}
                    layoutDetail={false}
                  />
                ))}
            </Col>
          </Row>
        </>
      </Card>
    );
  }
}
