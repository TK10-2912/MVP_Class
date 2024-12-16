import AppConsts from './appconst';

declare var abp: any;

export function L(key: string, sourceName?: string): string {
	let localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;
	return abp.localization.localize(key, sourceName ? sourceName : localizationSourceName);
}

export function isGranted(permissionName: string|string[]): boolean {
	if(Array.isArray(permissionName) == true){
		for(let item of permissionName){
			if(abp.auth.isGranted(item)==true){
				return true;
			}
		}
		return false;
	}else{
		return abp.auth.isGranted(permissionName);
	}
  	
}
export function displayDate(d: Date){
	return d.toLocaleString();
}