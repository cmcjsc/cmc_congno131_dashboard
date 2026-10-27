# CMC Công nợ 131 — bản Vercel

Thư mục này được tạo bởi `Cmc.Ar131.WebExporter`. Không chứa giá trị Supabase secret.

`api/state.mjs` đọc snapshot trên Supabase ở phía server Vercel. Trong Vercel Environment Variables phải có:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

Không đưa giá trị `SUPABASE_SECRET_KEY` vào HTML, JavaScript hoặc Git.

## Đẩy bản thử nghiệm

```powershell
git checkout -B preview-dashboard
git add index.html assets api vercel.json README-DEPLOY.md .cmc-web-export.json
git commit -m "Update CMC AR131 dashboard"
git push -u origin preview-dashboard
```

Vercel tạo Preview Deployment cho nhánh này. Chỉ merge vào `main` sau khi đã kiểm tra Preview.

Khi nhận HTML mới, chạy lại WebExporter vào chính thư mục này rồi commit các file thay đổi.