---
title: "FirestoreクライアントとしてのRedux Saga Firebase "
emoji: "😺"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["reduxsaga", "firebase"]
published: true
---

## はじめに

こんにちは。最近友人と開発している React × Firebase の Web アプリで redux-saga-firebase を使用しているので、その紹介をしたいと思います。redux-saga-firebase が Firestore クライアントとしてどう機能するのかということを使用例などを交えて書いていきます。

## Redux-Saga-Firebase とは

Redux のアプリケーションにおいては、Firebase とのやり取りなどの非同期処理はミドルウェアに切り出して処理します。そのミドルウェアの一つが redux saga なのですが、そこでの処理を良しなにやってくれる便利なライブラリが [redux-saga-firebase](https://redux-saga-firebase.js.org/reference/dev/firestore) です。

![スクリーンショット 2020-01-10 13.57.37.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/255852/eb80512e-b675-00ee-4edf-269db1a6a718.png)

[npm trends](https://www.npmtrends.com/redux-saga-firebase) (2020/1/16 現在) で見てみるとこんな感じです。ものすごく使われているという感じではないですが、更新状況も新しく、それなりに使用されているのが分かります。

![スクリーンショット 2020-01-15 23.16.23.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/255852/0163eba5-4434-32f1-46a8-495d36532d95.png)

## どう使えるのか

では、redux-saga-firebase は実際どのように使用されるのかということです。ここでは、使用しない場合と比べながら、**ドキュメント取得、コレクション取得、リアルタイムアップデート**に着目して紹介していきます。

まずこちらは redux-saga-firebase を使用するにあたって初期化などの準備です。これ以降、redux-saga-firebase を使用する際にはこの rsf を使います。

```typescript:
// 初期化
const firebaseApp = firebase.initializeApp({ ... })

const rsf = new ReduxSagaFirebase(firebaseApp)
```

### 【使用例 1】Firestore のドキュメント取得

ここでは Firestore からドキュメントデータを取得する方法についてです。

### redux-saga-firebase を使用しない場合

redux-saga-firebse を使用しない場合と比較するため、まずは使用しない場合を考えてみます。

下の例では、Firestore からのデータが配列で返ってくる処理を想定しています。`.where()`を使用して条件の合致する全てのドキュメントをクエリして`.get()`によってその結果を取得しています。この例では、uid (ユーザ ID) で絞ってドキュメントのデータを取得しています。

```typescript:

db.collection("hogehoge").where("uid", "==", uid)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            let sample = []
            sample.push(doc.data())
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
```

また、上記の書き方では、配列`sample`を参照する処理がここ以降に存在する場合、全てのドキュメントを配列`sample`に追加する前の状態を参照してしまう同期的な処理になっています。その対策としては、`sync/await`を使用したりするのですが、ここで、一旦 redux-saga-firebase を検討してみましょう。

### redux-saga-firebase を使用する場合

redux-saga-firebase を使用する場合についてみてみます。`.getDocument`によって特定のドキュメントを hoghoge コレクションから取得しています。同じ処理部分だけを見ると、redux-saga-firebase を使用した場合は一行のコードで済んでスッキリしていて可読性も高いです。このように**データをドキュメントの配列で取得する場合でも~~面倒くさい~~配列の操作なども要りませんし、非同期処理を同期的に書くことができるのでコールバック地獄に陥ることもありません。**

```typescript:sagas/hogehoge.ts
    // firestoreの'hogehoge'というコレクションからuidで絞ったドキュメントのデータを取得する
    const doc = yield call(rsf.firestore.getDocument, 'hogehoge/'.concat(uid))

```

### 【使用例 2】コレクションの取得について

コレクションの取得については`.getCollection`メソッドを使用します。ここでは hoges という配列を用意してそれぞれ格納しています。

```typescript:sagas/hoghoge.ts

    // hogehogeコレクションを取得
    const snapshot = yield call( rsf.firestore.getCollection,'hogehoge')
    // 配列を用意して格納
    let hoges = []
    snapshot.forEach( hoge => {
      hoges = [...hoges, hoge.data()]
    }
```

ここで、コレクション取得に制限や条件をかけるクエリを紹介します。

- 取得数を制限する：`.limit()`

例えば、コレクションから 8 つだけ取得する場合は以下の通りです。

```typescript
const snapshot = yield call(
  rsf.firestore.getCollection,
  firebase.firestore().collection("hogehoge").limit(8)
);
```

- 並び替えてから任意の数だけ取得する：`.orderBy().limit()`

例えば、`age`プロパティで並び替え(デフォルトは昇順)て、5 つだけ取得する場合は以下の通りです。

```typescript
const snapshot = yield call(
  rsf.firestore.getCollection,
  firebase.firestore().collection("hogehoge").orderBy(`age`).limit("5")
);
```

このような`limit()`や`orderBy()`は redux saga firebase ライブラリではなく firebase のリファレンス（上記のように`firebase.firestore()`から参照している）です。このように、redux saga firebase ライブラリを使用しつつも firebase リファレンスも併用することもできます。コレクション取得の際に使用できる firebase リファレンスは[ここ](https://firebase.google.com/docs/reference/js/firebase.firestore.CollectionReference)に載っているので興味ある方は覗いてみてください。

### 【使用例 3】リアルタイムアップデートについて

Firestore のリアルタイムでの動きを感知して更新したいときには`.channel()`メソッドが使用できます。

例えば、SNS のタイムラインのようなリアルタイムでの更新です。タイムライン更新のような、外部でのイベント発生を saga が監視することでリアルタイムアップデートを行います。

saga での記述例を下に書きます。前提として、更新日時で並び変えられたドキュメントを持つ`timeline`というコレクションが Firestore にあるとします。そのコレクションの変更を`rsf.firestore.channel()`によって感知して`hogehoge`という変数に格納しています。そして最後に redux で定義されている action のパラメータとして渡すことで、更新を反映しています。

```typescript:saga/timeline.ts

  // timelineというコレクションを更新日時によって並び変えている
  const colRef = db.collection('timeline').orderBy('updatedAt')
  // そのtimelineコレクションの並びに変更があるか監視
  const channel = rsf.firestore.channel(colRef)

  while (true) {
    // 更新を感知してhogehogeに格納
    const hogehoge = yield take(channel)
    // hogehogeをパラメータにactionを呼ぶ
    yield put (action(hogehoge));
  }
```

リアルタイムアップデートの処理は冗長になりがちですが、redux saga firebase ライブラリを使用するととてもスッキリ書けるのがわかると思います。

## 終わりに

この記事では、redux-saga-firebase について紹介してきました。
Redux で Firestore を使用する場合、その非同期処理を saga および redux-saga-firebase というライブラリに任せてみてはいかがでしょうか。
