# UnitWise

スーパーの商品を、店名と個数・重量・容量あたりの単価で比較するアプリです。

## 開発

```sh
npm ci
npm run dev
```

## GitHub Pagesへのデプロイ

`main` ブランチへの push 時に GitHub Actions がビルドして GitHub Pages にデプロイします。Actions タブで実行状況を確認できます。

1. GitHub リポジトリの **Settings → Pages** を開く
2. **Build and deployment** の **Source** を **GitHub Actions** に設定する
3. `main` に push し、Actions のデプロイ完了後に `https://<GitHubユーザー名>.github.io/unit-wise/` を開く

ローカル開発時はルートパス、本番ビルド時は `/unit-wise/` を使います。リポジトリ名を変えた場合は `vite.config.ts` の `base` も更新してください。

商品データは利用中のブラウザーの `localStorage` に保存され、他の端末とは同期されません。
