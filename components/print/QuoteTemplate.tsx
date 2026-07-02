import React from 'react';

interface QuoteTemplateProps {
  product: any;
  quantity: number;
}

export function QuoteTemplate({ product, quantity }: QuoteTemplateProps) {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const total = product.price * quantity;

  return (
    <div className="hidden print:block bg-white text-black text-[13px] leading-relaxed p-8 mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-primary pb-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="text-5xl font-black text-primary tracking-tighter italic">MPX</div>
          <div>
            <h1 className="font-bold text-lg uppercase text-primary mb-2">CÔNG TY TNHH MÁY VĂN PHÒNG XANH</h1>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-white text-[10px]">A</span>
              <p className="text-xs">118 Cộng Hòa, Phường 4, Quận Tân Bình, Thành phố Hồ Chí Minh</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-white text-[10px]">C</span>
              <p className="text-xs">C2 - 1216 Vinhome D.capitale - 224 Trần Duy Hưng, Quận Cầu Giấy, Hà Nội</p>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold uppercase mb-1">BÁO GIÁ SẢN PHẨM</h2>
        <p className="text-xs italic">Ngày phát hành báo giá: {currentDate}</p>
      </div>

      <p className="mb-4">Chúng tôi xin trân trọng gửi đến Quý khách hàng bảng báo giá thiết bị theo yêu cầu sau:</p>

      {/* Table */}
      <table className="w-full border-collapse border border-black mb-8">
        <thead>
          <tr className="bg-gray-100 font-bold text-center">
            <th className="border border-black p-2 w-12">STT</th>
            <th className="border border-black p-2 w-32">Hình ảnh</th>
            <th className="border border-black p-2">Tên Sản Phẩm</th>
            <th className="border border-black p-2 w-20">Số lượng</th>
            <th className="border border-black p-2 w-28">Đơn giá (VND)</th>
            <th className="border border-black p-2 w-28">Tổng (VND)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center align-middle">1</td>
            <td className="border border-black p-2 text-center align-middle">
              {/* Note: In a real print scenario, Next/Image might need unoptimized or we use standard <img> for printing reliability */}
              <img src={product.image} alt={product.name} className="w-full max-w-[100px] mx-auto object-contain" />
            </td>
            <td className="border border-black p-4 align-top">
              <div className="font-bold mb-2">{product.name}</div>
              <div className="space-y-1 text-xs">
                <p><strong>Loại máy:</strong> Theo tiêu chuẩn NSX</p>
                <p><strong>Bảo hành:</strong> 12 tháng chính hãng</p>
                <p><strong>Giao hàng:</strong> Miễn phí phạm vi TPHCM và Hà Nội</p>
                {product.description && (
                  <p><strong>Mô tả:</strong> {product.description}</p>
                )}
                <p className="italic mt-2">* Lưu ý: Giá trên chưa bao gồm chi phí cài đặt phần mềm đặc thù (nếu có)</p>
              </div>
            </td>
            <td className="border border-black p-2 text-center align-middle font-bold">{quantity}</td>
            <td className="border border-black p-2 text-right align-middle">{formatPrice(product.price)}</td>
            <td className="border border-black p-2 text-right align-middle font-bold">{formatPrice(total)}</td>
          </tr>
          <tr>
            <td colSpan={5} className="border border-black p-2 text-right font-bold bg-gray-100">Tổng cộng (VND)</td>
            <td className="border border-black p-2 text-right font-bold bg-gray-100">{formatPrice(total)}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer Details */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 uppercase">ĐIỀU KHOẢN THƯƠNG MẠI</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>Đơn giá trên đã bao gồm VAT.</li>
          <li>Hình thức thanh toán: Tiền mặt hoặc chuyển khoản sau khi xác nhận đơn hàng.</li>
          <li>Thời gian bảo hành: Theo quy định của nhà sản xuất.</li>
          <li>Quy cách: Hàng mới 100%, nguyên đai, nguyên kiện, Chính hãng.</li>
          <li>Báo giá trên có giá trị 10 ngày, kể từ ngày phát hành báo giá.</li>
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="font-bold mb-2 uppercase">THÔNG TIN TÀI KHOẢN NGÂN HÀNG</h3>
        <p className="font-bold text-xs mb-1">CÔNG TY TNHH MÁY VĂN PHÒNG XANH</p>
        <p className="text-xs mb-1">Số tài khoản: <strong>113 665 389</strong></p>
        <p className="text-xs mb-4">Ngân hàng TMCP Á Châu (ACB) Chi nhánh: Hồ Chí Minh</p>
        <p className="text-xs italic">*LƯU Ý: Công ty MPX không chịu bất cứ chi phí phát sinh nào trong quá trình chuyển khoản.</p>
      </div>

      <div className="flex justify-between items-start mt-12">
        <div>
          <h3 className="font-bold uppercase mb-1">HỖ TRỢ MUA HÀNG NHANH</h3>
          <p className="text-xs">Hotline: <strong className="text-red-600">0987 152 368</strong></p>
        </div>
        <div className="text-center mr-12">
          <h3 className="font-bold uppercase">Xác nhận đơn hàng</h3>
          <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
}
