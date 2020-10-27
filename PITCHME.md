## React シリーズ

<br />

## - Redux-Thunk の導入 -

2020/10/28 小林

---

- なぜ、ミドルウェアを導入すべきなのか
- Redux-Thunk の特徴について

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

なぜ、ミドルウェアを導入すべきなのか

---

## ミドルウェアがない場合とある場合では何が違うのか？

---

非同期処理を伴う外部通信、API をどう扱うかが変わってくる

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

- 非同期処理を含む処理を切り出して、独立させる
- 同じロジックの使い回しが 可能になる

---

## React ミドルウェアの御三家

### Redux-Thunk vs Redux-Saga vs Redux-Observable

![alt](assets/images/npm_trends_thunk.png)

---

## Redux-Thunk のしくみ

---

## まず、Redux のデータフロー

![alt](assets/images/redux.png)

dispatch: "発送する","派遣する"

---

## Redux-Thunk のデータフロー

![alt](assets/images/redux_thunk.png)

---

## Redux-Thunk とは、

①dispatcher を拡張して、<br />
② 純粋な action オブジェクト以外にも副作用を
含む関数や Promise オブジェクトを dispatch できるようにするミドルウェア

---

<br>

@snap[west span-45 font-size]

@size[0.75em]<b>@color[#5289F7](標準の Dispatcher)</b><br />@size[0.5em](@container)

@size[0.5em](@color[#5289F7](純粋な action オブジェクト) のみ dispatch する)

![alt](assets/images/mapDispatchToProps.png)

@snapend

@snap[east span-50]

@size[0.75em]<b>@color[#5289F7](Redux Thunk)</b><br />@size[0.5em](@thunk)

@size[0.5em](@color[#5289F7](副作用を内包した関数や Promise オブジェクト)も dispatch する)

![alt](assets/images/redux-thunk-example.png)

@snapend

---?code=thunk_example.ts

---?code=reducer.ts

---?code=actionCreator.ts

---

@snap[west span-45]

![alt](assets/images/directory1.png)

@snapend

@snap[east span-50]

![alt](assets/images/directory2.png)

@snapend

---

## まとめ

- Redux Thunk
  - 特徴 ① 純粋な action だけでなく、非同期処理を含む action creator も dispatch できるようになる
  - 特徴 ② 複数の action を dispatch することができる
    → 使われ方：API のやりとりを Thunks に固める

---

ご清聴、ありがとうございました！

---
