import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { DiscountCodeDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableMainDiscountCode from './TableMainDiscountCode';

export interface IProps {
	discountListResult: DiscountCodeDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportDiscountCodeUser extends React.Component<IProps> {
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
		const { discountListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
							Xuất danh sách mã giảm giá
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'DiscountCode ' + moment().format('DD_MM_YYYY')}
								idPrint="drink_print_id"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								onCancel={() => { this.props.onCancel!() }}
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="drink_print_id">
					<TitleTableModalExport title='Danh sách mã giảm giá'></TitleTableModalExport>
					<TableMainDiscountCode
						discountListResult={discountListResult}
						pagination={false}
						export={true}
					/>

				</Col>
			</Modal>
		)
	}
}