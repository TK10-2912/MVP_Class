import SelectEnum from '@src/components/Manager/SelectEnum';
import AppConsts from '@src/lib/appconst';
import { eReportLevel, eReportStatus, valueOfeReportStatus } from '@src/lib/enumconst';
import { ReportOfMachineDto, UpdateReportOfMachineInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Form, Row, Space, Tag, message } from 'antd';
import * as React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

export interface IProps {
	expandedRowKey: undefined,
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	reportOfMachineSelected: ReportOfMachineDto;
	layoutDetail: boolean
}

export default class UpdateReportOfMachineUser extends React.Component<IProps> {
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		re_id: -1,
		re_level: undefined,
		re_status: undefined,
	}
	reportOfMachineSelected: ReportOfMachineDto = new ReportOfMachineDto();

	async componentDidMount() {
		this.initData(this.props.reportOfMachineSelected);
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.reportOfMachineSelected.re_id !== prevState.re_id) {
			return ({ re_id: nextProps.reportOfMachineSelected.re_id });
		}
		return null;
	}
	async componentDidUpdate(prevProps, prevState) {
		if (this.state.re_id !== prevState.re_id) {
			this.initData(this.props.reportOfMachineSelected);
		}
	}
	initData = async (reportInput: ReportOfMachineDto | undefined) => {
		if (reportInput == undefined) {
			reportInput = new ReportOfMachineDto();
		}
		if (reportInput !== undefined && reportInput.re_id !== undefined) {
			this.reportOfMachineSelected = reportInput!;
		} else {
			this.reportOfMachineSelected = new ReportOfMachineDto();
		}
		if (reportInput.re_note == null) {
			reportInput.re_note = "";
		}
		await this.formRef.current.setFieldsValue({ ...this.reportOfMachineSelected, re_note: reportInput.re_note });
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}
	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	onCreateUpdate = () => {
		const { reportOfMachineSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			{
				let unitData = new UpdateReportOfMachineInput({ re_id: reportOfMachineSelected.re_id, re_status: this.state.re_status, ...values })
				await stores.reportOfMachineStore.updateReportOfMachine(unitData);
				message.success("Chỉnh sửa thành công!")
			}
			await this.onCreateUpdateSuccess();
			this.setState({ isLoadDone: !this.state.isLoadDone });
		});
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	};
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess();
		}
		this.setState({ isLoadDone: !this.state.isLoadDone });
	};
	render() {
		const { reportOfMachineSelected } = this.props;
		return (
			<Card>
				<Row>
					<Col span={24}>
						<h3>
							{(reportOfMachineSelected.ma_de_id != -1) ?
								<>
									{"Thông tin mã báo cáo " + (reportOfMachineSelected.re_code) + " từ máy " + (stores.sessionStore.getNameMachines(reportOfMachineSelected.ma_id))}
								</> :
								<>
									<strong>{stores.sessionStore.getNameMachines(reportOfMachineSelected.ma_id)}</strong>
								</>
							}
						</h3>
					</Col>
				</Row>
				<Row className={(reportOfMachineSelected.ma_de_id != -1) ? "" : "formNoMargin"}>
					<Col span={24}>
						<Form ref={this.formRef} style={{ width: '100%' }}>
							<Row >
								<Col span={12}>
									<Form.Item label="Người báo cáo" {...AppConsts.formItemLayout} name={"us_id_report"} >
										<strong>{stores.sessionStore.getUserNameById(reportOfMachineSelected.us_id_report)}</strong>
									</Form.Item>
									<Form.Item label="Nhóm máy" {...AppConsts.formItemLayout} name={"ma_id"} >
										<strong>{stores.sessionStore.getNameGroupUseMaId(reportOfMachineSelected.ma_id)}</strong>
									</Form.Item>
									<Form.Item label="Mã máy" {...AppConsts.formItemLayout} name={"ma_id"} >
										<strong>{stores.sessionStore.getMachineCode(reportOfMachineSelected.ma_id)}</strong>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label="Mô tả báo cáo" {...AppConsts.formItemLayout} name={"re_display"} >
										<strong>{reportOfMachineSelected.re_display}</strong>
									</Form.Item>
									<Form.Item label="Trạng thái" {...AppConsts.formItemLayout} name={"re_status"} >
										{
											this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH.num &&
											<Tag icon={<CheckCircleOutlined />} color="green">Đã xử lý</Tag>
										}
										{this.props.reportOfMachineSelected.re_status === eReportStatus.KHOI_TAO.num &&
											<Tag color="#FFB266" style={{ color: 'black' }}>Khởi tạo</Tag>
										}
									</Form.Item>
									<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'re_note'} >
										{(this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH.num) ? <div style={{ width: "280px" }} dangerouslySetInnerHTML={{ __html: this.props.reportOfMachineSelected.re_note! }}></div> :
											<div style={{ width: "50%" }}>
												<TextArea defaultValue={this.props.reportOfMachineSelected.re_note ?? ""} placeholder={"Ghi chú"} rows={4} maxLength={255}></TextArea>
											</div>
										}
									</Form.Item>
									<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'re_note'} >
										{(this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH.num) ? <div style={{ width: "280px" }} dangerouslySetInnerHTML={{ __html: this.props.reportOfMachineSelected.re_note! }}></div> :
											<div style={{ width: "50%" }}>
												<TextArea defaultValue={this.props.reportOfMachineSelected.re_note ?? ""} placeholder={"Ghi chú"} rows={4} maxLength={255}></TextArea>
											</div>
										}
									</Form.Item>
								</Col>
							</Row>
						</Form>
					</Col>
					<Col span={24} style={{ display: "flex", justifyContent: "end" }}>
						{this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH.num &&
							<Button type='primary' onClick={() => this.onCreateUpdate()} icon={<EditOutlined />}>Cập nhật</Button>
						}
					</Col>
				</Row >
			</Card >
		)
	}
}











{/* {this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH ? (
    <span>Đã hoàn thành</span>
  ) : (
    <SelectEnum
      eNum={eReportStatus}
      enum_value={this.props.reportOfMachineSelected.re_status}
      onChangeEnum={async (value: number) => {
        await this.setState({ re_status: value });
        await this.formRef.current!.setFieldsValue({ re_status: value });
      }}
    />
  )} */}