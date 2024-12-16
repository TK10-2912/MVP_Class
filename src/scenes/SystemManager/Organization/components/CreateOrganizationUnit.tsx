import { L } from "@src/lib/abpUtility";
import AppConsts from "@src/lib/appconst";
import { CreateOrganizationUnitInput, OrganizationUnitDto, UpdateOrganizationUnitInput } from "@src/services/services_autogen";
import { TreeOrganizationDto } from "@src/stores/organizationStore";
import { Col, Row, Button, Card, message, Form, Input, TreeSelect } from "antd";
import * as React from "react"
import rules from "./CreateOrganizationUnit.validation";
import { stores } from "@src/stores/storeInitializer";

export interface IProps {
    onCreateUpdateSuccess?: (borrowOrDt: OrganizationUnitDto) => void;
    onCancel: () => void;
    organizationSelected: OrganizationUnitDto;
    treeOrganization: TreeOrganizationDto[];

}
export default class CreatOrUpdateOrganization extends React.Component<IProps>
{
    private formRef: any = React.createRef();
    state = {
        isLoadDone: false,
        or_id: -1,
        or_id_parent: undefined,
    }
    organizationSelected: OrganizationUnitDto = new OrganizationUnitDto();

    async componentDidMount() {
        this.setState({ or_id_parent: this.organizationSelected.id })
        await this.initData(this.props.organizationSelected)
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.organizationSelected.id !== prevState.or_id || nextProps.organizationSelected.parentId !== prevState.or_id_parent) {
            return { or_id: nextProps.organizationSelected.id, or_id_parent: nextProps.organizationSelected.parentId };
        }
        return null;
    }


    async componentDidUpdate(prevProps, prevState) {
        if (this.state.or_id !== prevState.or_id || this.state.or_id_parent !== prevState.or_id_parent) {
            await this.initData(this.props.organizationSelected);
        }
    }

    initData = async (inputOrganization: OrganizationUnitDto | undefined) => {
        this.setState({ isLoadDone: false });
        if (inputOrganization != undefined) {
            this.organizationSelected = inputOrganization;
        } else {
            this.organizationSelected = new OrganizationUnitDto();
        }
        this.formRef.current!.setFieldsValue({
            ... this.organizationSelected,
        });

        this.setState({ isLoadDone: true });
    }

    onCreateUpdate = () => {
        const { organizationSelected } = this.props;
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if (organizationSelected.id === undefined) {
                let unitData = new CreateOrganizationUnitInput(values);
                unitData.parentId = this.state.or_id_parent!;
                await stores.organizationStore.createOragnizationUnit(unitData)
                message.success(L("Thêm mới thành công"));
            } else {
                let unitData = new UpdateOrganizationUnitInput({ id: organizationSelected.id, ...values });
                await stores.organizationStore.updateOrganizationUnit(unitData)
                message.success(L("Chỉnh sửa thành công"));
            }
            await this.onCreateUpdateSuccess();
            this.setState({ isLoadDone: true });
        })
    };

    onCreateUpdateSuccess = () => {
        if (!!this.props.onCreateUpdateSuccess) {
            this.props.onCreateUpdateSuccess(this.organizationSelected);
        }
    }

    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }

    render() {
        const { treeOrganizationDto } = stores.organizationStore;
        console.log(11111, this.organizationSelected);

        const self = this
        return (
            <>
                <Card >
                    <Row gutter={16} style={{ margin: "10px 0" }}>
                        <Col span={16}><h3>{this.state.or_id === undefined ? L("Thêm mới") : L('Chỉnh sửa tổ chức') + ": " + this.organizationSelected.displayName}</h3>
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            <Button danger onClick={() => this.onCancel()}>
                                {L("Huỷ")}
                            </Button> &nbsp;
                            <Button type="primary" onClick={() => this.onCreateUpdate()}>
                                {L("Lưu")}
                            </Button>
                        </Col>
                    </Row>
                    <Form ref={this.formRef}>
                        <Form.Item label={L('Tên tổ chức ')} {...AppConsts.formItemLayout} rules={rules.displayName} name={'displayName'}  >
                            <Input />
                        </Form.Item>
                        {(this.organizationSelected.parentId != null && this.organizationSelected.parentName != "") &&
                            <Form.Item label={L('Trực thuộc')} {...AppConsts.formItemLayout} name={'parentId'} >
                                {/* <TreeSelect
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    disabled
                                    treeData={[treeOrganizationDto]}
                                    treeDefaultExpandAll
                                    onSelect={async (value, node) => {
                                        await this.setState({ organization_parent_id: node.id });
                                    }}
                                /> */}
                                <span>{this.organizationSelected.parentName}</span>
                            </Form.Item>
                        }
                    </Form>
                </Card >
            </>
        )
    }
}