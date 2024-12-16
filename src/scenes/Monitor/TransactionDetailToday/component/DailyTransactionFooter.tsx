import React from 'react';
import { Row, Col } from 'antd';
import { TransactionByMachineDto } from '@src/services/services_autogen';


interface TransactionFooterProps {
  listTransactionByMachine: TransactionByMachineDto[];
  currentPage: number;
  pageSize: number;
  parent?: string;
}

interface TransactionFooterState {
  // Add state if needed
}

class DailyTransactionFooter extends React.Component<TransactionFooterProps, TransactionFooterState> {
  private formatNumber(value: number): string {
    // Implement your number formatting logic here
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  private tinhTongTienTheoStatus(item: TransactionByMachineDto): number {
    // Implement your calculation logic here
    return item.so_tien_thanh_toan || 0;
  }

  private getTotalItems(items: TransactionByMachineDto[], paymentType?: number): number {
    if (paymentType === undefined) {
      return items.length;
    }
    return Math.min(
      this.props.pageSize,
      items.filter(item => item.hinh_thuc_thanh_toan === paymentType).length
    );
  }

  private getFilteredItems(paymentType?: number) {
    const { currentPage, pageSize, listTransactionByMachine } = this.props;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = currentPage * pageSize;
    
    let items = listTransactionByMachine.slice(startIndex, endIndex);
    
    if (paymentType !== undefined) {
      items = items.filter(item => item.hinh_thuc_thanh_toan === paymentType);
    }
    
    return items;
  }

  private calculateTotal(items: TransactionByMachineDto[], field: keyof TransactionByMachineDto): number {
    return items.reduce((sum, item) => sum + (item[field] as number || 0), 0);
  }

  private renderTotalSection() {
    const { listTransactionByMachine } = this.props;
    
    const totalDeposit = listTransactionByMachine.reduce((sum, item) => 
      sum + (item.so_tien_nap_vao_cash || 0)
      + (item.so_tien_nap_vao_qr || 0)
      + (item.so_tien_nap_vao_rfid || 0), 0);

    const totalBalance = this.calculateTotal(listTransactionByMachine, 'so_tien_du');

    return (
      <Col span={6} style={styles.column}>
        <span>
          Tổng số đơn hàng:{' '}
          <strong style={styles.successText}>
            {this.getTotalItems(listTransactionByMachine)}
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền đơn hàng:{' '}
          <strong style={styles.successText}>
            {this.formatNumber(this.calculateTotal(listTransactionByMachine, 'so_tien_thanh_toan'))} đ
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền nạp vào:{' '}
          <strong style={styles.successText}>
            {this.formatNumber(totalDeposit)} đ
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền thành công:{' '}
          <strong style={styles.successText}>
            {this.formatNumber(
              this.getFilteredItems()
                .filter(item => item.trang_thai_tra_hang === 2 || item.trang_thai_tra_hang === 3)
                .reduce((sum, item) => sum + this.tinhTongTienTheoStatus(item), 0)
            )} đ
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền dư:{' '}
          <strong style={{ color: totalBalance >= 0 ? '#1DA57A' : 'red' }}>
            {this.formatNumber(totalBalance)} đ
          </strong>
        </span>
      </Col>
    );
  }

  private renderPaymentSection(type: number, title: string) {
    const items = this.getFilteredItems(type);
    const totalBalance = this.calculateTotal(items, 'so_tien_du');
    const depositField = type === 0 ? 'so_tien_nap_vao_cash' : 
                        type === 1 ? 'so_tien_nap_vao_qr' : 'so_tien_nap_vao_rfid';

    return (
      <Col span={6} style={styles.column}>
        <span>
          Số đơn thanh toán bằng {title}:{' '}
          <strong style={styles.successText}>
            {this.getTotalItems(items, type)}
          </strong>
        </span>
        <br />
        <span>
          Số tiền đơn thanh toán bằng {title}:{' '}
          <strong style={styles.successText}>
            {this.formatNumber(this.calculateTotal(items, 'so_tien_thanh_toan'))} đ
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền nạp vào bằng {title}:{' '}
          <strong style={styles.successText}>
            {this.formatNumber(this.calculateTotal(items, depositField as keyof TransactionByMachineDto))} đ
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền thành công bằng {title}:{' '}
          <strong style={styles.successText}>
            {this.formatNumber(
              items
                .filter(item => item.trang_thai_tra_hang === 2 || item.trang_thai_tra_hang === 3)
                .reduce((sum, item) => sum + this.tinhTongTienTheoStatus(item), 0)
            )} đ
          </strong>
        </span>
        <br />
        <span>
          Số tiền dư {title}:{' '}
          <strong style={{ color: totalBalance >= 0 ? '#1DA57A' : 'red' }}>
            {this.formatNumber(totalBalance)} đ
          </strong>
        </span>
      </Col>
    );
  }

  render() {
    return (
      <Row style={{ marginTop: '8px', fontSize: 14 }}>
        {this.renderTotalSection()}
        {this.props.parent !== "history" && (
          <>
            {this.renderPaymentSection(0, "tiền mặt")}
            {this.renderPaymentSection(1, "ngân hàng")}
            {this.renderPaymentSection(2, "RFID")}
          </>
        )}
      </Row>
    );
  }
}

const styles = {
  column: {
    border: '1px solid #e4e1e1',
    padding: 15,
    alignContent: "center"
  },
  successText: {
    color: '#1DA57A'
  }
};

export default DailyTransactionFooter;