# Groupin - Advanced Team Chat Platform

<div align="center">

![Groupin Logo](https://api.dicebear.com/7.x/identicon/svg?seed=groupin&size=100)

**団体ごとに独立したアイデンティティを持つマルチチャットプラットフォーム**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

### Core Features
- 🏢 **マルチ団体対応** - 複数の団体に参加し、それぞれ独立したチャットルームで会話
- 👁️ **既読機能** - 誰がメッセージを読んだかを表示（団体ごとにON/OFF設定可能）
- 📂 **ファイル共有** - ドラッグ&ドロップで最大200MBのファイルをアップロード
- 🔔 **管理者通知** - システム全体のお知らせをベル通知で確認
- 🌙 **ダークモード** - ライト/ダークモード切り替え対応

### Premium Features（将来拡張用）
- 大人数チャット（500名まで）
- 大容量ストレージ（100GB）
- カスタムブランディング
- 高度な分析機能
- APIアクセス

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x 以上
- npm 9.x 以上

### Installation

```bash
# リポジトリをクローン
git clone https://github.com/your-username/groupin.git
cd groupin

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## 📁 Project Structure

```
groupin/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # ダッシュボード
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── globals.css           # グローバルスタイル・デザインシステム
│   │   └── organization/
│   │       └── [id]/
│   │           ├── page.tsx      # 団体ページ
│   │           ├── settings/
│   │           │   └── page.tsx  # 団体設定
│   │           └── chat/
│   │               └── [chatId]/
│   │                   └── page.tsx  # チャットルーム
│   ├── components/
│   │   ├── ui/                   # 汎用UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toggle.tsx
│   │   ├── chat/                 # チャット関連コンポーネント
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── FileUploader.tsx
│   │   ├── admin/                # 管理者機能
│   │   │   └── AnnouncementInbox.tsx
│   │   └── layout/               # レイアウトコンポーネント
│   │       └── Header.tsx
│   ├── lib/
│   │   ├── store.ts              # Zustand状態管理
│   │   └── mockData.ts           # モックデータ
│   └── types/
│       └── index.ts              # TypeScript型定義
├── public/                       # 静的ファイル
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Design System

**siyukatu.me** スタイルを参考にした「究極のシンプルさと遊び心のある静寂」をコンセプトに設計。

### Key Design Principles
- **Bento Grid Layout** - 余白を贅沢に使ったカード型UI
- **Subtle Animations** - ふわっとしたフェードイン、微細なホバーエフェクト
- **Clean Typography** - Inter フォント、広い行間
- **Minimal Color Palette** - クリーンな白/深みのあるダーク

### CSS Variables
`globals.css` で定義されたCSS変数を使用：
- `--color-bg-*` - 背景色
- `--color-text-*` - テキスト色
- `--color-accent` - アクセントカラー
- `--shadow-*` - シャドウ
- `--transition-*` - トランジション

---

## 🔧 Available Scripts

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLintチェック
```

---

## 🗄️ Database Schema（設計）

現在はモックデータを使用していますが、本番環境では以下のスキーマを推奨：

### Organizations
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| name | VARCHAR | 団体名 |
| icon_url | VARCHAR | アイコンURL |
| read_receipt_enabled | BOOLEAN | 既読機能の有効化 |
| plan_type | ENUM | 'free' / 'premium' |
| created_at | TIMESTAMP | 作成日時 |

### Messages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| chat_room_id | UUID | チャットルームID |
| sender_id | UUID | 送信者ID |
| content | TEXT | メッセージ本文 |
| created_at | TIMESTAMP | 送信日時 |

### Message_Reads
| Column | Type | Description |
|--------|------|-------------|
| message_id | UUID | メッセージID |
| profile_id | UUID | 既読したユーザーID |
| read_at | TIMESTAMP | 既読日時 |

### Files
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| message_id | UUID | 添付先メッセージID |
| file_url | VARCHAR | ファイルURL |
| file_size | INTEGER | ファイルサイズ（バイト） |

---

## 🐛 Debugging

### 開発時の確認ポイント

1. **ダッシュボード表示**
   - http://localhost:3000 でBento Grid表示確認
   - 団体カードのホバーアニメーション確認

2. **チャット機能**
   - メッセージ送信後の表示確認
   - 既読表示（青いチェックマーク）

3. **ファイルアップロード**
   - 200MB以下: アップロード成功
   - 200MB超: エラーメッセージ表示

4. **既読設定**
   - `/organization/[id]/settings` でトグル切り替え
   - チャット画面で反映確認

5. **ダークモード**
   - ヘッダーの月/太陽アイコンで切り替え

---

## 🚢 Deployment

### Vercel（推奨）

```bash
npm i -g vercel
vercel
```

### その他のプラットフォーム

```bash
npm run build
npm run start
```

---

## 📄 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
