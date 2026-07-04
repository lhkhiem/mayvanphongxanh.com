import Link from 'next/link';
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-background p-8 rounded-xl border border-border shadow-sm">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
              Quên mật khẩu
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
            </p>
          </div>
          <form className="mt-8 space-y-6" action="#" method="POST">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">Email</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Địa chỉ email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Gửi liên kết đặt lại
              </button>
            </div>
            
            <div className="text-sm text-center mt-4">
              <Link href="/dang-nhap" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
