import ActionExport from '@src/components/ActionExport';
import { ProductDto, TenantDto } from '@src/services/services_autogen';
import { Button, Col, Modal, Row } from 'antd';
import * as React from 'react';
import moment from 'moment';
import AppConsts from '@src/lib/appconst';
import * as ExcelJS from 'exceljs';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import Product from '..';
import TenantTable from './TenantTable';
export interface IProps {
	tenantListResult: TenantDto[];
	onCancel?: () => void;
	visible: boolean;
	noScroll?: boolean;
}

export default class ModalExportTenant extends AppComponentBase<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	render() {
		const { tenantListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							Xuất danh sách Tenant
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'tenant_print' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="tenant_print_print_id"
								isExcelWithImage={false}
								isWord={true}
								isDestroy={true}
								onCancel={() => this.props.onCancel!()}
								componentRef={this.componentRef}
							/>
						</Col>
					</Row>
				}
				closable={false}
				cancelButtonProps={{ style: { display: "none" } }}
				onCancel={() => { this.props.onCancel!() }}
				footer={null}
				width='90vw'
				maskClosable={false}

			>
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="tenant_print_print_id">
					<TitleTableModalExport title='Danh sách Tenant'></TitleTableModalExport>
					<TenantTable
						tenantListResult={tenantListResult}
						pagination={false}
						isLoadDone={true}
						hasAction={false}
					/>
				</Col>
			</Modal>
		)
	}
}