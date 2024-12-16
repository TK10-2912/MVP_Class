import * as React from "react";
import { Modal, Tabs } from "antd";
import { OrganizationUnitDto } from "@src/services/services_autogen";
import TableOrganizationUser from "../OrganizationUser/TableUserOrganizationUnit";
import TableOrganizationRoles from "../OrganizationRoles/TableRolesOrganization";
import { L } from "@src/lib/abpUtility";

const TabPane = Tabs.TabPane;
const { confirm } = Modal;

export interface IProps {
    onCancel: () => void;
    organizationSuccess: () => void
    organizationUnitDto: OrganizationUnitDto;
}
export default class TabPanelOrganizationUnit extends React.Component<IProps> {

    state = {
        isLoadDone: false,
    }

    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    organizationSuccess = () => {
        if (!!this.props.organizationSuccess) {
            this.props.organizationSuccess();
        }
    }
    render() {
        return (

            <Tabs style={{ marginLeft: '10px' }} defaultActiveKey={'users'} >
                <TabPane key='users' tab={L("cac_thanh_vien")} >
                    <TableOrganizationUser
                        organizationUnitDto={this.props.organizationUnitDto}
                        onCancel={this.onCancel}
                        organizationSuccess={this.organizationSuccess}

                    />
                </TabPane>
                <TabPane key='roles' tab={L("vai_tro")}>
                    <TableOrganizationRoles
                        organizationUnitDto={this.props.organizationUnitDto}
                        onCancel={this.onCancel}
                        organizationSuccess={this.organizationSuccess}
                    />
                </TabPane>
            </Tabs>

        )
    }
}