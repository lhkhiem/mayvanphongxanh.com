1. Kích thước chuẩn (Canvas Size)
Kích thước: 1920 x 600 pixels
Độ phân giải (Resolution): 72 ppi (chuẩn web)
Định dạng: WebP hoặc JPG (đã nén để load nhanh)
2. Vùng an toàn (Safe Zone) không bị cắt trên Mobile
Do code đang sử dụng thuộc tính tự động phủ kín màn hình và canh giữa (bg-cover bg-center), khi xem trên màn hình điện thoại dọc, hai bên trái và phải của bức ảnh sẽ bị cắt đi rất nhiều.

Kích thước vùng an toàn: Một hình chữ nhật kích thước 488 x 600 pixels nằm ngay chính giữa bức ảnh 1920x600.
Tính toán chi tiết:
Cắt bên trái: ~716px
Cắt bên phải: ~716px
Phần hiển thị trên Mobile: Nằm ở phần lõi 488px giữa ảnh.
👉 Mọi hình ảnh quan trọng nhất (như sản phẩm chính, người mẫu) BẮT BUỘC phải nằm trong dải 488px chính giữa này.

⚠️ Lưu ý rất quan trọng về phần Chữ (Text) trên Web
Code hiện tại của bạn đang để phần chữ (Tiêu đề, mô tả, nút bấm) nằm đè lên trên ảnh và được căn lề trái.

Trên máy tính: Phần chữ sẽ chiếm một khoảng rộng bên trái.
Nếu bạn thiết kế ảnh sản phẩm nằm chính giữa (để không bị cắt trên mobile) -> Trên máy tính, phần chữ có thể đè lên trên ảnh sản phẩm của bạn.
💡 Giải pháp tốt nhất cho thiết kế:

Dùng ảnh nền (Background) là những mảng màu, họa tiết văn phòng rộng rãi, không có chủ thể cụ thể để chữ đè lên vẫn đẹp.
Nếu bạn bắt buộc muốn thiết kế một banner có hình sản phẩm, cách tốt nhất là nên sửa lại một chút code (cho phép tải ảnh banner riêng cho Mobile và ảnh banner riêng cho Desktop). Nếu bạn muốn, tôi có thể sửa code của file HeroSection.tsx giúp bạn để hiển thị hoàn hảo nhất mà bạn không cần phải tính toán vùng an toàn đau đầu như trên!