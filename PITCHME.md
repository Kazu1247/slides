## React シリーズ

<br />

## - Redux-Thunk の導入 -

2020/10/20 小林

---

- なぜ、ミドルウェアを導入すべきなのかを確認する
- Redux-Thunk の特徴について確認をする

---

@snap[west span-45]

@size[0.5em] I recommend

![alt](assets/images/ouka.png)

@snapend

@snap[east span-50]

@size[0.5em](りあクト！TypeScriptで始めるつらくないReact開発)
@size[0.5em](大岡由佳)
@size[0.5em](@oukayuka)

@snapend

---

## そもそもミドルウェアって？

API 通信など副作用を伴う非同期処理を行ってくれるところ

---

## なぜミドルウェアが必要なのか？

---

## ミドルウェアを使わない場合、

- React コンポーネント内部に処理を置く

  - ライフサイクルメソッド
  - イベントハンドラで呼ばれる関数

- その結果をローカル state に格納してコンポーネント内部で使い回す

---?code=sideEffect_without_middleWare.tsx

---

このやり方だと、規模が大きくなるにつれれ様々な問題が出てくる

---

## 問題点

- コンポーネントと副作用を伴うロジックが密結合になる

  - メンテナンスコスト
  - テストしにくい
  - 再利用できないか取得したデータは使い捨てになる

- ライフサイクルメソッドを使う場合は、重複したコードを書くことになる
  - componentDidMount と componentDidUpdate

---

## そこで、ミドルウェアを使おうという選択肢

---

![alt](assets/images/npm_trends_thunk.png)

---

## Redux-Thunk のしくみ

---

## まず、Redux のデータフロー

![alt](assets/images/redux.png)

---

## Redux-Thunk のデータフロー

![alt](assets/images/redux_thunk.png)

---?code=thunk_example.ts

---?code=reducer.ts

---

## Redux-Thunk とは、

dispatcher を拡張して、<br />
純粋な action オブジェクト以外にも副作用を
内包した関数や Promise オブジェクトを dispatch できるようにするミドルウェア

---

- 「dispatcher を拡張して」とは、

---

- action creator の中で他の action creator を dispatch することができる
- 複数の action を dispatch することができる

---

<br>

@snap[west span-45 font-size]

@size[0.5em]@color[#5289F7](標準の Dispatcher)

@size[0.25em]@color[#5289F7](純粋な action オブジェクト) のみ dispatch する

![alt](assets/images/mapDispatchToProps.png)

@snapend

@snap[east span-50]

@size[0.5em]@color[#5289F7](Redux Thunk)

@size[12px](@color[#5289F7](副作用を内包した関数や Promise オブジェクト))も dispatch する

![alt](assets/images/redux-thunk-example.png)

@snapend

---

---

では@color[#5289F7](Hooks)を使用した@color[#5289F7](関数コンポーネント)ではどうなるのか

---

@snap[west span-45]

![alt](assets/images/FunctionalComponentExample.png)

@snapend

@snap[east span-50]

- @size[0.5em](Hooksを使うことで、ライフサイクルのメソッド名に基づくのではなく、実際に何をやっているのかに基づいてコードを分割ができるようになる。)

@snapend

---

🤔

---

クラスコンポーネントではライフサイクルメソッドで

## タイミング

を制御していたが、その保証は行ってくれるのか？

---

## 😊 大丈夫だった

---?code=useEffect_1.js

@snap[east span-50]

- @size[0.5em](第一引数に、引数なしの関数を設定（doSomething）。レンダリング時に実行される)
- @size[0.5em](戻り値を設定するとコンポーネントのアンマウント時に実行される)
- @size[0.5em](第二引数は配列で指定（省略可能）)
- @size[0.5em](そこに任意の変数を入れておくと、その値が前回のレンダリング時と変わらなければ第一引数で渡された関数の実行がキャンセルされることになる)

@snapend

---?code=useEffect_2.js

@snap[east span-50]

- @size[0.5em](第二引数は省略するとレンダリング時の毎回doSomethingは実行される)

@snapend

---?code=useEffect_3.js

@snap[east span-50]

- @size[0.5em](第二引数に空配列を渡すと、初回のレンダリング時にのみdoSomethingが実行される)

@snapend

---

## クラスコンポーネント

→ このライフサイクルのタイミングでこの処理とこの処理を実行する

## Effect Hook

→ この処理を実行したいのはこれとこれのタイミングだ

---

ご清聴、ありがとうございました！

---

@snap[west span-45]

@size[0.5em] I recommend

![alt](assets/images/ouka.png)

@snapend

@snap[east span-50]

@size[0.5em](りあクト！TypeScriptで始めるつらくないReact開発)
@size[0.5em](大岡由佳)
@size[0.5em](@oukayuka)

@snapend

---
