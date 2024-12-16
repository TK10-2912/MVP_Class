import { L } from '@lib/abpUtility';

const rules = {
	name: [{ required: true, message: L('khong_duoc_bo_trong') }],
	surname: [{ required: true, message: L('khong_duoc_bo_trong') }],
	userName: [{ required: true, message: L('khong_duoc_bo_trong') }],
	emailAddress: [
		{ required: true, message: L('khong_duoc_bo_trong') },
		{
			pattern: /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g,
			type: 'email',
			message: L('email_khong_hop_le'),
		},
	],
	password: { required: true,  message: L('khong_duoc_bo_trong') },
	confirm: { required: true, message: L('khong_duoc_bo_trong') },
	role: [{ required: true, message: L('khong_duoc_bo_trong') }]
};

export default rules;
