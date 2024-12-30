import * as React from 'react'
import { Button, Dropdown } from 'antd';
// import AppComponentBase from '@src/components/Manager/AppComponentBase';
import {  indexBase } from '../Manager/AppComponentBase/indexBase';
import { CloseOutlined, FileExcelOutlined, FileWordOutlined, PrinterOutlined } from '@ant-design/icons';
import ReactToPrint from 'react-to-print';
import Menu from 'antd/lib/menu';

type placement = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight" | undefined;
type trigger = "click" | "hover" | "contextMenu";
export interface IProps {
    isPrint?: boolean,
    idPrint: string,
    idFooter?: string,
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
    isDropdown?: boolean,
    placement?: placement,
    trigger?: trigger,
}

const IActionExport: React.FC<IProps> = (props) => {
    const noScrollReport = () =>{
        if(props.noScrollReport){
            props.noScrollReport();
        };
    }
    const isScrollReport = () => {
        if(props.isScrollReport){
            props.isScrollReport();
        }
    }
    
    const {idPrint, idFooter, isExcel, isWord, isDestroy, nameFileExport, isExcelWithImage, exportExcelWithImage,onCancel} = props;
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
        const items = (
          <Menu>
            <Menu.Item key="print">
              {!!props.componentRef && props.isPrint !== false && (
                <ReactToPrint
                  pageStyle={pageStyle}
                  onBeforeGetContent={props.noScrollReport}
                  onAfterPrint={props.isScrollReport}
                  content={() => props.componentRef}
                  trigger={() => (
                    <Button
                      type="primary"
                      title='In'
                      icon={<PrinterOutlined />}
                    >
                      {(window.innerWidth >= 768) && 'In'}
                    </Button>
                          )}
                />
                  )}
            </Menu.Item>
            <Menu.Item key="exportWord">
              {(!!isWord && (
              <Button
                type="primary"
                title='Tải xuống Word'
                icon={<FileWordOutlined />}
                onClick={async () => {
                            await noScrollReport();
                            await indexBase.exportHTMLToDoc(idPrint, nameFileExport!);
                            await isScrollReport();
                        }}
              >
                {(window.innerWidth >= 768) && 'Tải xuống Word'}
              </Button>
))}
            </Menu.Item>
            <Menu.Item key="exportExcel">
              {(!!isExcel || !!isExcelWithImage) && (
              <Button
                type="primary"
                title='Tải xuống Excel'
                icon={<FileExcelOutlined />}
                onClick={async () => {
                            await noScrollReport();
                            if (!!isExcelWithImage && !!exportExcelWithImage) {
                                exportExcelWithImage();
                            } else {
                                await indexBase.exportHTMLToExcel(idPrint, nameFileExport!, idFooter!);
                            }
                            await isScrollReport();
                        }}
              >
                {(window.innerWidth >= 768) && 'Tải xuống Excel'}
              </Button>
)}
            </Menu.Item>
            <Menu.Item key="cancel">
              {!!isDestroy && (
              <Button
                danger
                title='Hủy'
                icon={<CloseOutlined />}
                onClick={() => { props.onCancel!() }}
              >
                {(window.innerWidth >= 768) && 'Hủy'}
              </Button>
                      )}
            </Menu.Item>
          </Menu>
        );
  return (
    <>
            {props.isDropdown != undefined && props.isDropdown == true
                    ? (
                      <Dropdown overlay={items} trigger={[props.trigger != undefined ? props.trigger : 'click']} placement={props.placement != undefined ? props.placement : undefined}>
                        <Button type='primary'>Xuất dữ liệu</Button>
                      </Dropdown>
                  )
                    : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "end", gap: 8 }}>
                        {!!props.componentRef && props.isPrint !== false && (
                        <ReactToPrint
                          pageStyle={pageStyle}
                          onBeforeGetContent={props.noScrollReport}
                          onAfterPrint={props.isScrollReport}
                          content={() => props.componentRef}
                          trigger={() => (
                            <Button
                              type="primary"
                              title='In'
                              icon={<PrinterOutlined />}
                            >
                              {(window.innerWidth >= 768) && 'In'}
                            </Button>
                              )}
                        />
                      )}
                        {(!!isWord && (
                        <Button
                          type="primary"
                          title='Tải xuống Word'
                          icon={<FileWordOutlined />}
                          onClick={async () => {
                                    await noScrollReport();
                                    await indexBase.exportHTMLToDoc(idPrint, nameFileExport!);
                                    await isScrollReport();
                                }}
                        >
                          {(window.innerWidth >= 768) && 'Tải xuống Word'}
                        </Button>
                          )
                        )}
                        {(!!isExcel || !!isExcelWithImage) && (
                        <Button
                          type="primary"
                          title='Tải xuống Excel'
                          icon={<FileExcelOutlined />}
                          onClick={async () => {
                                    await noScrollReport();
                                    if (!!isExcelWithImage && !!exportExcelWithImage) {
                                        exportExcelWithImage();
                                    } else {
                                        await exportHTMLToExcel(idPrint, nameFileExport!, idFooter!);
                                    }
                                    await isScrollReport();
                                }}
                        >
                          {(window.innerWidth >= 768) && 'Tải xuống Excel'}
                        </Button>
                          )}
                        {!!isDestroy && (
                        <Button
                          danger
                          title='Hủy'
                          icon={<CloseOutlined />}
                          onClick={() => { props.onCancel!() }}
                        >
                          {(window.innerWidth >= 768) && 'Hủy'}
                        </Button>
                          )}
                      </div>
                  )}
          </>
  )
}

export default IActionExport

function exportHTMLToExcel(idPrint: string, arg1: string, arg2: string) {
    throw new Error('Function not implemented.');
}
