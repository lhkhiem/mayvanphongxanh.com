# Script Tự động Deploy Next.js lên VPS cho Windows
# Bạn chỉ cần chạy lệnh: .\deploy.ps1 trên PowerShell

$ErrorActionPreference = "Stop"
$IP_VPS = "14.225.211.85"
$USER_DEV = "dev"
$PATH_VPS = "/var/www/mvpx"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 BẮT ĐẦU QUÁ TRÌNH DEPLOY LÊN VPS 🚀" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Nén code cục bộ (Bỏ qua node_modules, .next, .git và .env)
Write-Host "`n[1/4] Đang nén mã nguồn (Bỏ qua các file rác)..." -ForegroundColor Yellow
if (Test-Path "deploy.tar.gz") { Remove-Item "deploy.tar.gz" }
# Dùng tar tích hợp sẵn của Windows 10/11
tar.exe -czvf deploy.tar.gz --exclude=node_modules --exclude=.next --exclude=.git --exclude=.env --exclude=deploy.tar.gz --exclude=deploy.zip --exclude=deploy.ps1 .

# 2. Upload file nén lên VPS
Write-Host "`n[2/4] Đang Upload file lên VPS (Vui lòng nhập mật khẩu user dev nếu được hỏi)..." -ForegroundColor Yellow
scp -o PubkeyAuthentication=no deploy.tar.gz ${USER_DEV}@${IP_VPS}:${PATH_VPS}/
if (Test-Path ".env.production") {
    Write-Host "Đang đồng bộ cấu hình .env.production lên VPS..." -ForegroundColor Yellow
    scp -o PubkeyAuthentication=no .env.production ${USER_DEV}@${IP_VPS}:${PATH_VPS}/.env
}

# 3. Giải nén, Cài đặt và Build trực tiếp trên VPS
Write-Host "`n[3/4 & 4/4] Đang giải nén, Build mã nguồn và Khởi động lại PM2..." -ForegroundColor Yellow
$SSH_COMMAND = "cd $PATH_VPS && tar -xzf deploy.tar.gz && pnpm install && npx prisma generate && rm -rf .next && pnpm run build && mkdir -p public/uploads && chmod -R 777 public/uploads && sudo -u app pm2 restart mvpx --update-env"
ssh -o PubkeyAuthentication=no ${USER_DEV}@${IP_VPS} $SSH_COMMAND



# Xoá file rác local
if (Test-Path "deploy.tar.gz") { Remove-Item "deploy.tar.gz" }

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "✅ DEPLOY THÀNH CÔNG! TRANG WEB ĐÃ ĐƯỢC CẬP NHẬT ✅" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
