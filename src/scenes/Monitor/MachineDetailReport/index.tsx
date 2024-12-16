
import { ImportMachineDetailInput, MachineDetailDto, MachineDto, } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Card, Col, Image, Row } from 'antd';
import * as React from 'react';
import { eDrinkType, valueOfeDrinkType } from '@src/lib/enumconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ItemDetail from './ProductCart/ItemDetail';

export class IProps {
	machineSelected: MachineDto;
	onCancel?: () => void;

}
export default class MachineDetailReport extends AppComponentBase<IProps> {
	dragItem: any = React.createRef();
	dragOverItem: any = React.createRef();
	state = {
		isLoadDone: false,
		visibleModalCreateUpdateMachineDetail: false,
		visibleModalCreateUpdateMachineDetailFreshDrink: false,
		visibleModalImportExcel: false,
		ma_id: undefined,
	}
	listDisplayDrink: MachineDetailDto[][] = [];
	listDisplayFreshDrink: MachineDetailDto[][] = Array.from({ length: 1 }, () => new Array(0).fill(new MachineDetailDto()));
	machineDetailSelected: MachineDetailDto = new MachineDetailDto();
	dicDrink: { [key: number]: MachineDetailDto } = {};
	dataExcel: ImportMachineDetailInput[];
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.machineDetailStore.getAll(this.props.machineSelected.ma_id);
		await this.setData();
		this.setState({ isLoadDone: true });
	}

	async setData() {
		const { machineSelected } = this.props;
		const { machineDetailListResult, beforeUpdateMachineDetail } = stores.machineDetailStore;

		if (this.state.ma_id !== undefined) {
			beforeUpdateMachineDetail !== undefined &&
				beforeUpdateMachineDetail.items!.filter(item => item.dr_type === eDrinkType.Do_dong_chai.num)
					.map(item => this.dicDrink[item.ma_de_slot_id] = item);
		} else {
			machineDetailListResult.filter(item => item.dr_type === eDrinkType.Do_dong_chai.num)
				.map(item => this.dicDrink[item.ma_de_slot_id] = item);
		}
		let listDrink = Object.values(this.dicDrink);

		this.listDisplayDrink = [];

		let numberOfListDrink = Math.max(...listDrink.map(item => item.ma_de_slot_id)) + 1;
		const result: (MachineDetailDto)[] = [];

		let index = 0;
		for (let i = 0; i < numberOfListDrink; i++) {
			if (index < listDrink.length && listDrink[index].ma_de_slot_id === i) {
				result.push(listDrink[index]);
				index++;
			} else {
				result.push(new MachineDetailDto());
			}
		}
		for (let i = 0; i < numberOfListDrink; i += machineSelected.ma_rangeDisplayVending) {
			this.listDisplayDrink.push(result.slice(i, i + machineSelected.ma_rangeDisplayVending));
		}

		let listFreshDrink = machineDetailListResult.filter(item => item.dr_type === eDrinkType.Do_tuoi.num);
		this.listDisplayFreshDrink[0] = listFreshDrink;
		this.kiemTraVaThemPhanTuThieu();
		this.setState({ isLoadDone: true, visibleModalCreateUpdateMachineDetail: false });
	}

	kiemTraVaThemPhanTuThieu() {
		if (this.listDisplayFreshDrink[0].length < 3) {
			for (let i = 0; i < 3; i++) {
				const found = this.listDisplayFreshDrink[0].some(element => element.ma_de_slot_id === i);
				if (!found) {
					this.listDisplayFreshDrink[0].push(MachineDetailDto.fromJS({ ma_de_slot_id: i }));
				}
			}
			this.listDisplayFreshDrink[0].sort((a, b) => a.ma_de_slot_id - b.ma_de_slot_id);
		}
	}
	createOrUpdateModalOpen = async (input: MachineDetailDto) => {
		if (input !== undefined && input !== null) {
			this.machineDetailSelected.init(input);
			await this.setState({ visibleModalCreateUpdateMachineDetail: true });
		}
	}
	updateSucess = async () => {
		await this.getAll();
	}
	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}

	onRefreshData = async () => {
		await this.setState({ visibleModalImportExcel: false });
	}

	onUpdateListImport = async () => {
		this.setState({ isLoadDone: false });
		await stores.machineDetailStore.updateListMachineDetail(this.state.ma_id, this.dataExcel);
		await this.getAll();
		this.onSetDataUpdateListImport(undefined, []);
		this.setState({ isLoadDone: true });
	}

	onSetDataUpdateListImport = async (id: number | undefined, data: ImportMachineDetailInput[]) => {
		this.setState({ isLoadDone: false });
		this.dataExcel = data;

		await this.setState({ ma_id: id });
		await this.setData();
		this.setState({ isLoadDone: true });
	}

	render() {
		return (
			<>
				<Row gutter={8} align='bottom'>
					<Col span={24} style={{ display: "flex", justifyContent: "center" }}>
						<h2>{"Xem chi tiết trạng thái máy "}<strong style={{ color: '#237804' }}>{stores.sessionStore.getNameMachines(this.props.machineSelected.ma_id)}</strong></h2>
					</Col>
				</Row>
				<Card loading={!this.state.isLoadDone}>
					<Row style={{ flexDirection: 'column' }}>
						<h2 style={{ color: 'green' }}><strong>{valueOfeDrinkType(eDrinkType.Do_tuoi.num)}</strong></h2>
						{this.listDisplayFreshDrink != undefined && this.listDisplayFreshDrink.map((items, row: number) => (
							<div style={{ display: 'flex', listStyleType: 'none', flexWrap: 'wrap', padding: 0 }} key={row + "_div"}>
								<Row gutter={[8, 8]}>
									{items.map((subItems: MachineDetailDto, col: number) =>
									(
										!!subItems.ma_de_id ?
											<Col key={col + "_div"}>
												<ItemDetail machineDetail={subItems} />
											</Col>
											:
											<Col key={col + "_div"}>
												<div className='product-card'>
													<Image width={60} style={{ marginBottom: 8 }} preview={false} src={process.env.PUBLIC_URL + "/image/no_image.jpg"} />
													<span style={{ color: 'red' }}><strong>Sản phẩm hiện tại hết hàng hoặc chưa có sẵn</strong></span>
												</div>
											</Col>
									))}
								</Row>
							</div>
						)
						)}
					</Row>
					<Row style={{ flexDirection: 'column' }}>
						<h2 style={{ color: 'green' }}><strong>{valueOfeDrinkType(eDrinkType.Do_dong_chai.num)}</strong></h2>
						{
							this.listDisplayDrink?.map((items, row: number) => (
								<div key={row + "_div"}>
									<h3>Hàng {row + 1}</h3>
									<Row gutter={[8, 8]}>
										{items.filter(item => item.ma_de_id != undefined).map((subItems: MachineDetailDto, col: number) => (
											<Col key={col + "_li"}>
												<ItemDetail machineDetail={subItems} />
											</Col>
										))}
									</Row>
								</div>
							))
						}
					</Row>
				</Card>
			</>
		)
	}
}
