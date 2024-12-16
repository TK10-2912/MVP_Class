import * as React from 'react';
import { L, isGranted } from '@src/lib/abpUtility';
import { AppConsts } from '@src/lib/appconst';
import * as XLSX from "xlsx";
import FileSaver from 'file-saver';
import { message } from 'antd';
import { FileDto, ImageProductDto } from '@src/services/services_autogen';
declare var abp: any;
declare var document: any;
class AppComponentBase<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
	L(key: string, sourceName?: string): string {
		return L(key);
	}

	isGranted(permissionName: string): boolean {
		return isGranted(permissionName);
	}
	getFile(fi_id: number) {
		let fi_id_modified = encodeURI(fi_id + "");
		return AppConsts.remoteServiceBaseUrl + "download/file?path=" + fi_id_modified;
	}
	folderLogcat(DevID: number) {
		let DevID_modified = encodeURI(DevID + "");
		return AppConsts.remoteServiceBaseUrl + "folderLogcat?DevID=" + DevID_modified;
	}
	downloadFileInFolder(pathFolder: number, pathFile: string) {
		let pathFolder_modified = encodeURI(pathFolder + "");
		let pathFile_modified = encodeURI(pathFile + "");
		return `${AppConsts.remoteServiceBaseUrl} downloadFileInFolder?pathFolder=${pathFolder_modified}&pathFile=${pathFile_modified}`;
	}
	getFileOfUser(item: FileDto) {
		let fi_id_modified = encodeURI(item.fi_id + "");
		return AppConsts.remoteServiceBaseUrl + "download/file?path=" + fi_id_modified;
	}
	getImageProduct(md5:string) {
		let fi_md5_modified = encodeURI(md5);
		return AppConsts.remoteServiceBaseUrl + "download/imageProduct?path=" + fi_md5_modified;
	}
	print = (id) => {
		let oldPage = document.body.innerHTML;
		let printableElements = document.getElementById(id).innerHTML;
		document.body.innerHTML = printableElements;
		window.print();
		window.close();
		document.body.innerHTML = oldPage;
	}

	printTag(id: string, headerPrint?: string | undefined) {
		let popupWinindow;
		let innerContents = document.getElementById(id).innerHTML;
		popupWinindow = window.open('', '_blank', 'width=700,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
		popupWinindow.document.open();
		let contentHTML = `<html><head> 
		 <style>
		 .noneBorder table, .noneBorder th, .noneBorder td {border: none !important;}
		 @page {
		 size: auto;
		// contentHTML+="margin-left: 20mm;}" ;
		 @media print {
		 #labelClass {page-break-before:always; }
		 html, body {
		// contentHTML+="margin: 0px; " ;
		// contentHTML+="font-size: 17px; " ;
		// contentHTML+="width: 300mm;" ;
		// contentHTML+="height: 100mm;";
		 }
		 .no-print  { display: none;}
		 table {width: 100%;}
		 table, th, td {border: 0.01em solid black; border-collapse: collapse; text-align: center;}
		 td {padding:0px 7px}
		 }</style></head>
		 <body onload='window.print()'> ${innerContents}</html>`
		popupWinindow.document.write(contentHTML);
		popupWinindow.document.close();

	}

	exportHTMLToExcel(id: string, name: string,) {
		var element = document.getElementById(id);
		const workbook = XLSX.utils.book_new();
		if (element !== undefined) {
			var wsNIA = XLSX.utils.table_to_sheet(element);
			XLSX.utils.book_append_sheet(workbook, wsNIA, name);
		}
		else {
			message.error("Không thể tải xuống");
			return;
		}
		const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', bookSST: true, cellDates: true, });
		const data1 = new Blob([excelBuffer,], { type: fileType, });
		FileSaver.saveAs(data1, name + ".xlsx");
	}

	exportHTMLToDoc(id: string, name: string) {
		let header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
			xmlns:w='urn:schemas-microsoft-com:office:word' 
			xmlns='http://www.w3.org/TR/REC-html40'>
			<head><meta charset='utf-8'>
			<xml>
			<w:WordDocument>
				<w:View>Web</w:View>
				<w:Zoom>100</w:Zoom>
				<w:DoNotOptimizeForBrowser/>
			</w:WordDocument>
			</xml>
			</head>
			<body>
			<style>
			@page WordSection1{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}
			div.WordSection1 {page: WordSection1;}
			table {width: 100%; font-family: 'Times New Roman', serif; font-size: 17px;}
			.no-print  { display: none;}
			ul.ant-pagination {display:none; }
			table, th, td {border: solid 1px black; border-collapse: collapse;padding:2px 3px; text-align: center;}
			.noneBorder table, .noneBorder th, .noneBorder td {border: none !important;}
			</style>`;
		let footer = "</body></html>";
		let sourceHTML = header + document.getElementById(id).innerHTML + footer;
		let source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
		let fileDownload = document.createElement("a");
		document.body.appendChild(fileDownload);
		fileDownload.href = source;
		fileDownload.download = name + '.doc';
		fileDownload.click();
		document.body.removeChild(fileDownload);
	}

	get languages() {
		return abp.localization.languages.filter((val: any) => {
			return !val.isDisabled;
		});
	}
	displayNumberOnUI = (e: number | undefined): string => {
		return "" + AppConsts.formatNumber(e) + "";
	}
	// async changeLanguage(languageName: string) {
	// 	await stores.userStore!.changeLanguage(languageName);

	// 	abp.utils.setCookieValue(
	// 		'Abp.Localization.CultureName',
	// 		languageName,
	// 		new Date(new Date().getTime() + 5 * 365 * 86400000), //5 year
	// 		abp.appPath
	// 	);

	// 	window.location.reload();
	// }

	get currentLanguage() {
		return abp.localization.currentLanguage;
	}
}

export default AppComponentBase;
