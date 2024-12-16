import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { AttachmentItem, CreateHandoverInput, CreateImportRepositoryInput, HandoverDto, ImportRepositoryDto, ProductHandoverInput, ProductImportDto, ProductInRepositoryAbtractDto, RepositoryDto, UpdateHandoverInput, UpdateImportRepositoryInput } from '@src/services/services_autogen';
import { Button, Card, Col, Form, Input, Row, Space, Tag, Tree, message } from 'antd';
import * as React from 'react';
import { CheckCircleOutlined, CloseOutlined, DeleteColumnOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import Paragraph from 'antd/lib/typography/Paragraph';
import { FormInstance } from 'antd/lib/form';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import { stores } from '@src/stores/storeInitializer';
import TextArea from 'antd/lib/input/TextArea';
import rules from '@src/scenes/Validation';
import SelectUser from '@src/components/Manager/SelectUser';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eHandoverStatus, eHandoverType } from '@src/lib/enumconst';
import { ListProductHandOver } from './CreateHandover';
import { isGranted } from '@src/lib/abpUtility';
import SelectRepositoryImport from '@src/components/Manager/SelectRepositoryImport';

export interface IProps {
    handoverSelected?: HandoverDto,
    listProductImport?: ListProductHandOver[];
    onCancel?: () => void;
    onSuccess?: () => void;
    onChangeRepository?: (re_id: number) => void;
}
const { TreeNode } = Tree;
const { Search } = Input;
export default class CreateOrUpdateHandover extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        ha_status: undefined,
        saveType: 0,
        import: moment(),
        isLoadFile: false,
        searchValue: '',
        selectedValues: [],
        expandedKeys: [],
        autoExpandParent: true,
        checkedKeys: [],
        selectedKeys: [],
        us_id: stores.sessionStore.getUserLogin().id!,
        us_id_handover: undefined,
        re_id:undefined,
    }
    listAttachmentItem_file: AttachmentItem[] = [];
    handoverSelected: HandoverDto = new HandoverDto();
    componentDidMount() {
        this.initData(this.props.handoverSelected)
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    onCreateUpdate = () => {

        const { handoverSelected, listProductImport } = this.props;
        this.setState({ isLoadDone: false });

        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if (handoverSelected?.ha_id === undefined || handoverSelected.ha_id < 0) {
                let unitData = new CreateHandoverInput({ ...values });
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.handover_user = this.state.us_id!;
                let ma_id_list = this.state.selectedValues.filter(item => !isNaN(Number(item)) && Number(item));
                let listProduct: ProductHandoverInput[] = [];
                listProductImport?.map(item => {
                    let x = new ProductHandoverInput();
                    x.pr_id = item.pr_id;
                    x.pr_quantity = item.pr_quantity;
                    listProduct.push(x);
                })
                unitData.productHandoverInputs = listProduct;
                unitData.ha_type = (listProduct.length === 0 && ma_id_list.length === 0)
                    ? eHandoverType.NONE.num
                    : (listProduct.length > 0 && ma_id_list.length === 0)
                        ? eHandoverType.HANDOVER_ONLYPRODUCT.num
                        : (listProduct.length === 0 && ma_id_list.length > 0)
                            ? eHandoverType.HANDOVER_ONLYMACHINE.num
                            : eHandoverType.HANDOVER_BOTH.num;
                unitData.ma_id_list = ma_id_list;
                unitData.ha_status = this.state.ha_status!;
                await stores.handoverStore.createHandover(unitData);
                await this.onSuccess();
                await this.onCancel();
                message.success("Thêm mới thành công!");
            }
            else {
                let unitData = new UpdateHandoverInput({ ...values });
                unitData.handover_user = this.state.us_id!
                unitData.ha_id = handoverSelected.ha_id;
                unitData.fi_id_list = this.listAttachmentItem_file;
                let ma_id_list = this.state.selectedValues.filter(item => !isNaN(Number(item)) && Number(item));
                let listProduct: ProductHandoverInput[] = [];
                listProductImport?.map(item => {
                    let x = new ProductHandoverInput();
                    x.pr_id = item.pr_id;
                    x.pr_quantity = item.pr_quantity;
                    listProduct.push(x);
                })
                unitData.productHandoverInputs = listProduct;
                unitData.ha_type = (listProduct.length === 0 && ma_id_list.length === 0)
                    ? eHandoverType.NONE.num
                    : (listProduct.length > 0 && ma_id_list.length === 0)
                        ? eHandoverType.HANDOVER_ONLYPRODUCT.num
                        : (listProduct.length === 0 && ma_id_list.length > 0)
                            ? eHandoverType.HANDOVER_ONLYMACHINE.num
                            : eHandoverType.HANDOVER_BOTH.num;
                unitData.ma_id_list = ma_id_list;
                unitData.ha_status = this.state.ha_status!;
                await stores.handoverStore.updateHandover(unitData);
                await this.onSuccess();
                await this.onCancel();
                message.success("Cập nhật thành công!");

            }
            await stores.sessionStore.getCurrentLoginInformations();
            this.setState({ isLoadDone: true });
        })
    };


    initData = async (handoverSelected: HandoverDto | undefined) => {
        this.setState({ isLoadDone: false });
        if (handoverSelected !== undefined && handoverSelected.ha_id !== undefined) {
            this.handoverSelected = handoverSelected!;
            this.setState({ isLoadDone: !this.state.isLoadDone });
            if (handoverSelected.fi_id_list != undefined) {
                this.listAttachmentItem_file = handoverSelected.fi_id_list;
                await this.setState({ isLoadFile: !this.state.isLoadFile })
            }
            if (handoverSelected.handover_user != undefined) {
                await this.setState({ us_id: handoverSelected.handover_user });
                // this.onChangeUser(this.state.us_id!);
            }
            if (handoverSelected.receive_user != undefined) {
                await this.setState({ us_id_handover: handoverSelected.receive_user })
            }
            if (handoverSelected.ha_status != undefined) {
                this.setState({ ha_status: handoverSelected.ha_status })
            }
            if (!!handoverSelected.ma_id_list && handoverSelected.ma_id_list.length > 0) {
                this.setState({ selectedValues: handoverSelected.ma_id_list.map(String) });
            }
            this.formRef.current!.setFieldsValue(handoverSelected);
            this.setState({ isLoadDone: !this.state.isLoadDone });
        } else {
            this.setState({ pr_unit: undefined, su_id: undefined })
            this.listAttachmentItem_file = [];
            this.formRef.current!.resetFields();
        }
        this.setState({ isLoadDone: true });
    }
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
    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }
    onSearchChange = e => {
        const { value } = e.target;
        this.setState({
            searchValue: value,
            expandedKeys: [],
            autoExpandParent: true,
        });
    };
    handleTreeSelectChange = (selectedValues) => {
        this.setState({ selectedValues: selectedValues });
        this.formRef.current!.setFieldsValue({ ma_id_list: selectedValues })
    }
    onChangeRepository = (re_id: number) => {
        if (!!this.props.onChangeRepository) {
            this.props.onChangeRepository(re_id);
        }
    }
    render() {
        const height = window.innerHeight;
        let treeMachineHandover = stores.sessionStore.getAllTreeMachinesWithGroupMachine(this.state.us_id);
        const self = this;
        return (
            <Card className='heightWindow' style={{ height: `${height} !important`, overflowY: "auto" }}>
                <Form
                    ref={this.formRef}
                    labelCol={{ span: 8 }}
                    style={{ width: '100%' }}>

                    <Form.Item
                        label={'Người bàn giao'}
                        name={'handover_user'}
                        // rules={isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Handover) ? [rules.required] : []}
                    >
                        {/* {isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Handover) ?
                            <SelectUser
                                us_id={this.state.us_id}
                                onChangeUser={async (e) => {
                                    await this.setState({ us_id: e });
                                    this.onChangeUser(e);
                                    await this.formRef.current!.setFieldsValue({ handover_user: e });
                                    this.formRef.current!.validateFields(['receive_user']);
                                }}
                            />
                            : stores.sessionStore.getUserNameById(stores.sessionStore.getUserLogin().id!)
                        } */}
                        {stores.sessionStore.getUserNameById(this.state.us_id!)}

                    </Form.Item>
                    <Form.Item
                        label={'Người nhận bàn giao'}
                        name={'receive_user'}
                        rules={[
                            rules.required,
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (value && value === getFieldValue('handover_user')) {
                                        return Promise.reject(new Error('Người nhận bàn giao không được trùng với Người bàn giao'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <SelectUser
                            us_id={this.state.us_id_handover}
                            onChangeUser={async (e) => {
                                await this.formRef.current!.setFieldsValue({ receive_user: e });
                                this.formRef.current!.validateFields(['handover_user']);
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label='Trạng thái bàn giao'
                        name={'ha_status'}
                        rules={[rules.required]}
                    >
                        <SelectEnum enum_value={this.state.ha_status} eNum={eHandoverStatus} onChangeEnum={async (e) => { this.setState({ ha_status: e }); await this.formRef.current!.setFieldsValue({ ha_status: e }) }} />
                    </Form.Item>
                    <Form.Item
                        label='Máy bán nước'
                    >
                        <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onSearchChange} allowClear />
                        <Tree
                            checkable
                            onCheck={this.handleTreeSelectChange}
                            checkedKeys={this.state.selectedValues}
                            onExpand={keys => {
                                this.setState({
                                    expandedKeys: keys,
                                    autoExpandParent: true,
                                });
                            }}
                        >
                            {this.renderTreeNodes(treeMachineHandover)}
                        </Tree>
                    </Form.Item>
                    <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'ha_note'} >
                        <TextArea maxLength={255} placeholder="Ghi chú..." allowClear rows={4}></TextArea>
                    </Form.Item>
                    <Form.Item label="Tệp đính kèm" name='fi_id_list' rules={[rules.required]}  >
                        <FileAttachmentsImages
                            isUpLoad={true}
                            maxLength={5}
                            files={self.listAttachmentItem_file}
                            isLoadFile={this.state.isLoadFile}
                            allowRemove={true}
                            isMultiple={true}
                            onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                self.listAttachmentItem_file = itemFile.slice(0, 5);
                                await this.formRef.current!.setFieldsValue({ fi_id_list: itemFile });
                                this.setState({ isLoadFile: !this.state.isLoadFile });
                            }}
                        />
                    </Form.Item>
                    <Row justify='center'>
                        <Button style={{ marginRight: "10px" }} type='ghost' danger icon={<CloseOutlined />} onClick={() => this.onCancel()}>Huỷ</Button>
                        <Button type='primary' htmlType="submit" icon={<CheckCircleOutlined />} onClick={() => this.onCreateUpdate()}>Lưu</Button>
                    </Row>
                </Form>
            </Card>
        )
    }
}
