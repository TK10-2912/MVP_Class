import * as React from 'react';
import { Col, Row, Button, Card, Input, Modal } from 'antd';
import { stores } from '@stores/storeInitializer';
import { RepositoryDto } from '@services/services_autogen';
import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import TableRepositoryUser from './components/TableRepositoryUser';
import ModalExportRepositoryUser from './components/ModalExportRepositoryUser';
import ModalRepositoryLogsUser from './components/ModalRepositoryLogsUser';

const { confirm } = Modal;

export default class RepositoryUser extends AppComponentBase {
	state = {
		isLoadDone: true,
		visibleExportRepository: false,
		visibleRepositoryLogs: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		pr_name: undefined,
	};
	repositorySelected: RepositoryDto;
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.repositoryStore.getAll(this.state.pr_name, this.state.skipCount, undefined);
		this.setState({ isLoadDone: true });
	}
	async componentDidMount() {
		await this.getAll();
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, 10);
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}

	actionTable = (repositorySelected: RepositoryDto, event: EventTable) => {
		if (event === EventTable.View || event === EventTable.RowDoubleClick) {
			this.repositorySelected = repositorySelected;
			this.setState({ visibleRepositoryLogs: true });
		}
	}
	render() {

		const self = this;

		const { repositoryListResult, totalReponsitory } = stores.repositoryStore;

		return (
			<Card>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 24, 8, 4, 4, 4)}>
						<h2>Kho lưu trữ</h2>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Tên sản phẩm</strong>
						<Input allowClear
							onChange={async (e) => { await this.setState({ pr_name: e.target.value }); this.handleSubmitSearch() }} placeholder={"Nhập tìm kiếm..."}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.pr_name}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 12, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
						<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
					</Col>
					<Col {...cssColResponsiveSpan(9, 12, 12, 4, 4, 4)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
						<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportRepository: true, select: false })}>{'Xuất dữ liệu'}</Button>
					</Col>
				</Row>
				{/* <Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 6)}>
						<strong>Tên sản phẩm</strong>
						<Input allowClear
							onChange={async (e) => { await this.setState({ pr_name: e.target.value }); this.handleSubmitSearch() }} placeholder={"Nhập tìm kiếm..."}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.pr_name}
						/>
					</Col>
				</Row> */}
				<TableRepositoryUser
					actionTable={this.actionTable}
					repositoryListResult={repositoryListResult}
					hasAction={true}
					pagination={{
						pageSize: this.state.pageSize,
						total: totalReponsitory,
						current: this.state.currentPage,
						showTotal: (tot) => "Tổng" + ": " + tot + "",
						showQuickJumper: true,
						showSizeChanger: true,
						pageSizeOptions: ['10', '20', '50', '100'],
						onShowSizeChange(current: number, size: number) {
							self.onChangePage(current, size)
						},
						onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
					}}
				/>
				{this.state.visibleExportRepository &&
					<ModalExportRepositoryUser
						repositoryListResult={repositoryListResult}
						visible={this.state.visibleExportRepository}
						onCancel={() => this.setState({ visibleExportRepository: false })}
					/>
				}
				{this.state.visibleRepositoryLogs &&
					<ModalRepositoryLogsUser
						repositorySelected={this.repositorySelected}
						visible={this.state.visibleRepositoryLogs}
						onCancel={() => this.setState({ visibleRepositoryLogs: false })}
						pagination={false}
					/>
				}
			</Card >
		)
	}
}