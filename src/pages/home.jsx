
import { Button } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
export default function Home() {
    const navigate = useNavigate();
    return (
        <div
            className="App"
            style={{
                display: "flex",
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
            }}>
            <Button type="primary" shape="round" icon={<FormOutlined />} size={"large"} onClick={() => navigate("/create-order")}>
                Tạo đơn hàng
            </Button>
        </div>);
}