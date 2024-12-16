import viVN from 'antd/lib/locale/vi_VN';

const vi_VN = {
    ...viVN,
    Table: {
        ...viVN.Table,
        triggerAsc: 'Sắp xếp tăng dần',
        triggerDesc: 'Sắp xếp giảm dần',
        cancelSort: 'Hủy sắp xếp',
        emptyText: 'Không có dữ liệu',
    },
    Upload: {
        removeFile: 'Xóa tệp',
        previewFile: 'Xem trước',
        downloadFile: 'Tải xuống',
    },
    List: {
        emptyText: 'Không có thông báo',
    },
    Pagination: {
        items_per_page: '/ trang',
        jump_to: 'Đến',
        page: 'Trang',
    }
    ///etc...
};

export default vi_VN;