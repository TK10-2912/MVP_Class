import { L } from '@lib/abpUtility';

const rules = {
	name: [{ required: true, message: L('khong_duoc_bo_trong') }],
	displayName: [{ required: true, message: L('khong_duoc_bo_trong') }]
};

export default rules;
