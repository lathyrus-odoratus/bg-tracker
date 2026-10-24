# bg-tracker：桌遊機制圖譜

以「機制」為中心的桌遊知識圖譜：這款遊戲跟哪些遊戲有關，該怎麼教？

- 規格與決策：[docs/spec.md](docs/spec.md)
- 開發指引：[AGENTS.md](AGENTS.md)

```sh
nvm use && pnpm install
cp .env.example .env            # 填入 Discord 的 client id／secret
docker compose up -d --wait
pnpm db:migrate && pnpm db:seed
pnpm dev                        # http://localhost:5180
```
