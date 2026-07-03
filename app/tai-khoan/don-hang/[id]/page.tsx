import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Package, Truck, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  // Mock data for order details
  const order = {
    id: params.id,
    date: '15/06/2026',
    status: 'Đang giao hàng',
    total: '8.500.000 ₫',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    shippingAddress: {
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh'
    },
    items: [
      {
        id: 1,
        name: 'Máy in Laser Đen Trắng Canon LBP 2900',
        price: '3.500.000 ₫',
        quantity: 1,
        total: '3.500.000 ₫',
        image: 'https://cdn.tgdd.vn/Products/Images/8790/228185/may-in-laser-trang-den-canon-lbp2900-3-org.jpg'
      },
      {
        id: 2,
        name: 'Mực in Canon 303',
        price: '500.000 ₫',
        quantity: 2,
        total: '1.000.000 ₫',
        image: 'https://cdn.tgdd.vn/Products/Images/8791/240093/muc-in-laser-trang-den-canon-ep303-den-1-org.jpg'
      }
    ],
    timeline: [
      { status: 'Đã đặt hàng', date: '15/06/2026 10:00', icon: Package, completed: true },
      { status: 'Đã xác nhận', date: '15/06/2026 14:30', icon: CheckCircle2, completed: true },
      { status: 'Đang giao hàng', date: '16/06/2026 08:15', icon: Truck, completed: true },
      { status: 'Giao hàng thành công', date: '', icon: CheckCircle2, completed: false },
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/tai-khoan/don-hang" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Chi tiết đơn hàng #{order.id}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            In hóa đơn
          </Button>
          <Button size="sm">Mua lại</Button>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span className="font-medium">{order.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className="font-medium text-amber-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức thanh toán:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Địa chỉ giao hàng</h3>
            <div className="space-y-1 text-sm bg-muted/50 p-4 rounded-md">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p className="text-muted-foreground mt-1">{order.shippingAddress.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tình trạng giao hàng */}
      <div className="bg-background rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-6">Tình trạng giao hàng</h3>
        <div className="relative">
          <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-muted"></div>
          <div className="space-y-6">
            {order.timeline.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4 relative">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border-2 border-background'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="pt-2">
                    <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.status}
                    </p>
                    {step.date && <p className="text-sm text-muted-foreground">{step.date}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold">Sản phẩm ({order.items.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
              <div className="w-20 h-20 shrink-0 bg-white rounded-md border border-border p-2">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium line-clamp-2">{item.name}</h4>
                <div className="mt-1 text-sm text-muted-foreground">
                  Số lượng: {item.quantity} x {item.price}
                </div>
              </div>
              <div className="font-semibold whitespace-nowrap text-right">
                {item.total}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
          <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span>4.500.000 ₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển:</span>
              <span>0 ₫</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <span className="font-semibold">Tổng cộng:</span>
              <span className="font-bold text-primary text-lg">{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
