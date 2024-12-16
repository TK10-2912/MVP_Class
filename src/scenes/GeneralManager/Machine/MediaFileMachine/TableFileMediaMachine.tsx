import { DeleteFilled, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { L } from "@src/lib/abpUtility";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { FileMediaDto, MachineSoftLogsDto } from "@src/services/services_autogen";
import { Button, Image, Modal, Space, Table, Tag, } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
export interface IProps {
	is_printed?: boolean;
	pagination?: TablePaginationConfig | false;
	fileMediaListResult?: FileMediaDto[];
	actionTable?: (item: FileMediaDto, event: EventTable) => void;
}
export default class TableFileMediaMachine extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
		visibleModalViewImage: false,
		visibleModalViewVideo: false,
	};
	fileMediaSelected: FileMediaDto = new FileMediaDto();
	ext_image = ['.png', '.jpg', '.jepg', '.webp'];
	onAction = (item: FileMediaDto, action: EventTable) => {
		if (this.props.actionTable !== undefined) {
			this.props.actionTable(item, action);
		}
	}
	render() {
		const { fileMediaListResult, pagination } = this.props;
		const columns = [
			{ title: L('STT'), key: 'ma_index', render: (_: number, item: FileMediaDto, index: number) => <div>{pagination != false ? pagination!.pageSize! * (pagination!.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: L('Tên quảng cáo'), classNames: "fi_me_name", key: 'fi_me_name', onCell: (item: FileMediaDto) => {
					return {
						onClick: async (e) => {
							this.fileMediaSelected = item;
							if (this.ext_image.includes(this.fileMediaSelected!.fi_me_extension!)) {
								await this.setState({ visibleModalViewImage: true });
							} else
								await this.setState({ visibleModalViewVideo: true });
						}
					}
				}, render: (_: string, item: FileMediaDto) => <div>{item.fi_me_name}</div>
			},
			{ title: 'Kích thước', key: 'fi_me_size', sorter: (a: FileMediaDto, b: FileMediaDto) => a.fi_me_size - b.fi_me_size, render: (_: string, item: FileMediaDto) => <div>{AppConsts.convertResourceFile(Math.round(item.fi_me_size / 1024 * 10) / 10)}</div> },
			{ title: "Thời gian tạo", sorter: (a, b) => moment(a.fi_me_created_at).unix() - moment(b.fi_me_created_at).unix(), dataIndex: "fi_me_created_at", key: 'fi_me_created_at', render: (_: string, item: FileMediaDto) => <div>{!!item.fi_me_created_at ? moment(item.fi_me_created_at).format("DD/MM/YYYY - HH:mm:ss") : "Máy chưa được cập nhật phiên bản này!"}</div> },
			{ title: "Thời gian cập nhật", sorter: (a, b) => moment(a.fi_me_updated_at).unix() - moment(b.fi_me_updated_at).unix(), dataIndex: "fi_me_updated_at", key: 'fi_me_updated_at', render: (_: string, item: FileMediaDto) => <div>{!!item.fi_me_updated_at ? moment(item.fi_me_updated_at).format("DD/MM/YYYY - HH:mm:ss") : "Máy chưa được cập nhật phiên bản này!"}</div> },
		];
		let action: any = {
			title: "Chức năng", width: 100, key: "action_drink_index", className: "no-print", dataIndex: '', fixed: "right",
			render: (_: string, item: FileMediaDto) => (
				<div>
					<Space>
						<Button
							type="primary" icon={<EditOutlined />} title="Đổi tên"
							size='small'
							onClick={() => this.onAction(item!, EventTable.Rename)}
						></Button>
						<Button
							danger icon={<DeleteFilled />} title="Xóa"
							size='small'
							onClick={() => this.onAction(item!, EventTable.Delete)}
						></Button>
						<Button
							icon={<DownloadOutlined />} title="Tải xuống"
							size='small'
							onClick={() => this.onAction(item!, EventTable.DownLoad)}
						></Button>
					</Space>
				</div>
			)
		};
		if (
			pagination &&
			this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update)
		) {
			columns.push(action);
		}

		return (
			<>
				<Table
					className='centerTable'
					rowClassName={(record, index) => (record.fi_me_id) ? "text-black" : "text-red"}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'small'}
					bordered={true}

					columns={columns}
					dataSource={fileMediaListResult !== undefined && fileMediaListResult!.length > 0 ? fileMediaListResult : []}
					pagination={this.props.pagination}
				/>
				<Image
					preview={{
						visible: this.state.visibleModalViewImage,
						onVisibleChange: (visible) => this.setState({ visibleModalViewImage: visible }),
					}}
					src={this.getImageFileMedia(this.fileMediaSelected.fi_me_md5!)}
					style={{ display: 'none' }}
				/>
				<Modal
					visible={this.state.visibleModalViewVideo}
					footer={null}
					onCancel={() => this.setState({ visibleModalViewVideo: false })}
					width="60vw"
					closable={false}
					maskClosable
				>
					<video
						controls
						autoPlay
						src={this.getImageFileMedia(this.fileMediaSelected.fi_me_md5!)}
						style={{ width: '100%' }}
					/>
				</Modal>
			</>
		)
	}
}