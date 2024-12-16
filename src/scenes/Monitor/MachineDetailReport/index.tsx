
import { MachineDetailDto, MachineDto, } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Row } from 'antd';
import * as React from 'react';
import { eDrinkType } from '@src/lib/enumconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ListProductDetail from './ProductCart/ListProductDetail';

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

	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.machineDetailStore.getAll(this.props.machineSelected.ma_id);
		await stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
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
		this.setState = (_state, _callback) => {
			return;
		};
	}

	onRefreshData = async () => {
		await this.setState({ visibleModalImportExcel: false });
	}

	onUpdateListImport = async () => {
		this.setState({ isLoadDone: false });
		// await stores.machineDetailStore.updateListMachineDetail(this.state.ma_id, this.dataExcel);
		await this.getAll();
		// this.onSetDataUpdateListImport(undefined, []);
		this.setState({ isLoadDone: true });
	}

	// onSetDataUpdateListImport = async (id: number | undefined, data: ImportMachineDetailInput[]) => {
	// 	this.setState({ isLoadDone: false });
	// 	this.dataExcel = data;

	// 	await this.setState({ ma_id: id });
	// 	await this.setData();
	// 	this.setState({ isLoadDone: true });
	// }

	render() {
		const { productListResult } = stores.productStore;
		const { machineDetailListResult } = stores.machineDetailStore;

		return (
			<Row align='middle'>
				<ListProductDetail
					ma_layout={this.props.machineSelected?.ma_layout}
					ma_rangeDisplayVending={this.props.machineSelected.ma_rangeDisplayVending}
					listProduct={productListResult}
					machineDetailSelected={machineDetailListResult}
					machine={this.props.machineSelected!}
					ma_activeRefill={this.props.machineSelected.ma_activeRefill}
				/>
			</Row>
		)
	}
}
