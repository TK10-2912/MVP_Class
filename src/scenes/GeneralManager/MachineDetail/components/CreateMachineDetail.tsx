
import { MachineDetailDto, MachineDto, UpdateMachineDetailInput, } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Col, Form, Row, message, } from 'antd';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import { L } from '@src/lib/abpUtility';
import { eDrinkType } from '@src/lib/enumconst';
import rules from '@src/scenes/Validation';

export class IProps {
	onCancel?: () => void;
	createSuccess?: () => void;
	deleteMachineDetail?: (machineDetail: MachineDetailDto) => void;
	machineSelected: MachineDto;
	machineDetailSelected?: MachineDetailDto;
}
export default class CreateMachineDetail extends React.Component<IProps> {
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		visibleModalCreateUpdate: false,
		idSelected: -1,
		isActive: false,
	}
	async componentDidMount() {
		this.initData(this.props.machineDetailSelected);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.machineDetailSelected !== undefined && nextProps.machineDetailSelected.ma_de_id !== prevState.idSelected) {
			return ({ idSelected: nextProps.machineDetailSelected.ma_de_id });
		}
		return null;
	}

	initData = async (input: MachineDetailDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (input !== undefined && input.ma_de_id !== undefined) {
			this.formRef.current!.setFieldsValue({ ...input, });
		} else {
			this.formRef.current.resetFields();
		}
		this.setState({ isLoadDone: true });
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.idSelected !== prevState.idSelected) {
			this.initData(this.props.machineDetailSelected);
		}
	}

	onCreateUpdate = () => {
		const { machineDetailSelected } = this.props;
		const form = this.formRef.current;
		this.setState({ isLoadDone: false })
		form!.validateFields().then(async (values: any) => {
			let unitData = new UpdateMachineDetailInput({ ma_de_id: machineDetailSelected!.ma_de_id, ...values });
			await stores.machineDetailStore.updateMachineDetail(unitData);
			message.success("Chỉnh sửa thành công");
			
			this.createSuccess();
			this.onCancel();
			this.setState({ isLoadDone: true });
		})
	};

	createSuccess = () => {
		if (!!this.props.createSuccess) {
			this.props.createSuccess();
		}
	}
	delete = () => {
		if (!!this.props.deleteMachineDetail) {
			this.props.deleteMachineDetail(this.props.machineDetailSelected!);
		}
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	}
	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}
	render() {
		return (
			<>
				<Row>
					<Col span={12}>
						{!!this.props.machineDetailSelected!.productItem ?
							<h3>{"Chỉnh sửa thông tin: " + this.props.machineDetailSelected!.productItem.name}</h3> : "Chỉnh sửa thông tin sản phẩm"}
					</Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						{/* <Button danger icon={<DeleteFilled />} onClick={() => this.delete()} style={{ marginLeft: '5px', marginTop: '5px' }}></Button> */}
						<Button danger onClick={() => this.onCancel()} >
							{L('Cancel')}
						</Button>
						<Button type="primary" onClick={() => this.onCreateUpdate()} style={{ marginLeft: '5px', }}>
							{L('Lưu')}
						</Button>
					</Col>
				</Row>
			</ >
		)
	}
}
