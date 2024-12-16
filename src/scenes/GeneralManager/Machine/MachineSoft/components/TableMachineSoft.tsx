import * as React from 'react';
import { Button, message, Table } from 'antd';
import { EditOutlined, EyeOutlined, } from '@ant-design/icons';
import { AttachmentItem, MachineSoftDto, MachineSoftLogs } from '@services/services_autogen';
import { isGranted, L } from '@lib/abpUtility';
import { TablePaginationConfig } from 'antd/lib/table';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ModalMachineSoftLog from './ModalMachineSoftLog';
import moment from 'moment';
import AppConsts from '@src/lib/appconst';
import { ColumnsType, SorterResult } from 'antd/lib/table/interface';
import ModalMachineSoftLogNotUpdate from './ModalMachineSoftLogNotUpdate';
import { eMachineSoftLogsStatus } from '@src/lib/enumconst';

export interface IProps {
	onDoubleClickRow?: (item: MachineSoftDto) => void;
	createOrUpdateModalOpen?: (item: MachineSoftDto) => void;
	machineSoftListResult?: MachineSoftDto[],
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	onCreateUpdateSuccess?: () => void;
	NoScroll?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<MachineSoftDto> | SorterResult<MachineSoftDto>[]) => void;
}
export default class TableMachineSoft extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		visibleFile: false,
		itemAttachment: new AttachmentItem(),
		urlFileView: "",
		extFileView: "",
		visibleModalMachineSoftLog: false,
		visibleModalMachineSoftLogNotUpdate: false,
		idSelected: -1,

	};
	itemSelected: MachineSoftLogs[] = [];
	title: string;
	code: string;
	onDoubleClickRow = (item: MachineSoftDto) => {
		if (!!this.props.onDoubleClickRow) {
			this.props.onDoubleClickRow(item);
		}
	}
	get = (id, ext, key) => {
		let a = new AttachmentItem();
		a.id = id;
		a.key = key;
		a.ext = ext;
		a.isdelete = undefined!;
		return [a];
	}
	onClickRow = async (item: MachineSoftDto) => {
		// this.setState({ isLoadDone: false });
		// let urlItem = await this.getFileDocument(item);
		// await this.setState({ urlFileView: urlItem, extFileView: item.fi_do_extension });
		// const result = await this.get(item.fi_do_id, item.fi_do_extension, item.fi_do_name);
		// this.setState({
		// 	itemAttachment: result
		// });
		await this.setState({ visibleFile: true });
		this.setState({ isLoadDone: true });
	}
	createOrUpdateModalOpen = (item: MachineSoftDto) => {
		this.setState({ idSelected: item.ma_so_id });
		if (!!this.props.createOrUpdateModalOpen) {
			this.props.createOrUpdateModalOpen(item);
		}
	}
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess();
		}
	}

	render() {
		const { machineSoftListResult, pagination, hasAction } = this.props;

		let action = {
			title: "",
			dataIndex: "",
			key: "action_fileDocument_index",
			className: "no-print center",
			render: (text: string, item: MachineSoftDto) => {
				const buttonIcon = item.machineSoftLogs && item.machineSoftLogs.filter(item => item.ma_so_lo_upgrade_at != null).length > 0
					? true
					: false;
				return (
					<div>
						{isGranted(AppConsts.Permission.Pages_Manager_General_MachineSoft_Create) &&
							<Button
								type="primary"
								icon={buttonIcon ? <EyeOutlined /> : <EditOutlined />}
								title={buttonIcon ? L("Xem") : L("Chỉnh sửa")}
								style={{ marginLeft: '10px' }}
								size="small"
								onClick={() => { this.createOrUpdateModalOpen(item!) }}
							></Button>
						}
					</div>
				);
			}
		};

		const columns: ColumnsType<MachineSoftDto> = [
			{ title: L('STT'), key: 'no_fileDocument_index', render: (text: string, item: MachineSoftDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: L('Phiên bản cập nhật'), key: 'ma_so_version_code', render: (text: string, item: MachineSoftDto) => <div>{item.ma_so_version_code}</div> },
			{ title: L('Mã phiên bản cập nhật'), key: 'ma_so_nr', render: (text: string, item: MachineSoftDto) => <div>{item.ma_so_version_name}</div> },
			{
				title: L('Số máy được tạo cập nhật'), sorter: true, dataIndex: "ma_so_nr", key: 'ma_so_nr', className: 'hoverCell', onCell: (item: MachineSoftDto) => {
					return {
						onClick: (e) => {
							if (item.machineSoftLogs!.length > 0) {
								this.itemSelected = item.machineSoftLogs!;
								this.title = item.ma_so_version_name!;
								this.code = item.ma_so_version_code!.toString();
								this.setState({ visibleModalMachineSoftLogNotUpdate: true });
							} else message.warning("Chưa cập nhật máy")
						}
					}
				}, render: (text: string, item: MachineSoftDto) => <div>{AppConsts.formatNumber(item.ma_so_nr)}</div>
			},
			{
				title: L('Số máy đã cập nhật'),
				className: 'hoverCell',
				key: 'ma_so_nr',
				sorter: (a: MachineSoftDto, b: MachineSoftDto) => {
					const countA = a.machineSoftLogs?.reduce((total, e) => {
						if (e.ma_so_lo_status == eMachineSoftLogsStatus.UPDATED.num) {
							return total + 1;
						}
						return total;
					}, 0) || 0;

					const countB = b.machineSoftLogs?.reduce((total, e) => {
						if (e.ma_so_lo_status == eMachineSoftLogsStatus.UPDATED.num) {
							return total + 1;
						}
						return total;
					}, 0) || 0;

					return countA - countB;
				},
				onCell: (item: MachineSoftDto) => {
					return {
						onClick: (e) => {
							var listMachineUpdated = item.machineSoftLogs!.filter(i => i.ma_so_lo_status == eMachineSoftLogsStatus.UPDATED.num);
							if (listMachineUpdated.length > 0) {
								this.itemSelected = listMachineUpdated;
								this.title = item.ma_so_version_name!;
								this.setState({ visibleModalMachineSoftLog: true });
							} else message.warning("Chưa có máy nào được cập nhật")
						}
					}
				},
				render: (text: string, item: MachineSoftDto) => (
					<div style={{ cursor: "pointer" }}>
						{AppConsts.formatNumber(
							item.machineSoftLogs?.reduce((total, e) => {
								if (e.ma_so_lo_status == eMachineSoftLogsStatus.UPDATED.num) {
									return total + 1;
								}
								return total;
							}, 0) || 0
						)}
					</div>
				)
			},
			{
				title: L('File'), key: 'fi_do_name',
				onCell: (item: MachineSoftDto) => {
					return {
						onClick: () => this.onClickRow(item),
					};
				}, render: (text: string, item: MachineSoftDto) => <div style={{ cursor: "pointer" }}>{item.fi_id.key}</div>
			},
			{ title: L('Ngày tạo'), key: 'ma_so_created_at', dataIndex: "ma_so_created_at", sorter: true, render: (text: string, item: MachineSoftDto) => <div>{moment(item.ma_so_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },
		];
		if (hasAction !== undefined && hasAction === true && isGranted(AppConsts.Permission.Pages_Manager_General_MachineSoft_Create)) {
			columns.push(action);
		}
		return (
			<>
				<Table
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => { (hasAction !== undefined && hasAction === true) && this.onDoubleClickRow(record) }
						};
					}}
					scroll={this.props.NoScroll == false ? { x: 1500, y: 1000 } : { x: undefined, y: undefined }}
					className='centerTable'
					loading={!this.state.isLoadDone}
					rowClassName={(record, index) => (this.state.idSelected == record.ma_so_id) ? "bg-click" : "bg-white"}
					rowKey={record => "quanlyhocvien_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}	
					columns={columns}
					dataSource={machineSoftListResult != undefined ? machineSoftListResult : []}
					pagination={this.props.pagination}
					onChange={(a, b, sort: SorterResult<MachineSoftDto> | SorterResult<MachineSoftDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
				/>
				<ModalMachineSoftLog
					title={this.title}
					machineSoftLogSelected={this.itemSelected}
					isVisibleModal={this.state.visibleModalMachineSoftLog}
					setModalClose={() => this.setState({ visibleModalMachineSoftLog: false })}

				/>
				{
					this.state.visibleModalMachineSoftLogNotUpdate &&
					<ModalMachineSoftLogNotUpdate
						title={this.title}
						machineSoftLogSelected={this.itemSelected}
						isVisibleModal={this.state.visibleModalMachineSoftLogNotUpdate}
						setModalClose={() => this.setState({ visibleModalMachineSoftLogNotUpdate: false })}

					/>
				}
			</>
		)
	}
}