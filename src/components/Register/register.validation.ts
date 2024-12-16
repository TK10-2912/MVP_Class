import { L } from "@src/lib/abpUtility";

const rules = {
	emailAddress: [
		{ required: true, message: L('ThisFieldIsRequired') },
		{ pattern: /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g, message: 'Địa chỉ thư điện tử không đúng!' }
	],
	password: { required: true, message: L('ThisFieldIsRequired') },
	confirm: { required: true, message: L('ThisFieldIsRequired') },
	code: [{ required: true, message: L('ThisFieldIsRequired') }],
	name: [{ required: true, message: L('ThisFieldIsRequired') }],
	user_name: [{ required: true, message: L('ThisFieldIsRequired') }],
	cccd: [
		{ required: true, message: L('ThisFieldIsRequired') },
		{
			pattern: /^[0-9]{12}$/,
			message: 'Số căn cước công dân không hợp lệ!',
		},
	],
	birth: [{ required: true, message: L('ThisFieldIsRequired') }],
	sex: [{ required: true, message: L('ThisFieldIsRequired') }],
	address: [{ required: true, message: L('ThisFieldIsRequired') }],
	phone: [
		{ required: true, message: L('ThisFieldIsRequired') },
		{
			pattern: /^[\+]?[(]?[0-9]{1,3}[)]?[\ ]?[-\s\.]?[0-9]{9}$/,
			message: 'Số điện thoại không hợp lệ!',
		}
	],

};

export default rules;
