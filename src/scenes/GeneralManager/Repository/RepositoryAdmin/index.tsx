import * as React from 'react';
import { Col, Row, Button, Card, Input, Modal } from 'antd';
import { stores } from '@stores/storeInitializer';
import { RepositoryDto } from '@services/services_autogen';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import TableRepositoryAdmin from './components/TableRepositoryAdmin';
import ModalExportRepositoryAdmin from './components/ModalExportRepositoryAdmin';
import ModalRepositoryLogsAdmin from './components/ModalRepositoryLogsAdmin';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
const { confirm } = Modal;

export default class RepositoryAdmin extends AppComponentBase {
	state = {
		isLoadDone: true,
		visibleExportRepository: false,
		visibleRepositoryLogs: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		us_id_list: undefined,
		pr_name: undefined,
	};
	repositorySelected: RepositoryDto;
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.repositoryStore.getAllByAdmin(this.state.us_id_list, this.state.pr_name, this.state.skipCount, this.state.pageSize);
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
	clearSearch = async () => {
		await this.setState({
			pr_name: undefined,
			us_id_list: undefined,
		})
		this.getAll();
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
						<strong>Người sở hữu</strong>
						<SelectUserMultiple
							us_id_list={this.state.us_id_list}
							onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.getAll() }}
						></SelectUserMultiple>
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
						{(!!this.state.pr_name || !!this.state.us_id_list) &&
							<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
						}
					</Col>
					<Col {...cssColResponsiveSpan(9, 12, 12, 4, 4, 4)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
						<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportRepository: true, select: false })}>{'Xuất dữ liệu'}</Button>
					</Col>
				</Row>
				{/* <Row gutter={[8, 8]} align='bottom'>
					
				</Row> */}
				<TableRepositoryAdmin
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
					<ModalExportRepositoryAdmin
						repositoryListResult={repositoryListResult}
						visible={this.state.visibleExportRepository}
						onCancel={() => this.setState({ visibleExportRepository: false })}
					/>
				}
				{this.state.visibleRepositoryLogs &&
					<ModalRepositoryLogsAdmin
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