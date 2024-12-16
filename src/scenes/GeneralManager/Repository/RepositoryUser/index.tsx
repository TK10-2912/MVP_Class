import * as React from 'react';
import { Col, Row, Button, Card, Modal } from 'antd';
import { stores } from '@stores/storeInitializer';
import { RepositoryDto } from '@services/services_autogen';
import { ExportOutlined, } from '@ant-design/icons';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ModalExportRepositoryUser from './components/ModalExportRepositoryUser';
import TableRepositoryUser from './components/TableRepositoryUser';
import { isGranted } from '@src/lib/abpUtility';
import ModalRepositoryLogsAdmin from '../RepositoryAdmin/components/ModalRepositoryLogsAdmin';
const { confirm } = Modal;
export interface IProps {
	// repositoryDetailListResult?: RepositoryDetailDto[];
}
export default class RepositoryUser extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleExportRepository: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		pr_id: undefined,
		re_de_product_status: undefined,
		su_id: undefined,
		visibleRepositoryLogs: false,
	};
	repositorySelected: RepositoryDto = new RepositoryDto();;
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.repositoryStore.getAll(this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true });
	}
	async componentDidMount() {
		await stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
		// if (!this.props.repositoryDetailListResult) {
			await this.getAll();
		// }
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
	onClear = () => {
		this.setState({
			su_id: undefined,
			pr_id: undefined,
		})
		this.handleSubmitSearch();
	}
	actionTable = (repositorySelected: RepositoryDto, event: EventTable) => {
		if (event === EventTable.View || event === EventTable.RowDoubleClick) {
			this.repositorySelected = repositorySelected;
			this.setState({ visibleRepositoryLogs: true });
		}
	}
	render() {
		const self = this;
		const {  totalReponsitory, repositoryListResult } = stores.repositoryStore;
		return (
			<Card>
				<Row gutter={[8, 8]} align='bottom'>
					{isGranted(AppConsts.Permission.Pages_Manager_General_Repository_Export) &&
						<Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
							<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportRepository: true, select: false })}>{'Xuất dữ liệu'}</Button>
						</Col>}
				</Row>
				<TableRepositoryUser
					// onSuccess={this.onSuccess}
					// changeColumnSortExportRepository={this.changeColumnSort}
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
						pageSizeOptions: pageSizeOptions,
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