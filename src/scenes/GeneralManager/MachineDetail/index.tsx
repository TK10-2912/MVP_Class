
import { ImportMachineDetailInput, MachineDetailDto, MachineDto, } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Image, Modal, Row, Tag } from 'antd';
import * as React from 'react';
import { eDrinkType, valueOfeDrinkType } from '@src/lib/enumconst';
import CreateMachineDetail from './components/CreateMachineDetail';
import AppConsts from '@src/lib/appconst';
import ImportExcelMachineDetail from './components/ImportExcelMachineDetail';
import AppComponentBase from '@src/components/Manager/AppComponentBase';

export class IProps {
	machineSelected: MachineDto;

}
export default class MachineDetail extends AppComponentBase<IProps> { 
	abstract
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
	render() {
		return (
			<Card loading={!this.state.isLoadDone}>
				<Row style={{ flexDirection: 'column' }}>
					<h2>{valueOfeDrinkType(eDrinkType.Do_tuoi.num)}</h2>
					{this.listDisplayFreshDrink != undefined && this.listDisplayFreshDrink.map((items, row: number) => (

						<ol style={{ display: 'flex', listStyleType: 'none', flexWrap: 'wrap', padding: 0 }} key={row + "_div"}>
							{items.map((subItems: MachineDetailDto, col: number) =>
							(
								!!subItems.ma_de_id ?
									<li key={col + "_div"}
										style={{ marginRight: 10, backgroundColor: 'ccc', cursor: 'pointer', display: 'flex', flexDirection: 'column', width: (100 / this.props.machineSelected.ma_rangeDisplayVending) + "%", height: ((100 / this.props.machineSelected.ma_rangeDisplayVending) + 33) + "%" }}
										onClick={() => this.createOrUpdateModalOpen(subItems)}
									>
										<strong style={{ marginBottom: "5px" }}>Slot {subItems.ma_de_slot_id}</strong>
										<div style={{ width: '100%', height: '100%', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', display: 'flex', justifyContent: "center" }}>
											<Image preview={false} height={window.innerHeight / 8} width={window.innerWidth / 20} src={(subItems.productItem != undefined && !!subItems.productItem.image_url) ? this.getFile(Number(subItems.productItem.image_url)) : process.env.PUBLIC_URL + '/image/no_image.jpg'} />
										</div>
										<div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', }}>
											<div><b>{subItems.pr_name}</b></div>
											<div>SL hiện tại: <b>{subItems.ma_de_cur}</b></div>
											<div>{subItems.ma_de_active == true ? <Tag color='green' >Đã kích hoạt</Tag> : <Tag color='red' >Chưa kích hoạt</Tag>}</div>

											{(subItems.productItem != undefined && subItems.productItem.money != undefined) &&
												<div> Giá: {AppConsts.formatNumber(subItems.productItem.money)} VNĐ</div>
											}
										</div>
									</li>
									:
									<li key={col + "_div"} style={{ margin: '10px', textAlign: 'center', width: '13%', backgroundColor: 'ccc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
										<div style={{ width: '120px', height: '120px', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
											<Image preview={false} height={'100%'} width={'100%'} src={process.env.PUBLIC_URL + "/image/no_image.jpg"} />
										</div>
										<div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: '10px' }}>
											<Tag style={{ whiteSpace: 'initial' }} color='red'>Sản phẩm hiện tại hết hàng hoặc chưa có sẵn</Tag>
										</div>
									</li>
							))}
						</ol>
					)
					)}
				</Row>
				<Row style={{ flexDirection: 'column' }}>
					{this.listDisplayDrink != undefined && this.listDisplayDrink.map((items, row: number) =>
					(
						<div key={row + "_div"}>
							<h3>Hàng {row + 1}</h3>
							<Row gutter={[8, 8]}>
								{items.filter(item => item.ma_de_id != undefined).map((subItems: MachineDetailDto, col: number) => (

									<Col key={col + "_li"}
										style={{ backgroundColor: 'ccc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: (100 / this.props.machineSelected.ma_rangeDisplayVending) + "%", height: ((100 / this.props.machineSelected.ma_rangeDisplayVending) + 33) + "%" }}>
										<strong style={{ marginBottom: "5px" }}>Slot {subItems.ma_de_slot_id}</strong>
										<div style={{ width: "100%", height: '100%', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', display: 'flex', justifyContent: 'center' }}>

											<Image preview={false} height={window.innerHeight / 8} width={window.innerWidth / 20} src={(subItems.productItem != undefined && !!subItems.productItem.image_url) ? this.getFile(Number(subItems.productItem.image_url)) : process.env.PUBLIC_URL + '/image/no_image.jpg'} />

										</div>
										<div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: '10px' }}>
											<div><b>{subItems.pr_name}</b></div>
											<div>SL hiện tại: <b>{subItems.ma_de_cur}</b></div>
											<div>{subItems.ma_de_active == true ? <Tag color='green' >Đã kích hoạt</Tag> : <Tag color='red' >Chưa kích hoạt</Tag>}</div>
											<div> Giá: {AppConsts.formatNumber(subItems.pr_money)} VNĐ</div>
										</div>
									</Col>
								))}
							</Row>
						</div>
					)
					)}
				</Row>
			</Card>
		)
	}
}
