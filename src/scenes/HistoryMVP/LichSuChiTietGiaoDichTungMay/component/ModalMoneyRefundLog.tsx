import TableRefundAdmin from "@src/scenes/Reconsile/Refund/RefundAdmin/components/TableRefundAdmin";
import { TransactionByMachineDto } from "@src/services/services_autogen";
import { Modal } from "antd";
import React from "react";

export interface IProps {
    visible: boolean;
    onCancel: () => void;
    transactionSelected: TransactionByMachineDto;
}
export default class ModalMoneyRefundLog extends React.Component<IProps> {
    render() {
        return (
            <Modal
                width={'80%'}
                title={<h3>Số tiền hoàn trả</h3>}
                visible={this.props.visible}
                onCancel={() => this.props.onCancel()}
                footer={null}            >
                <TableRefundAdmin
                    pagination={false}
                    onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                    refundResult={this.props.transactionSelected.listRefund!}
                    parent="today"
                />
            </Modal>
        )
    }
}