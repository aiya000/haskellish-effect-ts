# 実装レポート: haskellish-effect-ts

## 概要

Haskell的な規律をTypeScriptに持ち込むOSSライブラリスイートを実装しました。Effect-TSを基盤とし、副作用の明示化・クローズドワールドモデル・capability-basedアクセス制御をESLintルールで強制します。

## 構成パッケージ

| パッケージ                        | 役割                                                |
| --------------------------------- | --------------------------------------------------- |
| `haskellish-effect`               | Effect-TSの制御されたre-export + 安全なラッパー関数 |
| `eslint-plugin-haskellish-effect` | 8つのESLintルールで規律を強制                       |
| `haskellish-effect-config`        | typescript-eslint + haskellishプラグインの統合設定  |

## 実装したESLintルール

1. **only-allowed-imports** — `effect`の直接importを禁止、許可されたソースのみ
2. **no-global-access** — `fetch`, `console`, `Date`, `Math`等のグローバルAPI直接アクセスを禁止
3. **no-implicit-globalthis** — `globalThis`, `window`, `document`, `self`へのアクセスを禁止
4. **capability-enforcement** — 中核ルール。全バインディングが許可されたソースから来ていることを検証
5. **no-promise** — `async/await`と`new Promise()`を禁止（Effectを使う）
6. **no-explicit-any** — `any`型注釈を禁止
7. **effect-boundary** — エクスポートされた関数にEffect戻り値型を要求（strictモード）
8. **no-mutation** — `let`/`var`宣言・再代入・`++`/`--`を禁止（Refで状態管理）

## 主要な設計判断

### `effect`の直接importを禁止

すべてのアクセスは`haskellish-effect`経由。これにより、どのモジュールが副作用を持つかが依存グラフから可視化されます。

### unsafeバウンダリの明示化

`haskellish-effect/unsafe`からのimportは、Haskellの`System.IO.Unsafe`に相当。副作用のあるグローバルへのアクセスが必要な場合、importパスでそれが明示されます。

### スコープ分析によるグローバル検出

ESLintのスコープ分析を活用し、`scope.through`（未解決参照）と暗黙的グローバル（解決済みだが定義が0個の変数）の両方を検出します。`Math`や`Date`などのビルトイングローバルも確実に検出します。

### 純粋なグローバルの許可リスト

`Array`, `Object`, `String`, `Number`, `Map`, `Set`, `Error`, `ReadonlyArray`等の純粋な型・コンストラクタはグローバルアクセスを許可。副作用を持つもの（`fetch`, `console`, `Date`, `Math`）のみをブロックします。

## 検証結果

- **ビルド**: 全3パッケージがtsupでESM+CJS+dtsの出力に成功
- **型チェック**: 全パッケージで`tsc --noEmit`がエラーなし
- **テスト**: 83テストケースが全てパス（7つのルールに対する正常/異常ケース）
- **Lint**: exampleプロジェクトがエラー・警告なしでlintを通過

## 次にやるべきこと

### 公開準備

1. `npm publish`（または`bun publish`）で3パッケージを公開
2. GitHubリポジトリの作成とCI設定（GitHub Actions）
3. CHANGELOGとリリースノートの整備

### カスタマイズ

- `allowedPackages`オプションでプロジェクト固有の外部パッケージを許可
- `allowedGlobals`オプションで追加のグローバルを許可
- `recommended`と`strict`プリセットの選択

### 拡張

- `no-throw`ルール（`throw`文の禁止）の追加
- ~~`no-mutation`ルール（再代入の禁止）の追加~~ ✅ 実装済み
- VS Code拡張との統合（エディタ内リアルタイムフィードバック）
- Effect-TS公式のStream/Layer/Schedulerサービスのラッパー追加

## 既知の制限

1. **ESLintルールは構文レベル** — 型情報を使ったルール（type-aware rules）ではないため、エイリアスやre-exportを完全にはトラッキングできません
2. **Schema.ParseError** — Effect-TSの`ParseError`はTypeScriptの`error`型として推論されるため、union型で他の型を覆い隠す場合があります。例示コードでは`unknown`に簡略化しています
3. **`effect-boundary`ルール** — 構文的なチェックのみ。`Effect`を返す型エイリアスや関数合成による間接的なEffect戻り値は検出できません
4. **パフォーマンス** — `capability-enforcement`ルールは全スコープを再帰的にウォークするため、非常に大きなファイルではパフォーマンス影響の可能性があります
