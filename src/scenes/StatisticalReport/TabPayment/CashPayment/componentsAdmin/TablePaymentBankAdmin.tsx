import * as React from 'react';
import { EventTable } from '@src/lib/appconst';
import { PaymentBankDto } from '@src/services/services_autogen';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { Table, } from 'antd';

export interface IProps {
	actionTable?: (item: PaymentBankDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
}

export default class TablePaymentBankAdmin extends React.Component<IProps> {
	state = {
		im_id_selected: undefined,
	}
	onAction = (item: PaymentBankDto, action: EventTable) => {
		this.setState({ im_id_selected: item.pa_ba_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}

	render() {
		const { pagination } = this.props;

		const columns: ColumnsType<PaymentBankDto> = [
			{ title: "STT", key: "stt_importing_index", width: 50, render: (index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Mã thanh toán", key: "im_code", render: (text: string) => <div>{ }</div> },
			{ title: "Trạng thái", key: "im_code", render: (text: string) => <></> },
			{ title: "Số tiền thanh toán", key: "im_code", render: (text: string) => <div>{ }</div> },
			{ title: "Máy bán nước", key: "ma_id", render: (text: number) => <div> { } </div> },
			{ title: "Người thanh toán", key: "id_us_index", render: (text: number) => <div> { } </div> },
			{ title: "Ngày nhập", key: "im_created_at_index", render: (text: string) => <div> { }</div> },
		];

		return (
			<Table
				className='centerTable'
				loading={!this.props.isLoadDone}
				scroll={{ x: 100 }}
				columns={columns}
				size={'middle'}
				bordered={true}
				
				dataSource={[]}
				pagination={this.props.pagination}
				rowClassName={(record, index) => (this.state.im_id_selected === record.pa_ba_id) ? "bg-click" : "bg-white"}
				rowKey={record => "importing_table" + JSON.stringify(record)}
			/>
		)
	}
}
