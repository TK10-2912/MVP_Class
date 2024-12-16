import { SortAscendingOutlined, SortDescendingOutlined } from "@ant-design/icons";
import { L } from "@src/lib/abpUtility";
import { Button, Col, Divider, Drawer, Row, Select, Tag } from "antd";
import { ColumnType, } from "antd/lib/table";
import React from "react";
import { ColumnsDisplayType } from "../SelectedColumnDisplay/ColumnsDisplayType";
const { Option } = Select;

export interface IProps {
	listColumn: ColumnsDisplayType<any>;
	onChangeColumn: (fieldSort: string) => void;
	onChangeOrder?: (order: number) => void;
}
export default class SelectedColumnSort extends React.Component<IProps> {
	state = {
		visible: false,
		checkedList: undefined,
		// order: eDocumentSort.ASC.num,
	};

	onChangeColumn = async (checkedList) => {
		await this.setState({
			checkedList: checkedList,
		});
		let listFilter = this.props.listColumn.filter((currentValue, index, arr) => checkedList == index)
		if (this.props.onChangeColumn != undefined) {
			this.props.onChangeColumn(listFilter[0].key!.toString());
		}
	};
	onChangeOrder = async () => {
		if (this.props.onChangeOrder != undefined) {
			// this.props.onChangeOrder(this.state.order);
		}
	};


	render() {

		return (
			<Row >
				<Col span={3} style={{ textAlign: "center" }}>
					{/* {this.state.order == eDocumentSort.DES.num ?
						<Button type="default" style={{ textAlign: "center", width: '100%' }} onClick={async () => { await this.setState({ order: eDocumentSort.ASC.num }); this.onChangeOrder(); }} title={valueOfeDocumentSort(eDocumentSort.ASC.num)} icon={<SortDescendingOutlined style={{ fontSize: '18px' }} />} />
						:
						<Button type="default" style={{ textAlign: "center", width: '100%' }} onClick={async () => { await this.setState({ order: eDocumentSort.DES.num }); this.onChangeOrder(); }} title={valueOfeDocumentSort(eDocumentSort.DES.num)} icon={<SortAscendingOutlined style={{ fontSize: '18px' }} />} />
					} */}
				</Col>
				<Col span={21}>
					<Select
						style={{ width: '100%' }}
						placeholder={L('Show')}
						maxTagTextLength={20}
						maxTagCount={3}
						defaultValue={this.state.checkedList}
						value={this.state.checkedList}
						onChange={(values) => this.onChangeColumn(values)}
						dropdownRender={menu => (<div>
							{menu}
							<Divider style={{ margin: '4px 0' }} />
							<div style={{ padding: '4px 8px', cursor: 'pointer', textAlign: "left" }} onMouseDown={e => e.preventDefault()} onClick={() => this.setState({ onCheckAllChange: true })} >
							</div>
						</div>)}
					>
						{this.props.listColumn.filter(item => item.allowSort == true).map((option: ColumnType<any>, index: number) => (
							<Option key={"option_" + index} value={index} >{option.title?.toString()}</Option>

						))}
					</Select>
				</Col>

			</Row>


		);
	}
}



