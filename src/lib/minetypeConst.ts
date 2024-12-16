
export default class MineTypeConst {
	static IMAGE_EXT: number = 0;
	static VIDEO_EXT: number = 1;
	static TXT_EXT: number = 2;
	static EXCEL_EXT: number = 3;
	static PP_EXT: number = 4;
	static PDF_EXT: number = 5;
	static OTHER_EXT: number = 6;
	static AUDIO_EXT: number = 7;
	static ZIP_EXT: number = 8;

	static IMAGE_EXT_LIST: string[] = [".jpg", ".jpeg", ".jpe", ".jif", ".jfif", ".jfi", ".png", ".tiff", ".tif", "bmp", ".JPG", ".PNG", ".JPEG"];
	static VIDEO_EXT_LIST: string[] = [".mp4", ".avi"];//[".mp4", ".m4a", ".m4v", ".f4v", ".f4a", ".m4b", ".m4r", ".f4b", ".mov", ".3gp", ".3gp2", ".3g2", ".3gpp", ".3gpp2", ".ogg", ".oga", ".ogv", ".ogx", ".wmv", ".wma"];
	static TXT_EXT_LIST: string[] = [".docx", ".txt", ".doc"];
	static EXCEL_EXT_LIST: string[] = [".xlsx", ".csv"];
	static PP_EXT_LIST: string[] = [".ppt", ".pot", ".pps", ".pptx", ".pptm", ".potx", ".potm", ".ppsx"];
	static PDF_EXT_LIST: string[] = [".pdf"];
	static AUDIO_EXT_LIST: string[] = [".mp3"];
	static ZIP_EXT_LIST: string[] = [".zip"];

	static checkExtentionFileType(ext: string) {
		if (this.IMAGE_EXT_LIST.includes(ext)) {
			return this.IMAGE_EXT;

		} else if (this.VIDEO_EXT_LIST.includes(ext)) {
			return this.VIDEO_EXT;

		} else if (this.TXT_EXT_LIST.includes(ext)) {
			return this.TXT_EXT;

		} else if (this.EXCEL_EXT_LIST.includes(ext)) {
			return this.EXCEL_EXT;

		} else if (this.PP_EXT_LIST.includes(ext)) {
			return this.PP_EXT;

		} else if (this.PDF_EXT_LIST.includes(ext)) {
			return this.PDF_EXT;

		} else if (this.AUDIO_EXT_LIST.includes(ext)) {
			return this.AUDIO_EXT;

		} else {
			return this.OTHER_EXT;
		}



	}
	static getThumUrl = (extension: string) => {
		if (extension !== undefined && MineTypeConst.checkExtentionFileType(extension!) !== MineTypeConst.IMAGE_EXT) {
			if (MineTypeConst.checkExtentionFileType(extension!) === MineTypeConst.PDF_EXT) {
				return process.env.PUBLIC_URL + "/icon_file_sample/pdf_icon.png"
			}
			else if (MineTypeConst.checkExtentionFileType(extension!) === MineTypeConst.TXT_EXT) {
				return process.env.PUBLIC_URL + "/icon_file_sample/word_icon.png"
			}
			else if (MineTypeConst.checkExtentionFileType(extension!) === MineTypeConst.PP_EXT) {
				return process.env.PUBLIC_URL + "/icon_file_sample/ppt_icon.png"
			}
			else if (MineTypeConst.checkExtentionFileType(extension!) === MineTypeConst.EXCEL_EXT) {
				return process.env.PUBLIC_URL + "/icon_file_sample/excel_icon.png"
			}
			else if (MineTypeConst.checkExtentionFileType(extension!) === MineTypeConst.ZIP_EXT) {
				return process.env.PUBLIC_URL + "/icon_file_sample/zip_icon.png"
			}
			else {
				return process.env.PUBLIC_URL + "/icon_file_sample/no_image.png"
			}
		}
	}
}