import { RepositoryDto, RepositoryLogs, } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';
import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import Table, { ColumnsType, TablePaginationConfig } from 'antd/lib/table';

export interface IProps {
	repositorySelected: RepositoryDto,
	onCancel?: () => void;
	visible: boolean;
	pagination: TablePaginationConfig | false;
}
export default class ModalRepositoryLogsAdmin extends React.Component<IProps> {
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
			{ title: L('Tên sản phẩm'), sorter: true, dataIndex: 'su_name', key: 'su_name', width: 150, render: (text: string, item: RepositoryLogs) => <div>{item.re_lo_desc}</div> },
			{ title: L('Tổng số lượng'), sorter: true, dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: RepositoryLogs) => <div>{item.re_lo_quantity}</div> },
			{ title: L('Ngày tạo'), sorter: true, dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: RepositoryLogs) => <div>{moment(item.re_lo_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },
			// { title: L('Người sở hữu'), sorter: true, dataIndex: 'us_id_owner', key: 'us_id_owner', width: 150, render: (text: string, item: RepositoryLogs) => <div>{item.us_id_owner}</div> },
		];
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2>{L('Xuất danh sách ') + L('lịch sử kho lưu trữ')}</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'repository' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="repository_print_id"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								onCancel={this.props.onCancel}
								componentRef={this.componentRef}
							/>
						</Col>
					</Row>
				}
				closable={false}
				footer={null}
				width='90vw'
				onCancel={this.props.onCancel}
				maskClosable={false}
			>

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='repository_print_id'>
					<TitleTableModalExport title={'Lịch sử kho lưu trữ: ' + repositorySelected.pr_name}></TitleTableModalExport>
					<Table
						className='centerTable'
						rowClassName={(record, index) => (this.state.su_id_selected === record.re_lo_id) ? "bg-click" : "bg-white"}
						rowKey={record => "supplier__" + JSON.stringify(record)}
						size={'middle'}
						bordered={true}
						locale={{ "emptyText": L('No Data') }}
						columns={columns}
						dataSource={(!!repositorySelected && !!repositorySelected.repositoryLogs) ? repositorySelected.repositoryLogs : []}
						pagination={this.props.pagination}
					/>

				</Col>
			</Modal>
		)
	}
}