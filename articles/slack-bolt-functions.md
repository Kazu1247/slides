---
title: "Slack Bolt × Firebase Functions の message における3 秒レスポンス対策"
emoji: "⏱️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["SlackBolt", "FirebaseFunctions"]
published: false
---

## 1. 動機

今回、私は Firebase Functions、Slack Bolt、LangChain で生成 AI アプリを開発しているのですが、Slack API に問い合わせるとなぜか毎回合計 4 回のレスポンスがありました。これは Faas で Slack API を使用すると起こりやすい問題で、そのための対応は Slack Bolt 公式からも提供されているのですが message リクエストで起きた場合はやや事情が異なるので、この問題と対応方法を書いていきます。

## 2. Slack API におけるリトライ仕様とそれに伴う FaaS 使用時の課題

Slack API を利用するアプリケーションでは、[Slack からのリクエストに対して 3 秒以内にレスポンスを返すこと](https://api.slack.com/apis/connections/events-api#failure)が求められます。この要件を満たせない場合、[Slack はリクエストの送信に失敗したとみなし、最大 3 回までリトライを行います](https://api.slack.com/apis/connections/events-api#retries)。AWS Lambda や Firebase Functions のような FaaS 環境でアプリケーションを実行する場合、コールドスタートによりこの 3 秒以内のレスポンスが保証されないことがあるため、意図せず複数回のリクエスト処理が行われ、データの重複処理や不整合を引き起こす原因となり得ます。つまり、正常にレスポンスが返されたとしてもそれに 3 秒以上かかってしまった場合は、何も対策しないと合計で 4 回も同様の処理が実行されてしまうことになります。

今回、生成 AI アプリの実装をしており LLM からの返却でそれなりに時間がかかっていたのでこういった事象が発生しました。LLM での生成を待つユースケースの場合、この問題はより発生しやすいと感じました。

### 3. 対応方法

#### 3.1 アクション(action)、コマンド(command)、オプション(options)リクエストなどを使用している場合の対応

これらのリクエストを使用している場合は簡単で、Slack Bolt が用意している `ack()` を 3 秒以内に呼び出してあげれば良いです。これにより Slack 側にリクエストが正常に受信されたことを知らせることができます。`ack()` メソッドは、Slack からのリクエストを受け取ったことを確認し、応答するために使用されます。これは主に、Slack のインタラクティブなコンポーネント（例えば、ボタンクリックやコマンド入力など）からのリクエストに対して、アプリケーションがリクエストを受け取ったことを Slack に通知し、タイムアウトエラーを防ぐために必要です。

```javascript
app.command("/hoge", async ({ ack }) => {
  // コマンドリクエストを確認
  await ack();

  // 任意の処理
  await hoge();
});
```

#### 3.2 メッセージ(message)リクエストを使用している場合の対応

今回、私が実装したのはこの message リクエストでした。message イベントはユーザーがチャンネルにメッセージを投稿したときなどに発生するイベントであり、Slack からの通知に過ぎません。このため、アプリケーションがこれを「受け入れた」と Slack に伝える必要はありません。Slack Bolt は message イベントを自動的に処理し、開発者が特に ack()を呼び出す必要はないように設計されてる、と理解していたのですが、今回リトライ処理が走っているので対応をする必要がありました。[「Bolt の message リクエストで不要なリトライが走ったけど message には ack()が無いんやろか！？」という 今回私が直面したことと同じ Issue](https://github.com/slackapi/bolt-js/issues/2031) は立っていますが最終的に Bolt のバグだろうという形で Close されていました。

で、この場合、基本的に大きく以下の二つの方針になるかと思います。

1. **リトライの発生を抑制する:** Slack の HTTP ヘッダーに`X-Slack-No-Retry: 1`を付与してリトライを抑制する方法です。生の [Slack API の Docs にこの方法](https://api.slack.com/apis/connections/events-api#retries-off)が紹介されているため、基本的にこれが正攻法になるのですが、Bolt のミドルウェアにそのまま組み込もうとすると機能しなかったので次の方法を採用しました。

2. **リトライの発生は許容するが無視する:** 今回はこちらの、リトライ自体は許容するがリトライのレスポンスは無視する方法を採用しました。

**リトライの発生は許容するが無視する方法**

`ExpressReceiver`をカスタマイズして、リクエストヘッダーの`X-Slack-Retry-Num`と`X-Slack-Retry-Reason`をチェックすることで、リトライリクエストを検出します。これらのヘッダーが存在する場合、リクエストはリトライであると判断され、そのリクエストの処理はスキップされます。この方法により、リトライによる不要な処理を避けることができます。

```javascript
// ExpressReceiverの設定、リトライに関する情報をcontextに追加
const expressReceiver = new ExpressReceiver({
  signingSecret: slackSigningSecret,
  endpoints: "/events",
  processBeforeResponse: true,
  customPropertiesExtractor: (req) => ({
    headers: req.headers,
  }),
});

// Boltアプリの初期化（ExpressReceiverを使用）
const app = new App({
  token: slackBotToken,
  receiver: expressReceiver,
  processBeforeResponse: true,
});

// ミドルウェアを追加してリトライリクエストを処理から除外
app.use(async ({ context, next }) => {
  const retryNum = context.headers["x-slack-retry-num"];
  const retryReason = context.headers["x-slack-retry-reason"];

  if (retryNum && retryReason === "http_timeout") {
    console.log(
      `Retry detected. Number: ${retryNum}, Reason: ${retryReason}. Ignoring.`
    );
    return; // ここで処理を終了し、リトライリクエストを無視
  }

  await next(); // リトライでない場合は次の処理へ
});
```

## 5. さいごに

Firebase Functions と Slack Bolt を使用して message リクエストを行う場合に発生し得る 3 秒レスポンスの問題と対応方法について紹介しました。messae リクエストでは ack() が不要とされていることから、今回の問題は messae リクエストを使用した全てのケースで発生することはない認識なのですが、起きた場合の対応として参考になれば幸いです。

参考:

- [Slack API Failure conditions](https://api.slack.com/apis/connections/events-api#failure)
- [Slack API Retries](https://api.slack.com/apis/connections/events-api#retries)
- [Bolt-js: Is there ack on app message](https://github.com/slackapi/bolt-js/issues/2031)
