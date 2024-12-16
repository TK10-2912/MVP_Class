import { SettingOutlined } from "@ant-design/icons";
import { L } from "@src/lib/abpUtility";
import { Button, Checkbox, Col, Divider, Drawer, Menu, Popover, Row, Select, Tag } from "antd";
import { ColumnType, ColumnsType } from "antd/lib/table";
import React from "react";
import { ColumnsDisplayType } from "./ColumnsDisplayType";
const { Option } = Select;

const arrayRange = (start, stop, step) =>
	Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step);

export interface IProps {
	listColumn: ColumnsDisplayType<any>;
	onChangeColumn: (listColumn: ColumnsDisplayType<any>) => void;
}
export default class SelectedColumnDisplay extends React.Component<IProps> {
	state = {
		visible: false,
		checkedList: [],
		indeterminate: false,
		checkAll: false,
	};
	async componentDidMount() {
		if (this.props.listColumn != undefined) {
			await this.initData();
		}
	}
	async componentDidUpdate(prevProps) {
		if (this.props.listColumn.length !== prevProps.listColumn.length) {
			await this.initData();
		}
	}
	initData = async () => {
		this.setState({ isLoadDone: false });
		let defaultColumn = this.props.listColumn.map((e, i) => e.displayDefault === true ? i : undefined).filter(item => item !== undefined);
		if (defaultColumn === undefined) {
			defaultColumn = [];
		}
		this.onChangeColumn(defaultColumn);
		this.setState({ isLoadDone: true });
	}
	onChangeColumn = async (checkedList) => {
		await this.setState({
			checkedList: checkedList,
			indeterminate: !!checkedList.length && checkedList.length < this.props.listColumn.length,
			checkAll: checkedList.length === this.props.listColumn.length,
		});
		let listFilter = this.props.listColumn.filter((currentValue, index, arr) => checkedList.some(j => index === j))
		if (this.props.onChangeColumn != undefined) {
			this.props.onChangeColumn(listFilter);
		}
	};
	onCheckAllChange = e => {
		const { listColumn } = this.props
		const arr = this.state.checkAll === true ? [] : arrayRange(0, listColumn.length - 1, 1);
		this.onChangeColumn(arr);
	};

	render() {
		const { checkedList, indeterminate, checkAll } = this.state;
		const checkboxOptions = this.props.listColumn.map((column, index) => ({
			label: column.title?.toString(),
			value: index,
		}));
		return (
			<div style={{ width: "100%" }} title="Tùy chọn hiển thị">
				<Select
					mode="multiple"
					style={{ width: '100%' }}
					placeholder="Hiển thị"
					maxTagTextLength={20}
					maxTagCount={3}
					defaultValue={this.state.checkedList}
					value={this.state.checkedList}
					onChange={(values) => this.onChangeColumn(values)}
					dropdownRender={menu => (<div>
						{menu}
						<Divider style={{ margin: '4px 0' }} />
						<div style={{ padding: '4px 8px', cursor: 'pointer', textAlign: "left" }} onMouseDown={e => e.preventDefault()} onClick={() => this.setState({ onCheckAllChange: true })} >
							<Checkbox
								indeterminate={indeterminate}
								onChange={this.onCheckAllChange}
								checked={checkAll}
							>
								Chọn tất cả
							</Checkbox>
						</div>
					</div>)}
				>
					{this.props.listColumn.map((option: ColumnType<any>, index: number) => (
						<Option key={"option_" + index} value={index} >{option.title?.toString()}</Option>

					))}

				</Select>
			</div>
		);
	}
}



