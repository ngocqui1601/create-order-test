import React from 'react';
import { Modal, Table, Descriptions, Card, Button, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const ConfirmOrder = ({ visibleModal, onCancel, onConfirm, customerInfo, cartItems, paymentInfo }) => {


    const totalBeforeDiscount = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const totalDiscount = cartItems.reduce((sum, item) => {
        if (item.discountCode) {
            const { type, value } = item.discountCode;
            let discount = 0;
            if (type === 'percent') {
                discount = (item.unitPrice * item.quantity * value) / 100;
            } else {
                discount = value;
            }
            return sum + discount;
        }
        return sum;
    }, 0);

    const totalAfterDiscount = totalBeforeDiscount - totalDiscount;

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            align: 'right',
            titleStyle: { textAlign: 'center' },
            render: val => val ? `${val.toLocaleString('en-US')} VND` : '0'
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            titleStyle: { textAlign: 'center' },
        },
        {
            title: 'Số tiền giảm',
            key: 'discount',
            align: 'right',
            titleStyle: { textAlign: 'center' },
            render: (_, record) => {
                let discount = 0;
                if (record.discountCode) {
                    const { type, value } = record.discountCode;
                    if (type === 'percent') {
                        discount = (record.unitPrice * record.quantity * value) / 100;
                    } else {
                        discount = value;
                    }
                }
                return discount ? `${discount.toLocaleString()} VND` : '0';
            }
        },
        {
            title: 'Thành tiền',
            key: 'total',
            align: 'right',
            titleStyle: { textAlign: 'center' },
            render: (_, record) => {
                let total = record.unitPrice * record.quantity;
                if (record.discountCode) {
                    const { type, value } = record.discountCode;
                    if (type === 'percent') total -= (total * value) / 100;
                    else total -= value;
                }
                return total ? `${total.toLocaleString('en-US')} VND` : '0';
            }
        },
    ];

    return (
        <Modal
            title={<div style={{ color: '#1890ff', fontWeight: 'bold' }}>Xác Nhận Đơn Hàng</div>}
            visible={visibleModal}
            onCancel={onCancel}
            onOk={onConfirm}
            width={800}
            centered
            footer={[
                <Button key="back" onClick={onCancel} style={{ marginRight: 8 }}>
                    <CloseCircleOutlined /> Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={onConfirm}>
                    <CheckCircleOutlined /> Xác Nhận
                </Button>
            ]}
        >
            <Card
                title="Thông Tin Khách Hàng"
                style={{ marginBottom: '20px' }}
            >
                <Descriptions column={2} size="small" style={{ marginBottom: 0 }}>
                    <Descriptions.Item label="Khách hàng">{customerInfo?.customerName || ''}</Descriptions.Item>
                    <Descriptions.Item label="Email">{customerInfo?.email || ''}</Descriptions.Item>
                    <Descriptions.Item label="SĐT">{customerInfo?.phone || ''}</Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                        {paymentInfo?.method === 'tienmat' ? 'Tiền mặt' : 'Thẻ' || ''}
                    </Descriptions.Item>
                    {paymentInfo?.method === 'tienmat' && (
                        <>
                            <Descriptions.Item label="Khách đưa">{paymentInfo?.customerMoney ? paymentInfo.customerMoney.toLocaleString('en-US') : '0'} VND</Descriptions.Item>
                            <Descriptions.Item label="Tiền thừa">{paymentInfo?.change ? paymentInfo.change.toLocaleString('en-US') : '0'} VND</Descriptions.Item>
                        </>
                    )}
                </Descriptions>
            </Card>

            <Card
                title="Chi Tiết Giỏ Hàng"
                style={{ marginBottom: '20px' }}
            >
                <Table
                    dataSource={cartItems}
                    columns={columns}
                    pagination={false}
                    rowKey="productId"
                    bordered
                    size="middle"
                />
            </Card>

            <Card
                title="Thông Tin Thanh Toán"
                style={{ marginBottom: '20px' }}
            >
                <Row justify="space-between">
                    <Col span={10}>
                        <div>Tổng tiền (trước giảm):</div>
                        <div>Số tiền giảm:</div>
                        <div>Tổng tiền (sau giảm):</div>
                        <div><strong>Tổng thanh toán:</strong></div>
                    </Col>
                    <Col span={10} style={{ textAlign: 'right' }}>
                        <div>{totalBeforeDiscount ? totalBeforeDiscount.toLocaleString('en-US') : '0'} VND</div>
                        <div>{totalDiscount ? totalDiscount.toLocaleString('en-US') : '0'} VND</div>
                        <div>{totalAfterDiscount ? totalAfterDiscount.toLocaleString('en-US') : '0'} VND</div>
                        <div><strong>{totalAfterDiscount.toLocaleString('en-US')} VND</strong></div>
                    </Col>
                </Row>
            </Card>
        </Modal>
    );
};

export default ConfirmOrder;
