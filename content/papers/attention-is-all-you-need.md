---
title: "[논문리뷰] Attention Is All You Need"
authors: Vaswani et al.
venue: NeurIPS
year: 2017
link: https://arxiv.org/abs/1706.03762
thumbnail: images/placeholder-1.png
created: 2026-08-12
tags:
  - LLM
  - Architecture
  - Attention
  - NeurIPS
aliases:
  - Transformer 논문
---

> [!abstract] 한 줄 요약
> 순환과 합성곱을 모두 걷어내고 **어텐션만으로** 인코더–디코더를 구성해도, 번역 성능은 오히려 올라가고 학습은 훨씬 빨라진다.

## 문제 정의

기존 seq2seq 모델은 RNN이나 CNN을 인코더·디코더로 사용했고, 두 가지 한계가 있었습니다.

1. **순차 계산** — 시점 $t$ 의 은닉 상태 $h_t$ 는 $h_{t-1}$ 에 의존하므로 시퀀스 방향 병렬화가 불가능합니다. 시퀀스가 길어질수록 학습 시간이 선형으로 늘어납니다.
2. **긴 경로 길이** — 멀리 떨어진 두 토큰의 관계를 학습하려면 그만큼 많은 층을 통과해야 하고, 그 과정에서 신호가 희석됩니다.

> [!question] 그래서 던진 질문
> 어텐션은 원래 RNN을 **보조**하는 장치였는데, 어텐션만 남기고 나머지를 다 빼면 어떻게 될까?

## 방법

### Scaled Dot-Product Attention

$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

핵심은 $\sqrt{d_k}$ 로 나누는 스케일링입니다. $d_k$ 가 크면 내적 값의 분산이 커지고, softmax가 포화 구간으로 밀려나 그래디언트가 거의 사라집니다.

### Multi-Head Attention

하나의 큰 어텐션 대신, 표현을 $h$ 개로 쪼개 각각 어텐션을 수행한 뒤 다시 합칩니다.

$$
\mathrm{MultiHead}(Q,K,V) = \mathrm{Concat}(\mathrm{head}_1, \dots, \mathrm{head}_h)W^O
$$

헤드마다 다른 관계(구문 의존, 상호참조 등)를 나눠서 볼 수 있게 하려는 의도입니다.

### 층별 복잡도 비교

논문에서 가장 설득력 있는 표입니다.

| 층 종류        | 층당 복잡도              | 순차 연산 | 최대 경로 길이 |
| -------------- | ------------------------ | --------- | -------------- |
| Self-Attention | $O(n^2 \cdot d)$         | $O(1)$    | $O(1)$         |
| Recurrent      | $O(n \cdot d^2)$         | $O(n)$    | $O(n)$         |
| Convolutional  | $O(k \cdot n \cdot d^2)$ | $O(1)$    | $O(\log_k n)$  |

$n < d$ 인 일반적인 상황(문장 길이 < 표현 차원)에서는 self-attention이 recurrent보다 층당 계산량도 적습니다. 순차 연산 $O(1)$, 경로 길이 $O(1)$ 이라는 두 칸이 이 논문의 실질적인 기여입니다.

## 실험

WMT 2014 영–독 / 영–불 번역 기준입니다.

| 모델                  | EN-DE (BLEU) | EN-FR (BLEU) | 학습 비용 (FLOPs)    |
| --------------------- | ------------ | ------------ | -------------------- |
| GNMT + RL             | 24.6         | 39.9         | $1.4 \times 10^{20}$ |
| ConvS2S               | 25.2         | 40.5         | $1.5 \times 10^{20}$ |
| **Transformer (big)** | **28.4**     | **41.8**     | $2.3 \times 10^{19}$ |

성능이 오른 것보다, **학습 비용이 한 자릿수 가까이 줄어든 것**이 더 중요한 결과라고 봅니다.

### Ablation에서 눈에 띈 것

- 헤드 수는 8이 최적. 1개(단일 헤드)는 0.9 BLEU 떨어지고, 32개로 늘려도 다시 나빠집니다.
- $d_k$ 를 줄이면 성능이 떨어집니다 — 내적만으로 호환성을 재는 방식의 한계.
- Positional encoding은 학습형(learned)과 사인파형이 거의 동일한 성능. 저자들은 학습 때보다 긴 시퀀스로 외삽할 수 있다는 이유로 사인파형을 택했습니다.

## 내 생각

- 이 논문의 진짜 기여는 성능이 아니라 **병렬화 가능성**입니다. 순차 의존성을 없앤 덕분에 모델·데이터 규모를 키우는 것이 공학적으로 가능해졌고, 이후 사전학습 모델들이 전부 이 구조 위에 올라갔습니다.
- 반대로 $O(n^2)$ 라는 비용은 그대로 남아, 이후 긴 문맥 연구의 출발점이 됩니다.
- "어텐션 가중치가 곧 해석 가능성"이라는 이 논문의 시각화는 이후 반박이 많았습니다. 가중치를 근거로 읽을 때는 조심할 필요가 있습니다.

> [!warning] 확인 못 한 부분
> Positional encoding의 외삽 주장은 논문에서 실험으로 검증되지 않았습니다.

## 참고

- 원문: [Vaswani et al., 2017](https://arxiv.org/abs/1706.03762)
