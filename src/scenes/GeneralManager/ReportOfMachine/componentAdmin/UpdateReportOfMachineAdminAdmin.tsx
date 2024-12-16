import SelectEnum from '@src/components/Manager/SelectEnum';
import AppConsts from '@src/lib/appconst';
import { eReportLevel, eReportStatus } from '@src/lib/enumconst';
import { ReportOfMachineDto, UpdateReportOfMachineInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Form, Row, Tag, message } from 'antd';
import * as React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import rules from '@src/scenes/Validation';

export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	reportOfMachineSelected: ReportOfMachineDto;
}

export default class UpdateReportOfMachineAdmin extends React.Component<IProps>{
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
		this.setState({ isLoadDone: false });
		if (reportInput == undefined) {
			reportInput = new ReportOfMachineDto();
		}
		if (reportInput !== undefined && reportInput.re_id !== undefined) {
			this.reportOfMachineSelected = reportInput!;
		} else {
			this.reportOfMachineSelected = new ReportOfMachineDto();
		}
		if (reportInput.re_note == null) {
			reportInput.re_note = ""
		}
		await this.formRef.current.setFieldsValue({ ...this.reportOfMachineSelected });
		await this.setState({ isLoadDone: true });
	}
	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}
	onCreateUpdate = () => {
		const { reportOfMachineSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			{
				let unitData = new UpdateReportOfMachineInput({ re_id: reportOfMachineSelected.re_id, ...values })
				await stores.reportOfMachineStore.updateReportOfMachine(unitData);
				message.success("Chỉnh sửa thành công!")
			}
			await this.onCreateUpdateSuccess();
			this.setState({ isLoadDone: true });
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
		this.setState({ isLoadDone: true });
	};
	render() {
		const { reportOfMachineSelected } = this.props;
		return (
			<Card>
				<Row>
					<Col span={16}>
						<h3>
							{(reportOfMachineSelected.ma_de_id != -1) ?
								<>
									{"Thông tin mã báo cáo " + (reportOfMachineSelected.re_code) + " từ máy " + (stores.sessionStore.getNameMachines(reportOfMachineSelected.ma_id))}
								</> :
								<>
									Tình trạng máy bán nước  {stores.sessionStore.getNameMachines(reportOfMachineSelected.ma_id)}
								</>
							}
						</h3>
					</Col>
					<Col span={8} style={{ textAlign: "right" }}>
						<Button
							danger
							onClick={() => this.onCancel()}
							style={{ marginLeft: "5px", marginTop: "5px", marginBottom: "20px" }}
						>
							Hủy
						</Button>
						{this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH.num ? "" :
							<Button
								type="primary"
								onClick={() => this.onCreateUpdate()}
								style={{ marginLeft: '5px', marginTop: '5px', marginBottom: "20px" }}
							>
								Lưu
							</Button>}
					</Col>
				</Row>
				<Row>
					<Form ref={this.formRef} style={{ width: '100%' }}>
						<Form.Item label="Người báo cáo" {...AppConsts.formItemLayout} name={"us_id_report"} labelCol={{ span: 0 }}>
							<h3 style={{ marginTop: "3px" }}>{stores.sessionStore.getUserNameById(reportOfMachineSelected.us_id_report)}</h3>
						</Form.Item>

						<Form.Item label="Mã báo cáo" {...AppConsts.formItemLayout} name={"re_code"} labelCol={{ span: 0 }}>
							<h3 style={{ marginTop: "3px" }}>{reportOfMachineSelected.re_code}</h3>
						</Form.Item>

						<Form.Item label="Máy bán nước" {...AppConsts.formItemLayout} name={"ma_id"} labelCol={{ span: 0 }} >
							<h3 style={{ marginTop: "3px" }}>{stores.sessionStore.getNameMachines(reportOfMachineSelected.ma_id)}</h3>
						</Form.Item>

						<Form.Item label="Mức nghiêm trọng" {...AppConsts.formItemLayout} name={"re_level"} valuePropName='data' labelCol={{ span: 0 }}>
							{/* <SelectEnum eNum={eReportLevel} enum_value={this.props.reportOfMachineSelected.re_level} onChangeEnum={async (value: number) => {await this.setState({re_level: value}); await this.formRef.current!.setFieldsValue({ re_level: value });}}/> */}
							<h3 style={{ marginTop: "3px" }}>{(reportOfMachineSelected.re_level == eReportLevel.CANH_BAO.num ? <Tag icon={<ExclamationCircleOutlined />} color="warning" >Cảnh báo</Tag> : <Tag icon={<CloseCircleOutlined />} color="error">Có lỗi</Tag>)}</h3>
						</Form.Item>

						<Form.Item label="Hiển thị báo cáo" {...AppConsts.formItemLayout} name={"re_display"} valuePropName='data' labelCol={{ span: 0 }}>
							<h3 style={{ marginTop: "3px" }}>{reportOfMachineSelected.re_display}</h3>
						</Form.Item>

						<Form.Item label="Trạng thái" {...AppConsts.formItemLayout} name={"re_status"} rules={this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH.num ? [] : [rules.required]} >
							{this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH.num ?
								<h3 style={{ color: "#40cf5f", marginTop: "3px" }}>Đã hoàn thành</h3>
								:
								<SelectEnum
									eNum={eReportStatus}
									enum_value={this.props.reportOfMachineSelected.re_status}
									onChangeEnum={async (value: number) => {
										await this.setState({ re_status: value });
										await this.formRef.current!.setFieldsValue({ re_status: value });

									}}
								/>
							}
						</Form.Item>

						<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={"re_note"} valuePropName='data'
							getValueFromEvent={(event, editor) => {
								const data = editor.getData();
								if (data == null) {
									return "";
								}
								return data;
							}}>

							{this.props.reportOfMachineSelected.re_status === eReportStatus.DA_HOAN_THANH.num ? <div style={{ marginTop: "5px" }} dangerouslySetInnerHTML={{ __html: this.props.reportOfMachineSelected.re_note! }}></div> :

								<CKEditor editor={ClassicEditor} />
							}
						</Form.Item>
					</Form>
				</Row>
			</Card>
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