import * as React from 'react';
import { useState, useReducer, useEffect } from 'react';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { BillingOfMachineDto, DailySaleMonitoringDto, SearchDailyMonitoringInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row } from 'antd';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import TableSaleMonitoring from './component/TableSaleMonitoring';
import TablePaymentOfSaleMonitoring from './component/TablePaymentOfSaleMonitoring';
import ModalExportDailySaleMonitoring from './component/ModalExportDailySaleMonitoring';
import { isGranted } from '@src/lib/abpUtility';
import CountdownTimer from '@src/components/CountDowntTimer';
import { tupleNum } from 'antd/lib/_util/type';

const DailySaleMonitoring = () => {
	const [isLoadDone, setIsLoadDone] = useState(false);
	const [ma_id_list,setMa_id_list] = useState<number[] | undefined>(undefined);
	const [gr_ma_id, setGr_ma_id] = useState<number | undefined>(undefined);
	const initialState = {
		visibleModalCreateUpdate: false,
		visibleModalStatusMachine: false,
		visibleExportMachine: false,
		skipCount: 1,
		maxResultCount: 10,
		pageSize: 10,
		currentPage: 1,
		clicked: false,
		select: false,	
		us_id: undefined,	
		us_id_list: undefined,
	};

	const reducer = (state, action) => {
        switch (action.type) {
            case 'SET_STATE':
                return { ...state, ...action.payload };
            default:
                return state;
        }
    };
    const [state, dispatch] = useReducer(reducer, initialState);
	const machineSelected: BillingOfMachineDto = new BillingOfMachineDto();
	const listKey: string[] = [];
	const dailySaleMonitoringDto: DailySaleMonitoringDto = new DailySaleMonitoringDto();
	const searchDailyMonitoringInput: SearchDailyMonitoringInput = new SearchDailyMonitoringInput();
	useEffect(() => {
		const fetchData = async() => {
			const urlParams = new URLSearchParams(window.location.search);
			let ma_id = urlParams.get("ma_id") == null || urlParams.get("ma_id") == "ma_id" ? undefined : urlParams.get("ma_id")
			if (!!ma_id) {
				setMa_id_list([Number(ma_id)]);
				await getAll();
			}	
		}
		fetchData()
	},[])
	
	const getAllAdmin = async () => {
		setIsLoadDone(false);
		await stores.dailyMonitorStore.dailySaleMonitoringAdmin(state.us_id_list, gr_ma_id, ma_id_list, undefined, undefined);
		setIsLoadDone(true);
	}
	const getAllUser = async() => {
		setIsLoadDone(false);
		await stores.dailyMonitorStore.dailySaleMonitoring(gr_ma_id, ma_id_list, undefined, undefined);
		setIsLoadDone(true);
	}

	const getAll = () => {
		if (isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_DailySale)) {
			getAllAdmin();
		} else {
			getAllUser();
		}
	}

	const onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			dispatch({type: "SET_STATE", payload:{pageSize: pagesize!}});		
		}
		dispatch({type: "SET_STATE", payload:{skipCount: page, currentPage: page}});
		await getAll();
	}

	const handleSubmitSearch = async () => {
		onChangePage(1, state.pageSize);
	}

	const clearSearch = async () => {
		dispatch({type: "SET_STATE", payload:{
			us_id_list: undefined,
		}});
		setGr_ma_id(undefined);
		setMa_id_list(undefined);
		getAll();
	}

	const shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 1393;
		return !isChangeText;
	}
	const actionTable = (machine: BillingOfMachineDto, event: EventTable) => {
		if (event == EventTable.View) {
			machineSelected.init(machine);
			dispatch({type: "SET_STATE", payload:{visibleModalStatusMachine: true}});	
		}
	}
	const left = state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
	const { dailySaleMonitoringResult, total } = stores.dailyMonitorStore;
	return (
		<Card>
			<Row align='middle' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
				<h2 style={{ textAlign: "start", margin: 0 }}>Trạng thái bán hàng hôm nay ({new Date().toLocaleDateString('vi-VN')})</h2>
				&nbsp;&nbsp;
				<CountdownTimer handleSearch={handleSubmitSearch} />
			</Row>
			<Row gutter={10} align='bottom'>
				<Col {...cssColResponsiveSpan(24, 24, 19, 20, 20, 15)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }} >
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 8)}>
						<strong>Nhóm máy</strong>
						<SelectedGroupMachine groupmachineId={gr_ma_id} onChangeGroupMachine={(value) => { setGr_ma_id(value); onChangePage(1, state.pageSize) }}></SelectedGroupMachine>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 8)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							onChangeMachine={(value) => { setMa_id_list(value); onChangePage(1, state.pageSize) }} groupMachineId={gr_ma_id} listMachineId={ma_id_list}
						></SelectedMachineMultiple>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 12, 12, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
						<Button placeholder='Tìm kiếm' type='primary' onClick={() => handleSubmitSearch()}><SearchOutlined />{'Tìm kiếm'}</Button>
						{(gr_ma_id !== undefined || ma_id_list !== undefined || !!state.us_id_list) &&
							<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => clearSearch()} >{shouldChangeText() ? 'Xóa tìm kiếm' : 'Xóa'}</Button>
						}
					</Col>
				</Col>
				{isGranted(AppConsts.Permission.Pages_DailyMonitoring_DailySale_Export) &&
					<Col {...cssColResponsiveSpan(8, 7, 5, 4, 4, 9)} style={{ textAlign: 'right' }}>
						<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => dispatch({type:"SET_STATE", payload: {visibleExportMachine: true, select: true }})}>{(window.innerWidth > 650) && 'Xuất dữ liệu hehe'}</Button>
					</Col>
				}
			</Row>
			<Row style={{ marginTop: 10 }}>
				<Col {...left}>
					<Row justify='center'>
						<h2 style={{ textAlign: "center" }}>Trạng thái bán hàng theo loại thanh toán</h2>
					</Row>
					<TablePaymentOfSaleMonitoring
						dailySaleMonitoringDto={dailySaleMonitoringResult}
					/>
					<Row justify='center'>
						<h2 style={{ textAlign: "center", marginTop: '10px' }}>Trạng thái bán hàng theo máy</h2>
					</Row>
					<TableSaleMonitoring
						is_printed={false}
						actionTable={actionTable}
						billingOfMachine={dailySaleMonitoringResult.listBillingOfMachine?dailySaleMonitoringResult.listBillingOfMachine.slice((state.currentPage - 1) * state.pageSize, (state.currentPage - 1) * state.pageSize + state.pageSize):[]}
						pagination={{
							position: ['topRight'],
							pageSize: state.pageSize,
							total: total,
							current: state.currentPage,
							showTotal: (tot) => ("Tổng: ") + tot + "",
							showQuickJumper: true,
							showSizeChanger: true,
							pageSizeOptions: pageSizeOptions,
							onShowSizeChange(current: number, size: number) {
								onChangePage(current, size)
							},
							onChange: (page: number, pagesize?: number) => onChangePage(page, pagesize)
						}}
					/>
				</Col>
				{state.visibleExportMachine &&
					<ModalExportDailySaleMonitoring skipCount={state.skipCount} pageSize={state.pageSize} dailySaleMonitoringDto={dailySaleMonitoringResult} onCancel={() => dispatch({type:"SET_STATE", payload: {visibleExportMachine: false}})} visible={state.visibleExportMachine} />
				}
			</Row>
		</Card >
	)
}

export default DailySaleMonitoring;

