import * as React from 'react';
import { Button, Table } from 'antd';
import { EditOutlined, EyeOutlined, } from '@ant-design/icons';
import { AttachmentItem, MachineSoftDto, MachineSoftLogs } from '@services/services_autogen';
import { isGranted, L } from '@lib/abpUtility';
import { TablePaginationConfig } from 'antd/lib/table';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ModalMachineSoftLog from './ModalMachineSoftLog';
import moment from 'moment';
import AppConsts from '@src/lib/appconst';

export interface IProps {
	onDoubleClickRow?: (item: MachineSoftDto) => void;
	createOrUpdateModalOpen?: (item: MachineSoftDto) => void;
	machineSoftListResult?: MachineSoftDto[],
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	onCreateUpdateSuccess?: () => void;
	NoScroll?: boolean;
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
		idSelected: -1,

	};
	itemSelected: MachineSoftLogs[] = [];
	title: string;
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
		const columns: any = [
			{ title: L('N.O'), key: 'no_fileDocument_index', render: (text: string, item: MachineSoftDto, index: number) => <div>{index + 1}</div> },
			{ title: L('Mã phiên bản cập nhật'), key: 'ma_so_version_code', render: (text: string, item: MachineSoftDto) => <div>{item.ma_so_version_code}</div> },
			{
				title: L('Số máy đã cập nhật'), className: 'hoverCell', key: 'ma_so_nr', onCell: (item: MachineSoftDto) => {
					return {
						onClick: (e) => {
							this.itemSelected = item.machineSoftLogs!;
							this.title = item.ma_so_version_name!;
							this.setState({ visibleModalMachineSoftLog: true });
						}
					}
				},
				render: (text: string, item: MachineSoftDto) => <div style={{ cursor: "pointer" }}>{AppConsts.formatNumber(item.ma_so_nr)}</div>
			},
			{ title: L('Phiên bản cập nhật'), key: 'ma_so_nr', render: (text: string, item: MachineSoftDto) => <div>{item.ma_so_version_name}</div> },
			{ title: L('Ngày tạo'), key: 'ma_so_created_at', render: (text: string, item: MachineSoftDto) => <div>{moment(item.ma_so_created_at).format("DD/MM/YYYY")}</div> },
			{
				title: L('File'), key: 'fi_do_name',
				onCell: (item: MachineSoftDto) => {
					return {
						onClick: () => this.onClickRow(item),
					};
				}, render: (text: string, item: MachineSoftDto) => <div style={{ cursor: "pointer" }}>{item.fi_id.key}</div>
			},
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
					locale={{ "emptyText": L('NoData') }}
					columns={columns}
					dataSource={machineSoftListResult != undefined ? machineSoftListResult : []}
					pagination={this.props.pagination}

				/>
				<ModalMachineSoftLog
					title={this.title}
					machineSoftLogSelected={this.itemSelected}
					isVisibleModal={this.state.visibleModalMachineSoftLog}
					setModalClose={() => this.setState({ visibleModalMachineSoftLog: false })}

				/>
			</>
		)
	}
}