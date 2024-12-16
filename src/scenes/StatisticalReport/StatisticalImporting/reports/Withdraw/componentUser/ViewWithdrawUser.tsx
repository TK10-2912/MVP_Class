import * as React from 'react';
import { AttachmentItem, WithdrawDto } from '@src/services/services_autogen';
import { Button, Card, Col, Row } from 'antd';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { valueOfePaymentMethod } from '@src/lib/enumconst';
import moment from 'moment';
import { stores } from '@src/stores/storeInitializer';
import FileAttachmentsLog from '@src/components/FileAttachmentsLog';

export interface IProps {
    onCancel: () => void;
    withDrawSelected: WithdrawDto;
    wi_id: number;
}

export default class ViewWithdrawUser extends React.Component<IProps> {
    private formRef: any = React.createRef();
    state = {
        isSelected: -1,
        isLoadDone: false,
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    };
    async componentDidUpdate(prevProps) {
        if (this.props.wi_id !== prevProps.wi_id) {
            this.setState({ isLoadDone: !this.state.isLoadDone })
        }
    }

    listAttachmentItem_file: AttachmentItem[] = [];

    render() {
        const { withDrawSelected, } = this.props;
        return (
            <Card>
                <Row>
                    <Col span={20} style={{ display: 'flex', alignItems: "center" }}>
                        <h3 style={{ fontSize: "15px" }}> Thông tin rút tiền của máy <b>{stores.sessionStore.getNameMachines(withDrawSelected.ma_id)}</b></h3>
                    </Col>
                    <Col span={4} style={{ textAlign: "right" }}>
                        <Button
                            danger
                            onClick={() => this.onCancel()}
                            style={{ marginLeft: "5px", marginTop: "5px", marginBottom: "20px" }}>
                            Hủy
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <div>
                        <label style={{ marginBottom: "10px", }}>Máy bán nước <b>{stores.sessionStore.getNameMachines(withDrawSelected.ma_id)}</b></label><br />
                        <br />
                        <label style={{ marginBottom: "10px", }}>Tổng tiền rút: <b>{AppConsts.formatNumber(withDrawSelected.wi_total_money_reality)} VNĐ</b></label><br />
                        <label style={{ marginBottom: "10px", }}>Hình thức rút: <b> {valueOfePaymentMethod(withDrawSelected.wi_payment_type)}</b></label><br />
                        <label style={{ marginBottom: "10px", }}>Ngày tạo rút tiền: <b>{moment(withDrawSelected.wi_start_date).format("DD/MM/YYYY") + " - " + moment(withDrawSelected.wi_end_date).format("DD/MM/YYYY")}</b></label><br />
                        <label style={{ marginBottom: "10px", }}>Ngày rút: <b>{moment(withDrawSelected.wi_created_at).format("DD/MM/YYYY HH:mm:ss")}</b></label><br />
                        <label style={{ marginBottom: "10px", display: "inline" }}>Ghi chú: <b style={{ paddingTop: "14px", display: "inline-block" }} dangerouslySetInnerHTML={{ __html: withDrawSelected.wi_note! }}></b></label><br />
                        <p>===============================================</p>
                        <strong>{('Tệp đính kèm')} </strong>
                        {!!withDrawSelected.fi_id_list && withDrawSelected.fi_id_list?.length > 0 ?
                            <FileAttachmentsLog
                                files={withDrawSelected.fi_id_list}
                                allowRemove={true}
                                isLoadFile={this.state.isLoadDone}
                                isMultiple={true}
                                onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                    withDrawSelected.fi_id_list = itemFile;
                                }}
                                isUpLoad={false}
                            />
                            :
                            <p>Không có tệp đính kèm!</p>
                        }
                    </div>
                </Row>

            </Card>
        )
    }
}