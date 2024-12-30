import * as React from 'react';
//import { L, isGranted } from '@src/lib/abpUtility';
import { AppConsts } from '@src/lib/appconst';
import * as XLSX from "xlsx";
import { message } from 'antd';
import { FileDto } from '@src/services/services_autogen';
declare var abp: any;
declare var document: any;

	const L = (key: string, sourceName?: string): string => {
		return L(key, sourceName);
	}

	const isGranted = (permissionName: string): boolean =>  {
		return isGranted(permissionName);
	}
	const getFile = (fi_id: number) =>{
		let fi_id_modified = encodeURI(fi_id + "");
		return AppConsts.remoteServiceBaseUrl + "download/file?path=" + fi_id_modified;
	}
	const folderLogcat = (DevID: number) => {
		let DevID_modified = encodeURI(DevID + "");
		return AppConsts.remoteServiceBaseUrl + "folderLogcat?DevID=" + DevID_modified;
	}
	const zipImageProduct = () => {
		window.location.href = AppConsts.remoteServiceBaseUrl + "download/zipImageProduct";
	}
	const downloadFileInFolder = (pathFolder: number, pathFile: string) => {
		let pathFolder_modified = encodeURI(pathFolder + "");
		let pathFile_modified = encodeURI(pathFile + "");
		return `${AppConsts.remoteServiceBaseUrl} downloadFileInFolder?pathFolder=${pathFolder_modified}&pathFile=${pathFile_modified}`;
	}
	const getFileOfUser = (item: FileDto) => {
		let fi_id_modified = encodeURI(item.fi_id + "");
		return AppConsts.remoteServiceBaseUrl + "download/file?path=" + fi_id_modified;
	}
	const getImageProduct = (md5: string)=> {
		let fi_md5_modified = encodeURI(md5);
		return AppConsts.remoteServiceBaseUrl + "download/imageProduct?path=" + fi_md5_modified;
	}
	const getImageFileMedia = (md5: string)=> {
		let fi_md5_modified = encodeURI(md5);
		return AppConsts.remoteServiceBaseUrl + "download/fileMedia?path=" + fi_md5_modified;
	}
	const print = (id) => {
		let oldPage = document.body.innerHTML;
		let printableElements = document.getElementById(id).innerHTML;
		document.body.innerHTML = printableElements;
		window.print();
		window.close();
		document.body.innerHTML = oldPage;
	}
	const  zipImageProduct1 = async(imageNames: string[], isCanCel?: boolean) => {
		const controller = new AbortController();
		const signal = controller.signal;
		if (!isCanCel) {
			await fetch(`${AppConsts.remoteServiceBaseUrl}download/zipImageProduct1`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				signal: signal,
				body: JSON.stringify(imageNames),
			})
				.then(response => {
					if (response.ok) {
						return response.blob();
					}
					throw new Error("Failed to download zip file");
				})
				.then(blob => {
					// Create a link to download the file
					const url = window.URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = "zipimageproduct1.zip";
					document.body.appendChild(link);
					link.click();
					link.remove();
				})
				.catch(error => console.error("Error:", error));
		}
		else {
			controller.abort(); /// hủy fetch
		}
	}

	const printTag = (id: string, headerPrint?: string | undefined) => {
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

	const exportHTMLToExcel = (id: string, name: string, footerId: string) => {		
		const element = document.getElementById(id);
		const footerElement = document.getElementById(footerId);
		
		const colCount = footerElement ? footerElement.querySelectorAll("div").length : 1;		
		const workbook = XLSX.utils.book_new();
	
		if (element) {
			const wsNIA = XLSX.utils.table_to_sheet(element);
	
			if (footerElement) {
				const footerRows: string[][] = [];
				const spans = footerElement.querySelectorAll("span");
	
				let row: string[] = [];
				spans.forEach((span, index) => {
					row.push((span as HTMLElement).innerText.trim());
	
					if ((index + 1) % colCount === 0) {
						footerRows.push(row);
						row = [];
					}
				});
	
				if (row.length > 0) {
					footerRows.push(row);
				}
	
				if (footerRows.length > 0) {
					XLSX.utils.sheet_add_aoa(wsNIA, footerRows, { origin: -1 });
				}
			}
	
			XLSX.utils.book_append_sheet(workbook, wsNIA, name);
	
			// Xuất file Excel
			XLSX.writeFile(workbook, `${name}.xlsx`);
		} else {
			message.error("Không thể tải xuống");
		}
	}
	

	const exportHTMLToDoc =(id: string, name: string) => {
		let header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
			xmlns:w='urn:schemas-microsoft-com:office:word' 
			xmlns='http://www.w3.org/TR/REC-html40'>
			<head><meta charset='utf-8'></head><body>
			<style>
			*{font-size: 7.5pt;}
			@page WordSection1{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}
			div.WordSection1 {page: WordSection1;}
			table {width: 100%; font-family: 'Times New Roman', serif; font-size:  7.5pt;}
			.no-print  { display: none;}
			ul.ant-pagination {display:none; }
			table, th, td {border: solid 1px black; border-collapse: collapse;padding:2px 3px; text-align: center;}
			.noneBorder table, .noneBorder th, .noneBorder td {border: none !important;}
			</style>`;

		let contentElement = document.getElementById(id);
		let images = contentElement.getElementsByTagName("img");
		for (let img of images) {
			img.setAttribute('width', '100');
			img.setAttribute('height', '100');
		}
		let footer = "</body></html>";

		let sourceHTML = header + contentElement.innerHTML + footer;
		let source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
		let fileDownload = document.createElement("a");
		document.body.appendChild(fileDownload);
		fileDownload.href = source;
		fileDownload.download = name + '.doc';
		fileDownload.click();
		document.body.removeChild(fileDownload);
	}

	const languages = () => {
		return abp.localization.languages.filter((val: any) => {
			return !val.isDisabled;
		});
	}
	const displayNumberOnUI = (e: number | undefined): string => {
		return "" + AppConsts.formatNumber(e) + "";
	}

	const currentLanguage = () => {
		return abp.localization.currentLanguage;
	}

	const showNotification = (title: string, body: string) => {
		var iconUrl: 'https://bit.ly/2DYqRrh';

		const createNotification = () => {
			const notification = new Notification(title, {
				body,
				icon: iconUrl,
			});

			// notification.onclick = (event) => {
			// 	event.preventDefault(); 
			// 	window.open('https://example.com', '_blank');
			// };
		};
		// Yêu cầu quyền thông báo nếu chưa được cấp
		if (AppConsts.remoteServiceBaseUrl?.includes("manager") && Notification.permission === 'granted') {
			createNotification();
		} else if (Notification.permission === 'denied') {
			Notification.requestPermission().then((permission) => {
				if (permission === 'granted') {
					createNotification();
				}
			});
		}
	};
export const indexBase = {
	L,
	isGranted,
	getFile,
	folderLogcat,
	zipImageProduct,
	downloadFileInFolder,
	getFileOfUser,
	getImageProduct,
	getImageFileMedia,
	print,
	zipImageProduct1,
	printTag,
	exportHTMLToExcel,
	exportHTMLToDoc,
	languages,
	displayNumberOnUI,
	currentLanguage,
	showNotification
}


