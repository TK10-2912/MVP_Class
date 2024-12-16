import * as React from 'react';
import { Button, Table, } from 'antd';
import { EyeOutlined, } from '@ant-design/icons';
import { RepositoryDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import { EventTable } from '@src/lib/appconst';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';

export interface IProps {
	actionTable?: (item: RepositoryDto, event: EventTable) => void;
	repositoryListResult: RepositoryDto[],
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
}
export default class TableRepositoryAdmin extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		su_id_selected: undefined,
	};

	onAction = async (item: RepositoryDto, action: EventTable) => {
		this.setState({ su_id_selected: item.re_id });
		const { hasAction, actionTable } = this.props;
		if (hasAction !== undefined && hasAction === true && actionTable !== undefined) {
			actionTable(item, action);
		}
	}

	render() {
		const { repositoryListResult, pagination, hasAction } = this.props;
		let action: ColumnGroupType<RepositoryDto> = {
			title: 'Chức năng', children: [], key: 'action_Supplier_index', className: "no-print center", width: 150,
			render: (text: string, item: RepositoryDto) => (
				<div >
					<Button
						type="primary" icon={<EyeOutlined />} title={L('Xem chi tiết')}
						style={{ marginLeft: '10px' }}
						size='small'
						onClick={() => this.onAction(item!, EventTable.View)}
					></Button>
				</div>
			)
		};
		const columns: ColumnsType<RepositoryDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: RepositoryDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: L('Tên sản phẩm'), sorter: true, dataIndex: 'su_name', key: 'su_name', width: 150, render: (text: string, item: RepositoryDto) => <div>{item.pr_name}</div> },
			{ title: L('Tổng số lượng'), sorter: true, dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: RepositoryDto) => <div>{item.pr_quantity}</div> },
			{ title: L('Ngày tạo'), sorter: true, dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: RepositoryDto) => <div>{moment(item.re_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },
			// { title: L('Người sở hữu'), sorter: true, dataIndex: 'us_id_owner', key: 'us_id_owner', width: 150, render: (text: string, item: RepositoryDto) => <div>{item.us_id_owner}</div> },
		];
		if (hasAction !== undefined && hasAction === true) {
			columns.push(action);
		}

		return (
			<Table
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				className='centerTable'
				loading={this.state.isLoadDone}
				rowClassName={(record, index) => (this.state.su_id_selected === record.re_id) ? "bg-click" : "bg-white"}
				rowKey={record => "supplier__" + JSON.stringify(record)}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": L('No Data') }}
				columns={columns}
				dataSource={repositoryListResult.length > 0 ? repositoryListResult : []}
				pagination={this.props.pagination}
			/>
		)
	}
}