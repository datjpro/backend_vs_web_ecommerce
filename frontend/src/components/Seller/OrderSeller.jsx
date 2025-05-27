import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import "./orderSeller.css";

export const OrderSeller = () => {
  const { token, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy sellerId từ localStorage (hoặc context nếu có)
  const sellerId = localStorage.getItem("sellerId");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Gọi API lấy tất cả đơn hàng của seller
        const res = await axios.get(
          `http://localhost:4000/api/order/seller/${sellerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(res.data.orders || []);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (sellerId) fetchOrders();
    else setLoading(false);
  }, [sellerId, token]);

  if (loading) return <p>Đang tải đơn hàng...</p>;
  if (!sellerId) return <p>Bạn chưa tạo shop hoặc chưa đăng nhập!</p>;

  return (
    <div className="order-seller">
      <h2>Đơn hàng của shop</h2>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.customerId?.fullName || "Ẩn"}</td>
                <td>{order.totalOrder?.toLocaleString()} VND</td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
