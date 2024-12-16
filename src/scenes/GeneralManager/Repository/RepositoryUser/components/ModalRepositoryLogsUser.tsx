import {  RepositoryDto, RepositoryLogs } from '@services/services_autogen';
import { Col, Modal, Row, Tag } from 'antd';
import * as React from 'react';
import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import Table, { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { stores } from '@src/stores/storeInitializer';
import { eRepositoryLogAction, valueOfeRepositoryLogAction } from '@src/lib/enumconst';

export interface IProps {
	repositorySelected: RepositoryLogs[],
	onCancel?: () => void;
	pagination: TablePaginationConfig | false;
}
export default class ModalRepositoryLogsUser extends React.Component<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
		su_id_selected: undefined,

	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	render() {
		const { repositorySelected, pagination } = this.props;
		const columns: ColumnsType<RepositoryLogs> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: RepositoryLogs, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: L('Trạng thái'), sorter: true, dataIndex: 'su_name', key: 'su_name', width: 150, render: (text: string, item: RepositoryLogs) =>
					<div>
						{item.re_lo_action == eRepositoryLogAction.NONE.num && <Tag>{valueOfeRepositoryLogAction(item.re_lo_action)}</Tag>}
						{item.re_lo_action == eRepositoryLogAction.IMPORT_GOODS.num && <Tag color='green'>{valueOfeRepositoryLogAction(item.re_lo_action)}</Tag>}
						{item.re_lo_action == eRepositoryLogAction.IMPORT_REPOSITORY.num && <Tag color='blue'>{valueOfeRepositoryLogAction(item.re_lo_action)}</Tag>}
						{item.re_lo_action == eRepositoryLogAction.EXPORT_REPOSITORY.num && <Tag color='volcano'>{valueOfeRepositoryLogAction(item.re_lo_action)}</Tag>}
					</div>
			},
			{ title: L('Số lượng'), sorter: (a,b)=>a.re_lo_quantity-b.re_lo_quantity, dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: RepositoryLogs) => <div>{item.re_lo_quantity}</div> },
			// { title: L('Tổng số lượng'), sorter: true, dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: RepositoryLogs) => <div>{item.}</div> },
			{ title: L('Thời gian'),sorter: (a,b)=> moment(a.re_lo_created_at).unix()- moment(b.re_lo_created_at).unix(), dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: RepositoryLogs) => <div>{moment(item.re_lo_created_at).format("DD/MM/YYYY HH:mm")}</div> },
		]; 
		return (
			<>
				{/* <h2>{`Thông tin lịch sử sản phẩm "${stores.sessionStore.getNameProduct(this.props.repositorySelected.pr_id)}"`}</h2> */}
					<Table
						className='centerTable'
						rowClassName={(record, index) => (this.state.su_id_selected === record.re_lo_id) ? "bg-click" : "bg-white"}
						rowKey={record => "supplier__" + JSON.stringify(record)}
						size={'middle'}
						bordered={true}
						
						columns={columns}
						// dataSource={(!!repositorySelected && !!repositorySelected.repositoryLogs) ? repositorySelected.repositoryLogs : []}
						pagination={this.props.pagination}
					/>

			</>

		)
	}
}