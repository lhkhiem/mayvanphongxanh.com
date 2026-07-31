import React from 'react';

interface QuoteTemplateProps {
  product: any;
  quantity: number;
  settings?: Record<string, string>;
}

export function QuoteTemplate({ product, quantity, settings = {} }: QuoteTemplateProps) {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const price = product?.price || 0;
  const total = price * quantity;

  // Company Settings
  const logo = settings['company_logo'] || settings['site_logo'] || '';
  const companyName = settings['company_name'] || 'CÔNG TY TNHH MÁY VĂN PHÒNG XANH';
  const addressMain = settings['contact_address'] || '118 Cộng Hòa, Phường 4, Quận Tân Bình, Thành phố Hồ Chí Minh';
  const addressBranch = settings['quote_address_c'] || settings['company_branch_address'] || '';
  const hotline = settings['contact_phone'] || settings['cskh_phone'] || '0987 152 368';

  // Bank Info Settings
  const bankAccount = settings['bank_account'] || '113 665 389';
  const bankOwner = settings['bank_owner'] || companyName;
  const bankName = settings['bank_name'] || 'Ngân hàng TMCP Á Châu (ACB) Chi nhánh: Hồ Chí Minh';
  const bankNote = settings['quote_bank_note'] || '*LƯU Ý: Công ty MPX không chịu bất cứ chi phí phát sinh nào trong quá trình chuyển khoản.';

  // Commercial Terms Settings
  const vatStatus = product?.vatStatus || 'INCLUDED';
  let vatTerm = '• Đơn giá trên đã bao gồm VAT.';
  if (vatStatus === 'EXCLUDED') {
    vatTerm = '• Đơn giá trên chưa bao gồm VAT (10%).';
  } else if (vatStatus === 'NONE') {
    vatTerm = '• Đơn giá trên không thuộc đối tượng chịu thuế VAT.';
  }

  const defaultTerms = `${vatTerm}
• Hình thức thanh toán: Tiền mặt hoặc chuyển khoản sau khi xác nhận đơn hàng.
• Thời gian bảo hành: Theo quy định của nhà sản xuất.
• Quy cách: Hàng mới 100%, nguyên đai, nguyên kiện, Chính hãng.
• Báo giá trên có giá trị 10 ngày, kể từ ngày phát hành báo giá.`;

  const rawTerms = settings['quote_terms'] || defaultTerms;

  const termsList = rawTerms.split('\n').map(t => t.trim()).filter(Boolean);

  // Product Thumbnail & Specs Extraction from DB
  const productImage = product?.image || product?.images?.[0] || '/placeholder.jpg';
  const quickSpecs = Array.isArray(product?.quickSpecs) ? product.quickSpecs.filter(Boolean) : [];
  const specifications = Array.isArray(product?.specifications) ? product.specifications.filter(Boolean) : [];
  const brandName = typeof product?.brand === 'string' ? product.brand : (product?.brand?.name || '');
  const categoryName = typeof product?.category === 'string' ? product.category : (product?.category?.name || '');
  const sku = product?.sku || '';
  const rawDescription = product?.description ? product.description.replace(/<[^>]*>/g, '').trim() : '';

  const hasQuickSpecs = quickSpecs.length > 0;
  const hasSpecs = specifications.length > 0;

  return (
    <div className="hidden print:block bg-white text-black text-[13px] leading-relaxed p-8 mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-primary pb-4 mb-6">
        <div className="flex items-center gap-4">
          {logo ? (
            <img src={logo} alt={companyName} className="h-16 w-auto object-contain" />
          ) : (
            <div className="text-5xl font-black text-primary tracking-tighter italic">MPX</div>
          )}
          <div>
            <h1 className="font-bold text-base sm:text-lg uppercase text-primary mb-1">{companyName}</h1>
            {addressMain && (
              <div className="flex items-start gap-2 mb-0.5">
                {addressBranch && <span className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">A</span>}
                <p className="text-xs text-gray-800">{addressMain}</p>
              </div>
            )}
            {addressBranch && (
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">C</span>
                <p className="text-xs text-gray-800">{addressBranch}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase mb-1 tracking-wide">BÁO GIÁ SẢN PHẨM</h2>
        <p className="text-xs italic text-gray-600">Ngày phát hành báo giá: {currentDate}</p>
      </div>

      <p className="mb-4 text-xs">Chúng tôi xin trân trọng gửi đến Quý khách hàng bảng báo giá thiết bị theo yêu cầu sau:</p>

      {/* Table */}
      <table className="w-full border-collapse border border-black mb-6 text-xs">
        <thead>
          <tr className="bg-gray-100 font-bold text-center">
            <th className="border border-black p-2 w-10">STT</th>
            <th className="border border-black p-2 w-28">Hình ảnh</th>
            <th className="border border-black p-2">Tên Sản Phẩm</th>
            <th className="border border-black p-2 w-16">Số lượng</th>
            <th className="border border-black p-2 w-28">Đơn giá (VND)</th>
            <th className="border border-black p-2 w-28">Tổng (VND)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center align-middle font-bold">1</td>
            <td className="border border-black p-2 text-center align-middle">
              <img src={productImage} alt={product?.name || ''} className="w-full max-w-[100px] max-h-[100px] mx-auto object-contain" />
            </td>
            <td className="border border-black p-3 align-top">
              <div className={`font-bold text-sm text-black ${hasQuickSpecs ? 'mb-2' : ''}`}>{product?.name}</div>
              
              {hasQuickSpecs && (
                <div className="space-y-1 text-xs text-gray-800">
                  {quickSpecs.map((spec: any, idx: number) => {
                    const text = typeof spec === 'string' ? spec : (spec?.value ? `${spec?.label ? spec.label + ': ' : ''}${spec.value}` : (spec?.label || ''));
                    if (!text) return null;
                    const colonIdx = text.indexOf(':');
                    if (colonIdx > 0 && colonIdx < text.length - 1) {
                      const label = text.substring(0, colonIdx).trim();
                      const val = text.substring(colonIdx + 1).trim();
                      return (
                        <p key={`qs-${idx}`}><strong>{label}:</strong> {val}</p>
                      );
                    }
                    return <p key={`qs-${idx}`}>• {text}</p>;
                  })}
                </div>
              )}
            </td>
            <td className="border border-black p-2 text-center align-middle font-bold">{quantity}</td>
            <td className="border border-black p-2 text-right align-middle font-medium">{formatPrice(price)}</td>
            <td className="border border-black p-2 text-right align-middle font-bold">{formatPrice(total)}</td>
          </tr>
          <tr>
            <td colSpan={5} className="border border-black p-2 text-right font-bold bg-gray-100 uppercase">Tổng cộng (VND)</td>
            <td className="border border-black p-2 text-right font-bold bg-gray-100">{formatPrice(total)}</td>
          </tr>
        </tbody>
      </table>

      {/* Commercial Terms Section */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 uppercase text-xs">ĐIỀU KHOẢN THƯƠNG MẠI</h3>
        <ul className="space-y-1 text-xs text-gray-800">
          {termsList.map((term, idx) => {
            const cleanText = term.replace(/^[•\-\*]\s*/, '');
            return (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="shrink-0">•</span>
                <span>{cleanText}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bank Account Info Section */}
      <div className="mb-6">
        <h3 className="font-bold mb-1.5 uppercase text-xs">THÔNG TIN TÀI KHOẢN NGÂN HÀNG</h3>
        <p className="font-bold text-xs mb-1 uppercase">{bankOwner}</p>
        <p className="text-xs mb-1">Số tài khoản: <strong>{bankAccount}</strong></p>
        <p className="text-xs mb-2">{bankName}</p>
        <p className="text-[11px] italic text-gray-600">{bankNote}</p>
      </div>

      {/* Footer Support & Confirmation */}
      <div className="flex justify-between items-start mt-8 pt-4 border-t border-gray-200">
        <div>
          <h3 className="font-bold uppercase mb-1 text-xs">HỖ TRỢ MUA HÀNG NHANH</h3>
          <p className="text-xs">Hotline: <strong className="text-red-600 font-bold">{hotline}</strong></p>
        </div>
        <div className="text-center mr-8">
          <h3 className="font-bold uppercase text-xs">XÁC NHẬN ĐƠN HÀNG</h3>
          <p className="italic text-xs text-gray-600">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
}
