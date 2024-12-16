import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { L } from "@src/lib/abpUtility";
import AppConsts, { cssColResponsiveSpan, EventTable, pageSizeOptions } from "@src/lib/appconst";
import { FileMediaDto, FileParameter, MachineDto, MachineSoftLogsDto } from "@src/services/services_autogen";
import { Button, Card, Col, Input, message, Modal, Row, Space, Upload } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import React from "react";
import TableHistoryUpdate from "./TableFileMediaMachine";
import Icon, { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { stores } from "@src/stores/storeInitializer";
import ModalExportHistoryUpdate from "./ModalExportFileMedia";
import { SorterResult } from "antd/lib/table/interface";
import { eSort } from "@src/lib/enumconst";
import TableFileMediaMachine from "./TableFileMediaMachine";
import ModalExportFileMedia from "./ModalExportFileMedia";
import { ActionUpload } from "../../PictureManager";
import { RcFile } from "antd/lib/upload";
import RenameFileMedia from "./RenameFileMedia";
import FileSaver from 'file-saver';

export interface IProps {
	is_printed?: boolean;
	pagination?: TablePaginationConfig | false;
	machineSelected: MachineDto;
}
const { confirm } = Modal;

export default class MediaFileMachine extends AppComponentBase<IProps> {
	private fileInput: any = React.createRef();
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		visibleExportExcel: false,
		visibleRename: false,
		fi_me_name: undefined,
	};
	fileMediaSelected: FileMediaDto = new FileMediaDto();
	async componentDidMount() {
		await this.getAll();
	}
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.fileMediaStore.getAll(this.state.fi_me_name, this.props.machineSelected.ma_id, this.state.pageSize, undefined);
		this.setState({ isLoadDone: true });
	}
	actionTable = async (item: FileMediaDto, event: EventTable) => {
		let self = this;
		if (event == EventTable.Delete) {
			let title = <div>Bạn có chắc muốn xóa: <strong>{item.fi_me_name}</strong>.</div>
			let cancelText = (
				<div style={{ color: "red" }}>Hủy</div>
			)
			let okText = (
				<strong>Xác nhận</strong>
			)
			confirm({
				title: title,
				okText: okText,
				cancelText: cancelText,
				async onOk() {
					await stores.fileMediaStore.delete(item.fi_me_id);
					await self.getAll();
					message.success("Xóa thành công !")
					self.setState({ isLoadDone: true });
				},
				onCancel() {
				},
			});
		}
		if (event == EventTable.Rename) {
			this.fileMediaSelected.init(item);
			this.setState({ visibleRename: true });

		}
		if (event == EventTable.DownLoad) {
			this.onDownload(item)

		}
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}
	handleClearSearch = async () => {
		await this.setState({
			fi_me_name: undefined,
		})
		this.handleSubmitSearch();
	}
	handleChange = async (info) => {
		let item = info.file;
		if (item != undefined) {
			this.setState({ isLoadDone: false });
			let file = { "data": item, "fileName": item.name };
			let fileToUpload: FileParameter = file;
			await stores.fileMediaStore.createFile(this.props.machineSelected.ma_id, fileToUpload);
			await this.getAll();
			this.setState({ isLoadDone: true });
			message.success(L("Thêm mới thành công"))
		}
	}
	beforeUpload = (file: RcFile) => {
		const listAllowedType = ['video/', 'image/', 'text/html'];
		if (listAllowedType.some(type => file.type.startsWith(type))) {
			let limitSize = file.size / 1024 / 1024 < 10;
			if (!limitSize) {
				message.error('Tệp phải nhỏ hơn 10MB!');
				return Promise.reject(false);
			}
			return true
		}
		else {
			message.error('Chỉ được tải lên ảnh và video!');
			return Promise.reject(false);
		}
	}
	onSuccess = async () => {
		await this.getAll();
		this.setState({ visibleRename: false });
	}
	onDownload = async (item) => {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Accept', 'application/json');
		headers.append('Origin', AppConsts.appBaseUrl + "");
		fetch(this.getImageFileMedia(item.fi_me_md5!), {
			mode: 'cors',
			credentials: 'include',
			method: 'POST',
			headers: headers,
		})
			.then(response => {
				response.blob().then((blob) => {
					blob = new Blob([blob], { type: blob.type });
					FileSaver.saveAs(blob, item.fi_me_name);
				});
			})
			.then(json => console.log(json))
			.catch(error => console.log('Authorization failed: ' + error.message));
		message.success(L("Tải xuống thành công"));
		await this.setState({ isLoadDone: false });
	}
	render() {
		const { fileMediaListResult, totalFileMedia } = stores.fileMediaStore;
		let self = this;
		const props = {
			customRequest: this.handleChange,
			multiple: true,
			defaultFileList: [],
			showUploadList: false,
			beforeUpload: this.beforeUpload,
		};
		return (
			<Card>
				<Row gutter={[8, 8]} align="bottom">
					<Col {...cssColResponsiveSpan(24, 24, 24, 10, 10, 10)}>
						<p style={{ fontSize: 20 }}>Thư viện quảng cáo của máy: <strong> {this.props.machineSelected.ma_display_name}-{this.props.machineSelected.ma_code}</strong></p>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 9, 3, 3, 3)}>
						<strong>{L("Tên quảng cáo")}</strong>
						<Input value={this.state.fi_me_name} allowClear onChange={async (e) => { await this.setState({ fi_me_name: e.target.value }); this.handleSubmitSearch() }}
							onPressEnter={this.handleSubmitSearch}
							placeholder={'Nhập tìm kiếm'} />
					</Col>
					<Col {...cssColResponsiveSpan(12, 12, 6, 5, 5, 5)}>
						<Space>
							<Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{"Tìm kiếm"}</Button>
							{(this.state.fi_me_name) &&
								<Button danger title="Xoá tìm kiếm" icon={<DeleteOutlined />} onClick={this.handleClearSearch}>Xoá tìm kiếm</Button>
							}
						</Space>
					</Col>
					<Col {...cssColResponsiveSpan(12, 12, 24, 6, 6, 6)} style={{ textAlign: "right" }}>
						<Space>
							<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
							<Button type="primary" icon={<PlusOutlined />} onClick={() => this.fileInput.click()}>Thêm mới</Button>
						</Space>

					</Col>
				</Row>
				<TableFileMediaMachine
					actionTable={this.actionTable}
					is_printed={false}
					fileMediaListResult={fileMediaListResult}
					pagination={{
						position: ['topRight'],
						pageSize: this.state.pageSize,
						total: totalFileMedia,
						current: this.state.currentPage,
						showTotal: (tot) => ("Tổng: ") + tot + "",
						showQuickJumper: true,
						showSizeChanger: true,
						pageSizeOptions: pageSizeOptions,
						onShowSizeChange(current: number, size: number) {
							self.onChangePage(current, size)
						},
						onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
					}} />
				<ModalExportFileMedia
					fileMediaListResult={fileMediaListResult}
					visible={this.state.visibleExportExcel}
					onCancel={() => this.setState({ visibleExportExcel: false })}
				/>
				<Modal
					visible={this.state.visibleRename}
					footer={null}
					onCancel={() => this.setState({ visibleRename: false })}
					width="50vw"
					closable={false}
				>
					<RenameFileMedia onSuccess={this.onSuccess} fileMediaSelected={this.fileMediaSelected} onCancel={() => { this.setState({ visibleRename: false }) }} />
				</Modal>
				<Upload
					{...props}

				>
					<Button style={{ display: 'none' }} >
						<Icon type="upload" ref={fileInput => this.fileInput = fileInput} />
					</Button>
				</Upload>
			</Card >

		)
	}
}