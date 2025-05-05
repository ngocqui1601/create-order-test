import React from 'react';
import { Button, Col, Form, Input, InputNumber, message, Popconfirm, Radio, Row, Select, Table } from 'antd';
import ConfirmOrder from './confirmOrder';
import { motion } from 'framer-motion';
import Title from 'antd/es/typography/Title';
const { Option } = Select;

const CreateOrder = () => {
    //#region dulieugia
    const products = [
        { id: 1, name: 'Sản phẩm A', price: 100000 },
        { id: 2, name: 'Sản phẩm B', price: 200000 },
        { id: 3, name: 'Sản phẩm C', price: 300000 },
    ];
    const discounts = [
        { code: 'GIA10', type: 'percent', value: 10 },
        { code: 'GIA5k', type: 'amount', value: 50000 },
    ];
    //#endregion

    //#region khai bao
    const [form] = Form.useForm();
    const [cartItems, setCartItems] = React.useState([]);
    const [paymentMethod, setPaymentMethod] = React.useState('tienmat');
    const [customerMoney, setCustomerMoney] = React.useState(0);
    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 100,
            render: (_, record) => {
                return `${record.unitPrice.toLocaleString('en-US')} VNĐ`;
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (text, record, index) => (
                <InputNumber
                    min={1}
                    value={record.quantity}
                    onChange={(e) => updateCartItem(index, 'quantity', e)}
                />
            ),
        },
        {
            title: 'Mã KM',
            dataIndex: 'discountCode',
            key: 'discountCode',
            width: 200,
            render: (text, record, index) => (
                <Select
                    style={{ width: 180 }}
                    placeholder="Chọn KM"
                    value={record.discountCode?.code}
                    onChange={(value) => {
                        const discount = discounts.find(d => d.code === value);
                        updateCartItem(index, 'discountCode', discount || null);
                    }}
                    allowClear
                >
                    {discounts.map((d) => (
                        <Option key={d.code} value={d.code}>
                            {d.code} ({d.type === 'percent' ? `${d.value}%` : `-${d.value.toLocaleString('en-US')} VNĐ`})
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            width: 100,
            render: (_, record) => {
                let total = record.unitPrice * record.quantity;
                if (record.discountCode) {
                    const { type, value } = record.discountCode;
                    if (type === 'percent') total -= (total * value) / 100;
                    else total -= value;
                }
                return `${total.toLocaleString('en-US')} VNĐ`;
            },
        },
        {
            title: 'Xóa',
            key: 'action',
            width: 50,
            render: (_, record, index) => (
                <Popconfirm title={`Xóa sản phẩm ${record.name}?`} onConfirm={() => removeItem(index)}>
                    <Button danger size="small">Xóa</Button>
                </Popconfirm>
            ),
        },
    ];
    const [showConfirm, setShowConfirm] = React.useState(false);
    //#endregion

    //#region methods
    //them sp vao gio hang
    const addItem = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const exists = cartItems.find(item => item.productId === product.id);
        if (exists) {
            setCartItems(prev =>
                prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        }
        else {
            setCartItems([
                ...cartItems,
                {
                    productId: product.id,
                    name: product.name,
                    unitPrice: product.price,
                    quantity: 1,
                    discountCode: null,
                },
            ]);
        }
        form.resetFields(['selectedProduct']);
    };

    //xoa sp khoi gio hang
    const removeItem = (index) => {
        const newCart = [...cartItems];
        newCart.splice(index, 1);
        setCartItems(newCart);
    };

    //tinh tong tien don hang (gom khuyen mai)
    const totalOrder = () => {
        return cartItems.reduce((total, item) => {
            let price = item.unitPrice * item.quantity;

            if (item.discountCode) {
                if (item.discountCode.type === 'percent') {
                    price -= (price * item.discountCode.value) / 100;
                } else if (item.discountCode.type === 'amount') {
                    price -= item.discountCode.value;
                }
            }

            return total + price;
        }, 0);
    };

    //tinh tien thua tra KH (da format)
    const calculateChange = () => {
        const change = customerMoney > totalOrder() ? customerMoney - totalOrder() : 0;
        return change.toLocaleString('en-US');
    };

    //tinh tien lai sp trong gio hang
    const updateCartItem = (index, field, value) => {
        const newCart = [...cartItems];
        newCart[index][field] = value;
        setCartItems(newCart);
    };

    //thanh toan
    const onSubmit = async () => {
        try {
            await form.validateFields();

            if (cartItems.length === 0) {
                message.error('Giỏ hàng đang trống!', 3);
                return;
            }

            if (paymentMethod === 'tienmat' && customerMoney < totalOrder()) {
                message.error('Số tiền khách đưa không đủ để thanh toán!', 3);
                return;
            }

            setShowConfirm(true);
        } catch (error) {
            message.error('Vui lòng điền đầy đủ thông tin khách hàng!', 3);
        }
    };

    const handleConfirm = () => {
        message.success('Thanh toán thành công!', 3);
        setShowConfirm(false);
    };
    //#endregion

    return (
        <Row
            justify="center"
            align="middle"
            style={{
                minHeight: '100vh',
                padding: '0 16px',
            }}
        >
            <Col>
                <div style={{ padding: '20px' }}>
                    <Title level={2}>Tạo Đơn Hàng</Title>
                    <Form
                        form={form}
                        layout="vertical"
                        style={{ width: '80vw' }}>
                        <Form.Item
                            label="Tên khách hàng"
                            name="customerName"
                            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Email khách hàng"
                            name="email"
                            rules={[
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại khách hàng!' },
                                {
                                    pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/,
                                    message: 'Số điện thoại không hợp lệ!'
                                }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Thêm sản phẩm vào giỏ hàng"
                            name="selectedProduct" >
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Chọn sản phẩm"
                                onChange={addItem}
                            >
                                {products.map(product => (
                                    <Option key={product.id} value={product.id}>{product.name} - {product.price.toLocaleString('en-US')} VND</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Title level={4}>Giỏ hàng</Title>
                        <Table
                            rowKey="productId"
                            columns={columns}
                            dataSource={cartItems}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            components={{
                                body: {
                                    row: ({ children, ...restProps }) => (
                                        <motion.tr
                                            {...restProps}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {children}
                                        </motion.tr>
                                    ),
                                },
                            }}
                        />

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            padding: '4px',
                            marginBottom: '20px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e8e8e8'
                        }}>
                            <div style={{
                                textAlign: 'right',
                                width: '100%',
                            }}>
                                <Title level={5}>Tổng giá trị</Title>
                                <Title level={4} style={{ fontSize: "16", fontWeight: "bold", color: "#fa8c16" }}>{totalOrder().toLocaleString('en-US')} VND</Title>
                            </div>
                        </div>

                        <Form.Item label="Phương thức thanh toán">
                            <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <Radio value="tienmat">Tiền mặt</Radio>
                                <Radio value="the">Thẻ</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {paymentMethod === 'tienmat' && (
                            <Form.Item label="Số tiền khách đưa" name="customerMoney">
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    value={customerMoney}
                                    onChange={setCustomerMoney} />
                            </Form.Item>
                        )}

                        {paymentMethod === 'tienmat' && customerMoney > totalOrder() && (
                            <p style={{ color: 'green' }}>Tiền thừa trả khách: {calculateChange()} VND</p>
                        )}

                        <Button type="primary" style={{ width: '200px' }} onClick={onSubmit}>
                            Thanh toán
                        </Button>
                    </Form>
                    <ConfirmOrder
                        visibleModal={showConfirm}
                        onCancel={() => setShowConfirm(false)}
                        onConfirm={handleConfirm}
                        customerInfo={form.getFieldsValue()}
                        cartItems={cartItems}
                        paymentInfo={{
                            method: paymentMethod,
                            customerMoney,
                            total: totalOrder(),
                            change: customerMoney - totalOrder()
                        }}
                    />
                </div>
            </Col>
        </Row>
    );
};

export default CreateOrder;