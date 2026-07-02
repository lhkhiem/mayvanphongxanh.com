import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-8">Chính sách bảo mật</h1>
        
        <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
          <p>
            Chào mừng bạn đến với Giải pháp Máy Văn Phòng Xanh. Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn khi bạn sử dụng trang web của chúng tôi.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Thông tin chúng tôi thu thập</h2>
          <p>
            Khi bạn đăng ký tài khoản, đặt hàng hoặc liên hệ với chúng tôi, chúng tôi có thể thu thập các thông tin như: Họ tên, địa chỉ email, số điện thoại, và địa chỉ giao hàng.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Cách chúng tôi sử dụng thông tin</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Xử lý và giao đơn hàng của bạn một cách nhanh chóng.</li>
            <li>Gửi các thông báo về trạng thái đơn hàng và hỗ trợ khách hàng.</li>
            <li>Cải thiện chất lượng dịch vụ và trải nghiệm mua sắm trên website.</li>
            <li>Gửi email giới thiệu sản phẩm mới hoặc khuyến mãi (nếu bạn đồng ý nhận).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Bảo vệ thông tin của bạn</h2>
          <p>
            Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ dữ liệu cá nhân của bạn khỏi việc truy cập trái phép, sửa đổi, tiết lộ hoặc phá hủy. Thông tin thanh toán được mã hóa qua các cổng thanh toán an toàn.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Quyền của bạn</h2>
          <p>
            Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua phần quản lý tài khoản hoặc bằng cách liên hệ với đội ngũ hỗ trợ của chúng tôi.
          </p>
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm">
              Cập nhật lần cuối: 15/06/2024
            </p>
            <p className="text-sm mt-2">
              Nếu bạn có bất kỳ thắc mắc nào về Chính sách bảo mật này, vui lòng liên hệ: <a href="mailto:support@mayvanphongxanh.com" className="text-primary hover:underline">support@mayvanphongxanh.com</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
