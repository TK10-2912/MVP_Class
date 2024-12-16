import { L } from "@src/lib/abpUtility";
import { MachineSoftLogs } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Modal, Table } from "antd";
import React from "react";

interface IProps {
    isVisibleModal: boolean;
    setModalClose: () => void;
    machineSoftLogSelected: MachineSoftLogs[] | undefined;
    title: string;
}

export default class ModalMachineSoftLog extends React.Component<IProps> {
    state = {
        isLoadDone: false,
    }
    render() {
        const columns = [
            { title: L('N.O'), key: 'no_fileDocument_index', render: (text: string, item: MachineSoftLogs, index: number) => <div>{index + 1}</div> },
            { title: L('Mã phiên bản'), key: 'ma_so_lo_preversion_code', render: (text: string, item: MachineSoftLogs) => <div>{item.ma_so_lo_preversion_code}</div> },
            { title: L('Phiên bản cập nhật'), key: 'ma_so_lo_preversion_name', render: (text: string, item: MachineSoftLogs) => <div>{item.ma_so_lo_preversion_name}</div> },
            { title: L('Tên máy bán nước'), key: 'ma_so_lo_ma_id', render: (text: string, item: MachineSoftLogs) => <div>{stores.sessionStore.getNameMachines(item.ma_so_lo_ma_id)}</div> },
        ]
        return (
            <Modal
                title={<strong>{"Danh sách máy cập nhật phiên bản " + this.props.title}</strong>}
                visible={this.props.isVisibleModal}
                onCancel={this.props.setModalClose}
                footer={null}
                width={"50vw"}
            >
                <Table
                    className='centerTable'
                    rowKey={record => "quanlyhocvien_index__" + JSON.stringify(record)}
                    size={'middle'}
                    bordered={true}
                    locale={{ "emptyText": L('NoData') }}
                    columns={columns}
                    dataSource={this.props.machineSoftLogSelected !== undefined ? this.props.machineSoftLogSelected : []}
                />
            </Modal>
        )
    }
}