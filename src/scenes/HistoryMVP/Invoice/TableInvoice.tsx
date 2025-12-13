import { ClusterOutlined, DeleteFilled, EditOutlined } from "@ant-design/icons";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { InvoiceDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, message, Table } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
export interface IProps {
	listInvoice: InvoiceDto[];
	pagination: TablePaginationConfig | false;
}
export default class TableInvoice extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
	};
	base64ToPdfUrl = (base64: string) => {
			const byteCharacters = atob(base64);
			const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0));
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: "application/pdf" });
			return URL.createObjectURL(blob);
		};
		getFilePdfInvoice = async(input: InvoiceDto)=>{
			let result = await stores.invoiceStore.getFilePDF(input);
			if(result && result.fileBase64){
				const pdfUrl = this.base64ToPdfUrl(result.fileBase64);
				window.open(pdfUrl, '_blank')?.focus();
			}
			else{
				message.error("Hoá đơn điện tử không tồn tại!");
			}
		}
	render() {
		const { listInvoice, pagination } = this.props;
		
		const columns: ColumnsType<InvoiceDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: InvoiceDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Id giao dịch', dataIndex: '', key: 'transactionID',
				render: (text: string, item: InvoiceDto, index: number) => <div>{item.transactionID}</div>
			},
			{
				title: 'Số hóa đơn', dataIndex: '', key: 'invoiceNo',
				render: (text: string, item: InvoiceDto, index: number) => <div>{item.invoiceNo}</div>
			},
			{
				title: 'Mã bí mật', dataIndex: '', key: 'reservationCode',
				render: (text: string, item: InvoiceDto, index: number) => <div>{item.reservationCode}</div>
			},
			{
				title: 'Ngày phát hành', dataIndex: '', key: 'create_date',
				render: (text: string, item: InvoiceDto, index: number) => <div>{moment(item.in_created_at).format('DD/MM/YYYY')}</div>
			}
			
			
		];
		columns.push({
            title: "Hoá đơn điện tử",
            width: 100,
            key: "invoice",
            render: (text: string, item: InvoiceDto) => (
                <div>
                    <Button type="link" onClick={(e) => {
                        if (item) {
                            console.log("aaaa",item);
                            this.getFilePdfInvoice(item);
                        }
                        else {
                            message.error("Hoá đơn điện tử không tồn tại!");
                        }
                    }}>Xem hoá đơn</Button>
                </div>
            )
        });
		return (
				<Table
					// sticky
					className='centerTable'
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => { this.getFilePdfInvoice(record!) }
						};
					}}
					rowClassName={(record, index) => (record.transactionID) ? "text-black" : "text-red"}
					loading={!this.state.isLoadDone}
					rowKey={record => "invoice_" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					columns={columns}
					dataSource={listInvoice !== undefined && listInvoice!.length > 0 ? listInvoice : []}
					pagination={this.props.pagination}
				/>
		)
	}
}