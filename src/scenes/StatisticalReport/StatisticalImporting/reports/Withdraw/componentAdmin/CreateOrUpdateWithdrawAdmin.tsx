import AppConsts, { FileUploadType, cssColResponsiveSpan } from "@src/lib/appconst";
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Tag, message } from "antd";
import React from "react";
import { WithdrawDto, UpdateMachineInput, AttachmentItem } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import SelectedMachineMultiple from "@src/components/Manager/SelectedMachineMultiple";
import moment, { Moment } from "moment";
import SelectEnum from "@src/components/Manager/SelectEnum";
import { ePaymentMethod, eWithdrawStatus, valueOfePaymentMethod, valueOfeWithdrawStatus } from "@src/lib/enumconst";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import rules from "@src/scenes/Validation";
import FileAttachments from "@src/components/FileAttachments";
import { L } from "@src/lib/abpUtility";

export interface IProps {
    onCancel?: () => void;
    onSuccess?: () => void;
    withdrawSelected: WithdrawDto,
    bank?:any;
    cash?:any;
}
export default class CreateOrUpdateWithDrawAdmin extends AppComponentBase<IProps>{
    private formRef: any = React.createRef();
    state = {
        isLoadDone: false,
        idSelected: -1,
        us_id_withdraw: undefined,
        wi_ma_id: undefined,
        wi_end_at: moment(),
        wi_status: undefined,
        wi_note: "",
        isLoadFile: false,
        totalMoney: 0,
        isDownload: undefined,
        showRemoveIcon: undefined,
    }
    withdrawSelected: WithdrawDto;
    listAttachmentItem_file: AttachmentItem[] = [];

    async componentDidMount() {
        await this.initData(this.props.withdrawSelected);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.withdrawSelected != undefined && nextProps.withdrawSelected.wi_id !== prevState.idSelected) {
            return ({ idSelected: nextProps.withdrawSelected.wi_id });
        }
        return null;
    }
    async componentDidUpdate(prevProps, prevState) {
        if (this.state.idSelected !== prevState.idSelected) {
            this.initData(this.props.withdrawSelected);
        }
    }
    onCancel() {
        const { onCancel } = this.props;
        if (onCancel !== undefined) {
            onCancel();
        }
    }
    initData = async (input: WithdrawDto) => {
        await this.setState({ isLoadDone: false });
        // if (input.wi_id !== undefined) {
        //     this.setState({ isDownload: true, showRemoveIcon: true, wi_end_at: moment(input.wi_end_at) });
        //     this.listAttachmentItem_file = (input.fi_id_list === undefined) ? [] : input.fi_id_list.filter(item => item.isdelete === false);
        //     // // if (input.wi_status == eWithdrawStatus.RECEIVED.num || input.wi_status == eWithdrawStatus.ACCEPTED.num) {
        //     // //     this.setState({ isDownload: true, showRemoveIcon: false })
        //     // // }
        //     // else {
        //     //     if (!input.wi_note) {
        //     //         input.wi_note = "";
        //     //     }
        //     //     this.formRef.current.setFieldsValue({ ...input });
        //     // }
        // }
        // else {
        //     this.setState({ isDownload: false, showRemoveIcon: true })
        //     this.setState({ wi_start_at: moment().subtract(7, "day"), wi_end_at: moment() })
        //     if (!input.wi_note) {
        //         input.wi_note = "";
        //     }
        //     this.listAttachmentItem_file = [];
        //     this.formRef.current.resetFields();
        // }

        // await this.setState({ isLoadDone: true, isLoadFile: !this.state.isLoadFile })
    }
    onCreateUpdate = async () => {
        const { withdrawSelected } = this.props;
        const form = this.formRef.current;
        await this.setState({ isLoadDone: false })
        form!.validateFields().then(async (values: any) => {
            if (withdrawSelected.wi_id === undefined) {
                this.setState({ isDownload: false, showRemoveIcon: true, wi_end_at: moment() })
                let unitData = new ({ ...values });
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.wi_total_money = this.state.totalMoney;
                unitData.wi_end_at = this.state.wi_end_at.toDate();
                await stores.withDrawStore.createWithdrawBank(unitData)
                await this.onSuccess();
                message.success("Tạo yêu cầu rút tiền thành công!")
            }
            else {
                // this.setState({ isDownload: true, showRemoveIcon: true, wi_end_at: moment() })
                // let unitData = new UpdateWithdrawInput({ wi_id: withdrawSelected.wi_id, ...values });
                // unitData.fi_id_list = this.listAttachmentItem_file
                // unitData.wi_total_money = this.state.totalMoney;
                // unitData.wi_end_at = this.state.wi_end_at.toDate();
                // await stores.withDrawStore.updateWithdraw(unitData);
                // await this.onSuccess();
                // message.success("Chỉnh sửa thành công!")
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
        this.setState = (state, callback) => {
            return;
        };
    }

    onChangeDateEndAt = async (date: Moment | null) => {
        await this.setState({ wi_end_at: date ?? undefined });
        if (this.state.wi_end_at == undefined) {
            await this.setState({ wi_end_at: undefined });
        }
    };

    createNewMoment = (date: Moment) => {
        return moment(date, "DD/MM/YYYY");
    }
    render() {
        let self = this;
        const { withdrawSelected } = this.props;

        return (
            <div></div>
            // <Card>
            //     {withdrawSelected.wi_status != eWithdrawStatus.RECEIVED.num && withdrawSelected.wi_status != eWithdrawStatus.ACCEPTED.num ?
            //         <>
            //             <Row>
            //                 <Col span={12}>
            //                     <h2>{this.state.idSelected === undefined ? "Yêu cầu rút tiền " : "Chỉnh sửa thông tin rút tiền của: " + stores.sessionStore.getUserNameById(withdrawSelected.us_id_withdraw)}</h2>
            //                 </Col>
            //                 <Col span={12} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "right" }}>
            //                     <Button type="primary" onClick={async () => await this.onCreateUpdate()}>Lưu</Button>
            //                     <Button danger onClick={() => this.onCancel()}>Hủy</Button>
            //                 </Col>
            //             </Row>

            //             <strong>{L('Tệp đính kèm')} </strong>
            //             <FileAttachments
            //                 files={self.listAttachmentItem_file}
            //                 isLoadFile={this.state.isLoadFile}
            //                 allowRemove={true}
            //                 isMultiple={true}
            //                 componentUpload={FileUploadType.Contracts}
            //                 onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
            //                     self.listAttachmentItem_file = itemFile;
            //                 }}
            //                 isDownload={this.state.isDownload}
            //                 showRemoveIcon={this.state.showRemoveIcon}
            //             />

            //             <Row>
            //                 <Form ref={this.formRef} style={{ width: "100%" }}>
            //                     {!!this.props.withdrawSelected.wi_id &&
            //                         <>
            //                             <Form.Item label="Máy" {...AppConsts.formItemLayout} >
            //                                 <b>{stores.sessionStore.getNameMachinesMulti(withdrawSelected.withdrawDetails!.map(item => item.wi_de_ma_id))}</b>
            //                             </Form.Item>
            //                             <Form.Item label="Người rút" {...AppConsts.formItemLayout} name={"us_id_withdraw"} >
            //                                 <b>{stores.sessionStore.getUserNameById(withdrawSelected.us_id_withdraw)}</b>
            //                             </Form.Item>
            //                             <Form.Item label="Trạng thái" {...AppConsts.formItemLayout} name={"wi_status"}>
            //                                 {/* {
            //                                     withdrawSelected.wi_status == 0 &&
            //                                     <Tag color={"blue"}>{valueOfeWithdrawStatus(withdrawSelected.wi_status)}</Tag>
            //                                 }
            //                                 {
            //                                     withdrawSelected.wi_status == 1 &&
            //                                     <Tag color={"red"}>{valueOfeWithdrawStatus(withdrawSelected.wi_status)}</Tag>
            //                                 }
            //                                 {
            //                                     withdrawSelected.wi_status == 2 &&
            //                                     <Tag color={"#DB9925"}>{valueOfeWithdrawStatus(withdrawSelected.wi_status)}</Tag>
            //                                 }
            //                                 {
            //                                     withdrawSelected.wi_status == 3 &&
            //                                     <Tag color={"#45A5FF"}>{valueOfeWithdrawStatus(withdrawSelected.wi_status)}</Tag>
            //                                 } */}
            //                             </Form.Item>
            //                         </>
            //                     }

            //                     <Form.Item label="Ngày kết thúc" {...AppConsts.formItemLayout} name={"wi_end_at"} valuePropName='wi_end_at' >
            //                         <DatePicker
            //                             showTime
            //                             placeholder="Ngày kết thúc"
            //                             allowClear={false}
            //                             onChange={async (date: Moment | null, dateString: string) => {
            //                                 this.setState({ wi_end_at: date }); await this.caculateWithdrawMoney();
            //                             }}
            //                             format={"DD/MM/YYYY HH:mm:ss"}
            //                             value={this.state.wi_end_at}
            //                             disabledDate={(current) => current ? current > moment().add(1) : false}
            //                         />
            //                     </Form.Item>
            //                     <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'wi_note'} valuePropName='data' initialValue={this.props.withdrawSelected.wi_note}
            //                         getValueFromEvent={(event, editor) => {
            //                             const data = editor.getData();
            //                             return data;
            //                         }}>
            //                         <CKEditor editor={ClassicEditor} />
            //                     </Form.Item>
            //                     <Form.Item label="Tổng tiền" {...AppConsts.formItemLayout} name={"wi_total_money"}>
            //                         <label>{!!this.state.totalMoney ? AppConsts.formatNumber(this.state.totalMoney) : 0} VND</label>
            //                     </Form.Item>

            //                 </Form>
            //             </Row>
            //         </>
            //         :
            //         <>
            //             <Row>
            //                 <Col span={20} style={{ display: 'flex', alignItems: "center" }}>
            //                     <h3 style={{ fontSize: "15px" }}> Thông tin rút tiền của <b>{stores.sessionStore.getUserNameById(withdrawSelected.us_id_withdraw)}</b></h3>
            //                 </Col>
            //                 <Col span={4} style={{ textAlign: "right" }}>
            //                     <Button
            //                         danger
            //                         onClick={() => this.onCancel()}
            //                         style={{ marginLeft: "5px", marginTop: "5px", marginBottom: "20px" }}>
            //                         Hủy
            //                     </Button>
            //                 </Col>
            //             </Row>
            //             <Row>
            //                 {(withdrawSelected != undefined && withdrawSelected.withdrawDetails != undefined && withdrawSelected.withdrawDetails!.length > 0) && withdrawSelected.withdrawDetails.map(item => (
            //                     <div key={item.wi_de_ma_id}>
            //                         <label style={{ marginBottom: "10px", }}>Máy bán nước: <b>{stores.sessionStore.getNameMachines(item.wi_de_ma_id)}</b></label><br />
            //                         <br />
            //                         <label style={{ marginBottom: "10px", }}>Ngày rút gần nhất: <b>{moment(item.wi_de_start_at).format("DD/MM/YYYY HH:mm:ss")}</b></label><br />
            //                         <label style={{ marginBottom: "10px", }}>Ngày rút lần này: <b>{moment(item.wi_de_end_at).format("DD/MM/YYYY HH:mm:ss")}</b></label><br />
            //                         <label style={{ marginBottom: "10px", }}>Tổng tiền QR: <b>{AppConsts.formatNumber(item.wi_de_qr)} VNĐ</b></label><br />
            //                         <label style={{ marginBottom: "10px", }}>Tổng tiền RFID: <b>{AppConsts.formatNumber(item.wi_de_rfid)} VNĐ</b></label><br />
            //                         <p>===============================================</p>
            //                     </div>
            //                 ))
            //                 }
            //             </Row>
            //             <strong>{('Tệp đính kèm')} </strong>
            //             <FileAttachments
            //                 files={self.listAttachmentItem_file}
            //                 isLoadFile={this.state.isLoadFile}
            //                 allowRemove={true}
            //                 isMultiple={true}
            //                 componentUpload={FileUploadType.Contracts}
            //                 onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
            //                     self.listAttachmentItem_file = itemFile;
            //                 }}
            //                 isDownload={this.state.isDownload}
            //                 showRemoveIcon={this.state.showRemoveIcon}
            //             />
            //         </>


            //     }
            // </Card>
        )
    }
}