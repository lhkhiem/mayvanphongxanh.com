import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export default function OrdersPage() {
  const dummyOrders = [
    { id: '#MVPX-10293', date: '20/06/2024', status: 'Đã giao hàng', total: 14500000, items: 1 },
    { id: '#MVPX-10245', date: '05/05/2024', status: 'Đã hủy', total: 850000, items: 2 },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Lịch sử đơn hàng</h1>
        
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mã đơn hàng</th>
                  <th className="px-6 py-4 font-semibold">Ngày đặt</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dummyOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Đã giao hàng' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline font-medium">Xem chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
