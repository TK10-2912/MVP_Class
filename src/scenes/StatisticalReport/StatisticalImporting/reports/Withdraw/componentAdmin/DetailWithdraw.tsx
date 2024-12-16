import * as React from 'react';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { Button, Card, Carousel, Col, Form, Image, Row, Space } from 'antd';
import { AttachmentItem, WithdrawDto } from '@src/services/services_autogen';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import TextArea from 'antd/lib/input/TextArea';
import { stores } from '@src/stores/storeInitializer';
import moment from 'moment';
import { valueOfeBillMethod } from '@src/lib/enumconst';
import FileAttachments from '@src/components/FileAttachments';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';

export interface Iprops {
  withdraw: WithdrawDto;
}
export default class DetailWithDraw extends AppComponentBase<Iprops> {
  carouselRef: any = React.createRef();
  state = {
    isLoadDone: true,
    isLoadFile: false,
  };
  fileAttachmentItem: AttachmentItem[] = [];
  componentDidMount = () => {
    const { withdraw } = this.props;
    this.fileAttachmentItem =
      withdraw != undefined && withdraw.fi_id_list != undefined
        ? withdraw.fi_id_list.slice(0, 5)
        : [];
    this.setState({ isLoadFile: !this.state.isLoadFile });
  };
  handlePrev = () => {
    this.carouselRef.current.prev();
  };

  handleNext = () => {
    this.carouselRef.current.next();
  };

  render() {
    const { withdraw } = this.props;
    return (
      <Card>
        <Row gutter={30} style={{ marginBottom: 10 }}>
          <Col span={8}>
            <Carousel
              autoplaySpeed={3000}
              dots={false}
              autoplay
              ref={this.carouselRef}
              // className="formatCarousel"
            >
              {this.fileAttachmentItem.length > 0 &&
                this.fileAttachmentItem.map((item, index) => (
                  <div
                    key={'image_' + index}
                    // style={{
                    //   display: 'flex',
                    //   justifyContent: 'center',
                    //   alignItems: 'center',
                    // }}
                  >
                    <Image
                    width={150}
                    sizes="200px"
                      // style={{
                      //   width: '100px', // Adjust the width to a more appropriate size
                      //   height: 'auto',
                      //   maxWidth: '100%',
                      //   margin: '0 auto',
                      //   objectFit: 'contain', // Ensures the image fits within the container
                      // }}
                      title={item.key}
                      className="no-print"
                      src={
                        item != undefined && item.id != undefined
                          ? item.key!.endsWith('.doc') || item.key!.endsWith('.docx')
                            ? '/icon_file_sample/word_icon.png'
                            : item.key!.endsWith('.xlsx') || item.key!.endsWith('.xls')
                            ? '/icon_file_sample/excel_icon.png'
                            : this.getFile(item.id)
                          : 'error'
                      }
                      alt="No image available"
                    />
                  </div>
                  // fallback="data:image/png;base64,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"
                ))}
            </Carousel>
            <Space style={{ display: 'flex', justifyContent: 'center' }}>
              <Button onClick={this.handlePrev}>&lt;</Button>
              <Button onClick={this.handleNext}>&gt;</Button>
            </Space>
          </Col>
          <Col span={8}>
            <Form.Item label={'Người vận hành'} style={{ borderBottom: '1px solid #cfd9d6' }}>
              <b style={{ display: 'block' }}>
                {stores.sessionStore.getUserNameById(withdraw.us_id_operator)}
              </b>
            </Form.Item>

            <Form.Item style={{ borderBottom: '1px solid #cfd9d6' }} label={'Tổng tiền rút'}>
              <b>{AppConsts.formatNumber(withdraw.wi_total_money_reality)}</b>
            </Form.Item>
            <Form.Item style={{ borderBottom: '1px solid #cfd9d6' }} label={'Phương thức đối soát'}>
              <b>{valueOfeBillMethod(withdraw.wi_payment_type)}</b>
            </Form.Item>
            <Form.Item label="Ghi chú" style={{ borderBottom: '1px solid #cfd9d6' }}>
              <p dangerouslySetInnerHTML={{ __html: withdraw.wi_note! }}></p>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              style={{ borderBottom: '1px solid #cfd9d6' }}
              label={'Thời gian tạo rút tiền'}
            >
              <b>{moment(withdraw.wi_created_at).format('DD/MM/YYYY HH:mm:ss')}</b>
            </Form.Item>
            <Form.Item
              label="Thời gian bắt đầu đối soát"
              style={{ borderBottom: '1px solid #cfd9d6' }}
            >
              <b>{moment(withdraw.wi_start_date).format('DD/MM/YYYY HH:mm:ss')}</b>
            </Form.Item>
            <Form.Item
              label="Thời gian kết thúc đối soát"
              style={{ borderBottom: '1px solid #cfd9d6' }}
            >
              <b>{moment(withdraw.wi_start_date).format('DD/MM/YYYY HH:mm:ss')}</b>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }
}
