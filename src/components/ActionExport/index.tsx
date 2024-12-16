import * as React from 'react';
import { Button } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { CloseOutlined, FileExcelOutlined, FileWordOutlined, PrinterOutlined } from '@ant-design/icons';
import ReactToPrint from 'react-to-print';

export interface IProps {
    isPrint?: boolean,
    idPrint: string,
    isExcel?: boolean,
    isExcelWithImage?: boolean,
    isWord: boolean,
    sizeSmall?: boolean,
    nameFileExport?: string,
    headerPrint?: string | undefined,
    componentRef?: any,
    onCancel?: () => void,
    isDestroy?: boolean,
    noScrollReport?: () => void,
    isScrollReport?: () => void,
    exportExcelWithImage?: () => void,

}

export default class ActionExport extends AppComponentBase<IProps> {
    noScrollReport = () => {
        if (!!this.props.noScrollReport) {
            this.props.noScrollReport();
        }
    };
    isScrollReport = () => {
        if (!!this.props.isScrollReport) {
            this.props.isScrollReport();
        }
    };
    render() {
        const { idPrint, isExcel, isWord, isDestroy, nameFileExport, isExcelWithImage, exportExcelWithImage } = this.props;
        let contentHTML = "<html><head> ";
        contentHTML += "<style>";
        contentHTML += "@page {";
        contentHTML += "size: A4;";
        contentHTML += "margin-left: 5mm; overflow: scroll;}";
        contentHTML += "@media print {";
        contentHTML += ".ant-table-column-sorter {display: none!important} ";
        contentHTML += ".ant-tabs-nav-list {display: none!important}";
        contentHTML += "#labelClass {page-break-before: always; }";
        contentHTML += "color:rgb(255 ,255 ,255) !important;";
        contentHTML += ".no-print  { display:none;overflow: hidden;height:0;}";
        contentHTML += ".color-black-print  {color:rgb(0 0 0) !important;}";
        contentHTML += ".page-break {margin-top: 1rem;display: flex;page-break-before: auto;page-break-inside: avoid}";
        contentHTML += "html, body { height: initial !important;overflow: initial !important;}";
        contentHTML += "}";
        contentHTML += "table {width: 100%;}";
        contentHTML += "table, th, td, thead, tr {border: 0.01em solid black; border-collapse: collapse; text-align: center;}";
        contentHTML += "td {padding: 0px 7px}";
        contentHTML += ".noneBorder table, .noneBorder th, .noneBorder td, .noneBorder tr {border: none !important;}";
        contentHTML += "tr {page-break-inside: avoid;}";
        contentHTML += "</style></head>";
        contentHTML += "<body>";
        contentHTML += "<table>";
        contentHTML += "  <thead>";
        contentHTML += "    <tr><th>Header 1</th><th>Header 2</th></tr>";
        contentHTML += "  </thead>";
        contentHTML += "  <tbody>";
        contentHTML += "    <tr><td>Data 1</td><td>Data 2</td></tr>";
        contentHTML += "    <!-- More rows -->";
        contentHTML += "  </tbody>";
        contentHTML += "</table>";
        contentHTML += "</body>";
        contentHTML += "</html>";
        
        const pageStyle = contentHTML;
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "end", gap: 8 }}>
                {!!this.props.componentRef && this.props.isPrint !== false &&
                    <ReactToPrint
                        pageStyle={pageStyle}
                        onBeforeGetContent={this.props.noScrollReport}
                        onAfterPrint={this.props.isScrollReport}
                        content={() => this.props.componentRef}
                        trigger={() =>
                            <Button
                                type="primary"
                                title='In'
                                icon={<PrinterOutlined />}
                            >
                                {(window.innerWidth >= 768) && 'In'}
                            </Button>
                        }
                    />
                }
                {(!!isWord && <Button
                    type="primary"
                    title='Tải xuống Word'
                    icon={<FileWordOutlined />}
                    onClick={async () => {
                        await this.noScrollReport();
                        await this.exportHTMLToDoc(idPrint, nameFileExport!);
                        await this.isScrollReport();
                    }}
                >
                    {(window.innerWidth >= 768) && 'Tải xuống Word'}
                </Button>)}
                {(!!isExcel || !!isExcelWithImage) && <Button
                    type="primary"
                    title='Tải xuống Excel'
                    icon={<FileExcelOutlined />}
                    onClick={async () => {
                        await this.noScrollReport();
                        if (!!isExcelWithImage && !!exportExcelWithImage) {
                            exportExcelWithImage();
                        } else {
                            await this.exportHTMLToExcel(idPrint, nameFileExport!);
                        }
                        await this.isScrollReport();
                    }}
                >
                    {(window.innerWidth >= 768) && 'Tải xuống Excel'}
                </Button>}
                {!!isDestroy &&
                    <Button
                        danger
                        title='Hủy'
                        icon={<CloseOutlined />}
                        onClick={() => { this.props.onCancel!() }}
                    >
                        {(window.innerWidth >= 768) && 'Hủy'}
                    </Button>
                }
            </div >
        )
    }
}