import AppConsts, { FileUploadType } from "@src/lib/appconst";
import { Button, Card, Checkbox, Col, Form, Input, Row, Tree, message } from "antd";
import React from "react";
import { AttachmentItem, MachineSoftDto, CreateMachineSoftInput, UpdateMachineSoftInput } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import FileAttachments from "@src/components/FileAttachments";
import rules from "@src/scenes/Validation";

export interface IProps {
    onCancel?: () => void;
    onSuccess?: () => void;
    machineSoftSelected: MachineSoftDto,
    machineSoftListResult?: MachineSoftDto[],
}
const { TreeNode } = Tree;
const { Search } = Input;
export default class CreateOrUpdateMachineSoft extends AppComponentBase<IProps> {
    private formRef: any = React.createRef();
    state = {
        isLoadDone: false,
        idSelected: -1,
        isActive: false,
        selectedValues: [],
        ma_so_id: undefined,
        ma_so_version_name: "",
        ma_so_version_code: undefined,
        isLoadFile: false,
        isDownload: undefined,
        showRemoveIcon: undefined,
        searchValue: '',
        expandedKeys: [],
        autoExpandParent: true,
        checkedKeys: [],
        selectedKeys: [],
    }
    machineSoftSelected: MachineSoftDto;
    attachmentItem: AttachmentItem = new AttachmentItem();

    async componentDidMount() {
        if (this.isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Machine)) {
            await stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        }
        else await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);

        await this.initData(this.props.machineSoftSelected);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.machineSoftSelected != undefined && nextProps.machineSoftSelected.ma_so_id !== prevState.idSelected) {
            return ({ idSelected: nextProps.machineSoftSelected.ma_so_id });
        }
        return null;
    }
    async componentDidUpdate(prevProps, prevState) {
        if (this.state.idSelected !== prevState.idSelected) {
            await this.setState({ selectedValues: [] })
            this.initData(this.props.machineSoftSelected);
        }
    }
    onCancel() {
        if (this.props.onCancel !== undefined) {
            this.props.onCancel();
        }
    }

    initData = async (input: MachineSoftDto) => {
        await this.setState({ isLoadDone: false });
        if (input.ma_so_id !== undefined) {
            this.attachmentItem = (input.fi_id === undefined) ? new AttachmentItem : input.fi_id;
            this.setState({
                ma_so_version_name: input.ma_so_version_name,
                ma_so_version_code: input.ma_so_version_code,
                selectedValues: input.machineSoftLogs?.map(record => record.ma_so_lo_ma_id.toString())
            });
            this.formRef.current.setFieldsValue({ ...input });
        }
        else {
            this.formRef.current.resetFields();
            this.attachmentItem = (input.fi_id === undefined) ? new AttachmentItem : input.fi_id;
        }
        await this.setState({ isLoadDone: true, isLoadFile: !this.state.isLoadFile })
    }
    onCreateUpdate = async () => {
        const { machineSoftSelected } = this.props;
        const form = this.formRef.current;
        await this.setState({ isLoadDone: false });
        form!.setFieldsValue({ fi_id_list: this.attachmentItem, ma_id_list: this.state.selectedValues });
        form!.validateFields().then(async (values: any) => {
            if (machineSoftSelected.ma_so_id === undefined) {
                this.setState({ isDownload: false, showRemoveIcon: true })
                let unitData = new CreateMachineSoftInput({ ...values });
                unitData.fi_id = this.attachmentItem;
                unitData.ma_so_version_name = this.state.ma_so_version_name;
                unitData.ma_so_version_code = this.state.ma_so_version_code ?? 0;
                unitData.ma_id_list = this.state.selectedValues.filter(item => !isNaN(Number(item)) && Number(item));
                if (!!this.attachmentItem.id) {
                    await stores.machineSoftStore.createMachineSoft(unitData)
                    await this.onSuccess();
                    message.success("Thêm mới bản cập nhật thành công!")
                } else {
                    message.error("Bản cập nhật chưa có file!")
                }
            }
            else {
                this.setState({ isDownload: true, showRemoveIcon: true })
                let unitData = new UpdateMachineSoftInput({ ma_so_id: machineSoftSelected.ma_so_id, ...values });
                unitData.fi_id = this.attachmentItem;
                unitData.ma_so_version_name = this.state.ma_so_version_name;
                unitData.ma_so_version_code = this.state.ma_so_version_code ?? 0;
                unitData.ma_id_list = this.state.selectedValues.filter(item => !isNaN(Number(item)) && Number(item));
                if (!!this.attachmentItem.id) {
                    await stores.machineSoftStore.updateMachineSoft(unitData);
                    await this.onSuccess();
                    message.success("Chỉnh sửa thành công!")
                } else {
                    message.error("Bản cập nhật chưa có file!")
                }
            }
        })
        await this.setState({ isLoadDone: true, isLoadFile: !this.state.isLoadFile });
    };

    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }

    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }
    handleTreeSelectChange = async (selectedValues) => {
        await this.setState({ selectedValues: selectedValues });
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
    onSearchChange = e => {
        const { value } = e.target;
        this.setState({
            searchValue: value,
            expandedKeys: [],
            autoExpandParent: true,
        });
    };
    onCheckAllChange = checked => {
        const { treeMachine } = stores.machineStore;
        const checkedKeys = checked ? this.getAllKeys(treeMachine) : [];
        this.setState({ selectedValues: checkedKeys });
    };
    getAllKeys = (data: any[]): (string | number)[] => {
        let keys: (string | number)[] = [];
        data.forEach(item => {
            keys.push(item.key);
            if (item.children) {
                keys = keys.concat(this.getAllKeys(item.children));
            }
        });
        return keys;
    };
    render() {
        let self = this;
        const { machineSoftSelected, machineSoftListResult } = this.props;
        let machineSoftList = machineSoftListResult?.slice();
        if (!!machineSoftSelected && machineSoftSelected.ma_so_id != undefined) {
            machineSoftList = machineSoftListResult!.filter(item => item.ma_so_id !== machineSoftSelected.ma_so_id);
        }
        const { treeMachine } = stores.machineStore;
        const isUpdate = machineSoftSelected.ma_so_id != undefined && machineSoftSelected.machineSoftLogs && machineSoftSelected.machineSoftLogs.filter(item => item.ma_so_lo_upgrade_at != null).length > 0
            ? true
            : false;
        return (
            <Card>
                <Row gutter={[8,8]}>
                    <Col span={16}>
                        <h2>{isUpdate ? "Xem chi tiết phiên bản cập nhật" : machineSoftSelected.ma_so_id ? "Chỉnh sửa phiên bản cập nhật" : "Thêm mới bản cập nhật"}</h2>
                    </Col>
                    <Col span={8} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "right" }}>
                        {(!isUpdate || machineSoftSelected.ma_so_id == undefined) && <Button type="primary" onClick={async () => await this.onCreateUpdate()}>Lưu</Button>}
                        <Button danger onClick={() => this.onCancel()}>Hủy</Button>
                    </Col>
                </Row>
                <Row>
                    <Form ref={this.formRef} style={{ width: "100%" }}>
                        <Form.Item
                            label="Phiên bản cập nhật"
                            {...AppConsts.formItemLayout}
                            name={"ma_so_version_code"}
                            rules={[
                                rules.required,
                            ]}
                        >

                            <Input
                                value={this.state.ma_so_version_code}
                                maxLength={5}
                                disabled={isUpdate}
                                onChange={(e) => this.setState({ ma_so_version_code: e.target.value.trim() })}></Input>
                        </Form.Item>
                        <Form.Item initialValue="v" label="Mã phiên bản cập nhật" {...AppConsts.formItemLayout} name={"ma_so_version_name"} rules={[rules.maxCodeBank, rules.noAllSpaces, rules.required, rules.maxLengthLayout, ({ getFieldValue }) => ({
                            validator(_, value) {
                                const isMachineSoft = machineSoftList!.some(item => item!.ma_so_version_name!.trim().toLowerCase() === value.trim().toLowerCase());
                                if (!value || !isMachineSoft) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mã phiên bản đã tồn tại!'));
                            }
                        })]}>
                            <Input
                                maxLength={10}
                                disabled={isUpdate}
                                onChange={(e) => { this.setState({ ma_so_version_name: e.target.value }); }}></Input>
                        </Form.Item>

                        <Form.Item label="File" name={"fi_id_list"} {...AppConsts.formItemLayout} rules={[rules.required]} >
                            <FileAttachments
                                files={[self.attachmentItem]}
                                isLoadFile={this.state.isLoadFile}
                                allowRemove={true}
                                isMultiple={false}
                                componentUpload={FileUploadType.Update}
                                onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                    self.attachmentItem = itemFile[0];
                                }}
                                isDownload={true}
                                showRemoveIcon={!isUpdate}
                            />
                        </Form.Item>
                        <Form.Item label="Chọn máy" {...AppConsts.formItemLayout} name={'ma_id_list'} rules={[rules.required]} >
                            <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onSearchChange} allowClear />
                            {this.state.searchValue == '' &&
                                <Checkbox
                                    indeterminate={this.state.selectedValues.length > 0 && this.state.selectedValues.length < this.getAllKeys(treeMachine).length}
                                    checked={this.state.selectedValues.length === this.getAllKeys(treeMachine).length}
                                    onChange={e => this.onCheckAllChange(e.target.checked)}
                                    disabled={isUpdate}
                                >
                                    Chọn tất cả
                                </Checkbox>
                            }
                            <Tree
                                disabled={isUpdate}
                                checkable
                                onCheck={this.handleTreeSelectChange}
                                checkedKeys={this.state.selectedValues}
                                onExpand={keys => {
                                    this.setState({
                                        expandedKeys: keys,
                                        autoExpandParent: false,
                                    });
                                }}
                            >
                                {this.renderTreeNodes(treeMachine)}
                            </Tree>
                        </Form.Item>

                    </Form>
                </Row>
            </Card >
        )
    }
}