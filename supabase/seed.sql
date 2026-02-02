-- ============================================
-- Groupin Demo Data (Seed)
-- ============================================

-- Demo User (created via Supabase Auth)
-- Email: demo@groupin.jp
-- Password: demo123456

-- Organizations
INSERT INTO organizations (id, slug, name, description, category, icon_url, read_receipt_enabled) VALUES
  ('11111111-1111-1111-1111-111111111111', 'tech-startup', 'テックスタートアップ株式会社', 'イノベーションを創造する技術集団', 'company', NULL, true),
  ('22222222-2222-2222-2222-222222222222', 'soccer-club', '東京高校サッカー部', '全国大会を目指して日々練習', 'school', NULL, true),
  ('33333333-3333-3333-3333-333333333333', 'design-community', 'デザインコミュニティ', 'デザイナーの交流の場', 'community', NULL, false);

-- Chat Rooms
INSERT INTO chat_rooms (id, org_id, name, description) VALUES
  -- Tech Startup
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '一般', '全体的な話題'),
  ('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '開発チーム', '開発に関する議論'),
  ('aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'ランダム', '雑談'),
  -- Soccer Club
  ('bbbb1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '連絡', '練習・試合の連絡'),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '雑談', '部活以外の話題'),
  -- Design Community
  ('cccc1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'デザインレビュー', 'フィードバック共有'),
  ('cccc2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'インスピレーション', 'アイデア共有');

-- Admin Announcements
INSERT INTO announcements (title, content, priority) VALUES
  ('Groupinへようこそ！', 'Groupinをご利用いただきありがとうございます。団体ごとに異なるプロフィールを使い分けて、快適なコミュニケーションをお楽しみください。', 'normal'),
  ('ファイル共有機能について', '最大200MBまでのファイルをドラッグ&ドロップでアップロードできます。', 'normal');

-- Note: Profiles and Messages will be created when users join
