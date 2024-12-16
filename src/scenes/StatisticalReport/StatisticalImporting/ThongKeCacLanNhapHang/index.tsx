import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Modal, Row } from 'antd';
import { ExportOutlined, LineChartOutlined } from '@ant-design/icons';
import TableImportingStatistical from './component/TableImportingStatistical';
import ExportImportingStatistic from './component/ExportImportingStatistic';
import BarChartStatic from './component/BartChartStatic';
import { L } from '@src/lib/abpUtility';
import StatisticSearch from '@src/components/Manager/StatisticSearch';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { SearchInputUser } from '@src/stores/statisticStore';

export default class StatisticalImporting extends React.Component {
	state = {
		isLoadDone: true,
		dr_search: "",
		dr_price: undefined,
		su_id: undefined,
		skipCount: 0,
		maxResultCount: 10,
		onChangePage: 1,
		visibleModalCreateUpdate: false,
		visibleExportExcelDrink: false,
		visibleInfoDrink: false,
		pageSize: 10,
		currentPage: 1,
		isBartChartStatic:false,
	}
	dateTitle: string = "";
	inputSearch: SearchInputUser = new SearchInputUser(undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined);
	today: Date = new Date();
	//Chua publish chua biet kieu du lieu de day vao Table
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false })
		await stores.statisticStore.statisticImportingOfMachine(this.inputSearch);
		this.setState({ isLoadDone: true })
	}

	handleSubmitSearch = (input: SearchInputUser) => {
		this.inputSearch = input;
		this.onChangePage(1,this.state.pageSize)
	}
	onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
	onCancelChart = async () => {
		await this.setState({ isBartChartStatic: false })
	}
	handleBarChartStatic() {
		this.setState({ isBartChartStatic: true });
	}
	render() {
		let self = this;
		const { importingStatisticListResult } = stores.statisticStore;
		return (
			<Card>
				<h2 style={{ textAlign: 'center', paddingTop: '10px' }}>{"THỐNG KÊ CÁC LẦN NHẬP HÀNG "+ this.dateTitle}</h2>
                <Row gutter={16}>
                    <Col {...cssColResponsiveSpan(24,24,24,24,16,16)} >
					<Col  style={{ textAlign: "left" }}>
                        <StatisticSearch onSearchStatistic={(input) => { this.handleSubmitSearch(input) }} />
                    </Col>
                    </Col>
                    <Col {...cssColResponsiveSpan(24,24,24,16,8,8)} style={{textAlign:"end"}}>
						<Button style={{ marginRight:"10px" }} type="primary" icon={<LineChartOutlined />} title={L('Biểu đồ thống kê các lần nhập hàng')} onClick={() => this.handleBarChartStatic()} >{L('Biểu đồ thống kê các lần nhập hàng')}</Button>
                        <Button style={{marginTop:"10px"}} type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDrink: true })}>Xuất dữ liệu</Button>
                    </Col>
                </Row>
				<Row style={{ paddingTop: '10px' }}>
					<Col span={24} style={{ overflowY: "auto" }}>
						<TableImportingStatistical
							importingStatisticListResult={importingStatisticListResult}
							isLoadDone={this.state.isLoadDone}
						/>
					</Col>
				</Row>
				<ExportImportingStatistic
					importingStatisticListResult={importingStatisticListResult}
					visible={this.state.visibleExportExcelDrink}
					onCancel={() => this.setState({ visibleExportExcelDrink: false })}
				/>
				 <Modal
					visible={this.state.isBartChartStatic}
					onCancel={() => { this.setState({ isBartChartStatic: false }) }}
					footer={null}
					width='80vw'
					closable={false}
					maskClosable={true}
				>
					<BarChartStatic
                    importingStatisticListResult={importingStatisticListResult}
                    onCancelChart={this.onCancelChart}
					title={this.dateTitle}
                    />
				</Modal>
			</Card>
		)
	}
}
