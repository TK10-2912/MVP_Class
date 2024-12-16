import { ColumnType } from "antd/lib/table";

export interface ColDisplay<RecordType = unknown> extends ColumnType<RecordType>{
	displayDefault:boolean;
	allowSort?:boolean;
}
export interface ColumnGroupColDisplay<RecordType> extends Omit<ColDisplay<RecordType>, 'dataIndex'> {
    children: ColumnsDisplayType<RecordType>;
}
export declare type ColumnsDisplayType<RecordType = unknown> = (ColumnGroupColDisplay<RecordType> | ColDisplay<RecordType>)[];
