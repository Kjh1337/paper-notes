---
title: "[논문리뷰] GraphRAG-Induced Dual Knowledge Structure Graphs for Personalized Learning Path Recommendation"
authors: Cheng et al.
venue: AAAI
year: 2026
link: https://arxiv.org/abs/2506.22303
thumbnail: images/knowlp.png
description: 선수 관계만 보는 학습 경로 추천이 왜 학습자를 막히게 하는지, 그리고 GraphRAG로 지식 그래프를 직접 만들고 비슷한 수준의 개념을 함께 추천해 그 병목을 푸는 방법.
created: 2026-08-14
tags:
  - GraphRAG
  - Learning Path Recommendation
  - RL
  - AAAI
---

> [!abstract] 한 줄 요약
> 이 논문은 Personalized Learning Path Recommendation을 목표로, 선수지식 관계와 비슷한 수준의 관계를 가진 지식 개념을 함께 고려해서 blocked learning path 문제를 해결하고, 학습자 수준에 맞는 학습 경로 추천 프레임워크를 제안함 (KnowLP)

## 1-1. 문제 — 무엇이 안 되고 있었나

- prerequisite-based methods가 교육학적 기반과 인간의 인지 발달과의 일관성 덕분에 많은 주목을 받아옴
- 선수지식을 고려하는건 좋은데, 자원이 많이 필요하기 때문에 데이터를 얻는게 어려움
- 선수지식만 고려하면, blocked learning 문제가 발생할 수 있음
  - blocked learning: 선수 학습 관계에 기초하여 단일하고 순차적으로 의존적인 지식 구조에만 의존하면, 어려움이 발생했을 때 정체가 발생함.
  - ex) "A를 알아야 B를 알 수 있다"라는 식의 일방향적인 선수 관계만 고려할 경우, 학습자가 한 지점에 막히면 더이상 앞으로 나아가지 못하고 중도 포기하게 됨
  - => 비슷한 수준의 관계를 고려해야하는 이유
- 최근에는 LLM이 발전하면서, 자언어로부터 선수 학습 구조를 추론하는 대안이 나오고 있는데, 실제 적용에 있어 고품질 텍스트 설명의 가용성이 제한적이고, 환각 현상이나 잘못된 연결 관계를 생성할 위험이 존재함

## 1-2. 기존 접근과 그 한계 — 왜 기존 방법으로는 안 되나

### 1) Learning Path Recommendation

크게 두 가지 방법론이 존재함

1. KC correlation-based
   - KC들 간의 latent correlations 값 기반으로 경로 추천
2. KC prerequisite relationship-based
   - KC들 간의 선수 관계를 기반으로 경로 추천
     - CSEAL - 학습자의 지식 수준과 KC 선수 관계를 결합하여 경로 추천
     - DLPR - 항목의 난이도와 상위관계를 포착하기 위해 학습 및 연습 항목의 계층적 그래프 구성

여러 선행 연구들이 존재했지만, 여전히 해결하지 못하는 문제점 존재

- 불완전한 지식 개념의 선수관계
- 지식 개념 유사성 관계 무시 -> 부적절한 학습 경로 추천

### 2) Retrieval-Augmented Generation

GraphRAG를 활용하면, 지식 개념들간의 관계까지 검색이 가능하여, 더욱 정확한 답변이 가능하다는 장점이 있지만, 일반적으로 효과적인 구현을 위해 정확한 문서가 필요함.
그러나, 선수관계 데이터는 자원이 많이 필요하여 데이터를 수집 자체가 어렵고, 깨끗한 데이터를 얻기 어려움
=> GraphRAG에 활용하기 위한 깔끔한 데이터셋 구축 필요 => TextGrad

## 1-3. 핵심 아이디어

![[knowlp-motivation.png]]

- 학습 경로 추천에 있어 선수 관계 기반 추천은 교육학적으로 적절한 방식이나, 선수 관계 데이터 수집이 어렵고, 선수 관계만 가지고 추천을 할 경우, 학습자가 특정 수준에서 막히면 더이상 앞으로 나가지 못하는 blocked learning 현상이 발생함.
- blocked learning 현상을 해결하기 위해, 선수 관계 뿐만 아니라 현재 지식 개념과 비슷한 수준의 문제를 활용함.

## Preliminaries

- set of exercises (E) = $\{e_1, e_2, \dots, e_M\}$
- set of KCs (C) = $\{c_1, c_2, \dots, c_N\}$
- learning goals for each learner (G) = $\{g_1, g_2, \dots\}$
- $G \subseteq C$ , $e \in E$ , $g \in G$
- historical record (h) = $(e, score)$
- sequence of such recods (H) = $\{h_1, h_2, \dots, h_i\}$
- $h_j = (e_j, score_j)$
- learning path (P) = $\{\tilde{e}_1, \tilde{e}_2, \dots, \tilde{e}_k\}$
- $\tilde{e}_j \in E$ -> recommended exercise

### evaluation

- 세션 시작과 종료 사이의 학습자 피드백 점수 향상 계산

$$E_p = \frac{E_{\text{end}} - E_{\text{start}}}{E_{\sup} - E_{\text{start}}}$$

- $E_{sup}$ - 정해진 학습 목표 상에서 취득할 수 있는 최고점
- Objective - maximize the $E_p$

### Graph RAG

- $Q$ = 자연어 쿼리
- $D$ = source document
- $\phi(D)$ = 구조화된 그래프 표현
  - GraphRAG의 목적: 비정형 텍스트 데이터를 구조화된 데이터 표현 $\phi(D)$ 로 변환
- $G(\cdot, \cdot)$ - Graph Constructor
  - entities와 relationships를 로컬 하위 그래프로 집계하고, 중복 제거하는 역할
- A = Final Output

$$A = \text{LLM}(Q, \phi(D)) = \text{LLM}\left(Q, \bigcup_{i=1}^{n} G(\mathcal{E}, \mathcal{R})\right)$$

- 합집합 연산 -> 전체 문서를 분할하여 생성한 n개의 모든 서브 그래프들을 하나로 통합
- $\mathcal{E}$ - Extracted entities
- $\mathcal{R}$ - Extracted relationships

## 1-4. 방법론

![[knowlp-framework.png]]

### 1) Knowledge Structure Graph Generation

#### 1.1. Knowledge Concept Explanation Generation

지식 개념의 이름만 가지고, 정교한 explanation을 생성하는 과정 (고품질 텍스트 데이터 생성 과정).
이게 왜 필요한가? -> 고품질 교육 텍스트 데이터의 부재 해결

![[knowlp-textgrad.png|419]]

- TextGrad 기반 KC explanation 생성
- Notations
  - $\mathcal{T}^{(0)}$ - initial explanation
  - $P_{\text{gen}}$ - predefined prompt
  - $\mathcal{T}^{(t)}$ - explanation at iteration $t$
  - $P_{\text{eval}}$ - evaluation prompt
  - $\nabla_{\text{LLM}}^{(t)}$ - feedback via $P_{\text{feedback}}$
  - $P_{\text{feedback}}$ - additional feedback prompt
  - $P_{\text{rewrite}}$ - rewriting prompt
  - $c$ - knowledge concept name

$$\mathcal{T}^{(t+1)} = \text{LLM}\left(P_{\text{rewrite}}, \mathcal{T}^{(t)}, \nabla_{\text{LLM}}^{(t)}\right)$$

$$\nabla_{\text{LLM}}^{(t)} = \text{LLM}\left(P_{\text{feedback}}, \text{LLM}\left(P_{\text{eval}}, c, \mathcal{T}^{(t)}\right)\right)$$

- 값이 수렴하거나, 사전에 정의한 최대 스텝 수 ($T$)에 도달할 때까지 반복
- 최종 산출된 explanation이 source document $D_c$가 됨

**한 줄 정리**
우리가 얻을 수 있는 데이터는 주로 학습 개념의 이름만 명시되어 있고, 교과서 수준의 구체적인 설명은 존재하지 않음. 따라서, TextGrad를 기반으로 학습 개념명을 입력으로 받아, 고품질의 텍스트 설명 데이터를 생성하고, 생성 과정에서 생성된 결과에 대한 평가, 피드백 루프가 반복되며 고품질의 데이터를 생성해내는 과정
여기서 생성된 데이터를 기반으로 다음 단계에서 Knowledge Graph를 생성함.

#### 1.2. EDU-GraphRAG

정교하게 생성된 비정형 데이터(텍스트)를 이중 지식 그래프로 설계하는 단계

- Document ($D_c$) = $\{D_{c_1}, D_{c_2}, \ldots, D_{c_N}\}$
  - $D_{c_i}$ - knowledge concept $c_i$ 를 설명하는 문서
- $D_c$ 를 Chunking 하여 잘게 쪼갬 (using parameterized segmentation function)
  - parameterized segmentation function $\sigma(D_c;\theta) = \{\sigma_1(D_c;\theta), \ldots, \sigma_n(D_c;\theta)\}$
  - 각 청크마다 LLM이 entities와 relationships를 추출
- 모든 entities와 relationships를 통합 (local subgraphs -> global document-level graph index)

$$\phi(D_c) = \bigcup_{i=1}^{n} G\big(\mathcal{E}(\sigma_i(D_c;\theta)),\ \mathcal{R}(\sigma_i(D_c;\theta))\big)$$

- $\mathcal{R}(\sigma_i(D_c;\theta))$ : text chunk에서 추출한 relationships
- $\mathcal{E}(\sigma_i(D_c;\theta))$ : text chunk에서 추출한 entities
- $G$ (graph conductor) : entities와 relationships를 기반으로 그래프 구축
- 합집합 : n개의 서브그래프를 하나의 그래프로 통합 ($\phi(D_c)$)
- Final output
  - $G_{\mathcal{A}} = \text{LLM}(Q, \phi(D_c))$
  - $G_{\mathcal{A}} = (\mathcal{C}, \mathcal{P},\mathcal{S})$ - 선수관계와 유사성을 고려한 이중 지식 그래프
    - $\mathcal{C}$: 지식 개념 집합
    - $\mathcal{P}$: 선수 관계
    - $\mathcal{S}$: semantic edge 집합

**한 줄 정리**
이전 단계에서 만들어진 고품질의 텍스트 데이터(비정형)을 에이전트가 읽을 수 있도록, 구조화된 그래프로 변경하는 단계. 참고 문서를 적절한 크기로 쪼개고, 쪼개어진 청크 안에서 entity와 relationship을 추출하여 local graph를 구축하고, graph conductor를 기반으로 그래프 간의 중복을 제거하고, 최종 결합하여 global document-level graph index $\phi(D_c)$를 생성하고, LLM에게 쿼리($Q$)와 함께 제공하여 최종 답안을 생성함.

### 2) Learning Path Generation

학습 정체를 해소하면서 학습자 맞춤형 학습 경로 추천을 동적으로 수행하는 모듈 제시

- Discrimination Learning-driven Reinforcement Learning(DLRL)

환경 선정

- Difficulty Matching Knowledge Tracing (DIMKT)

총 3명의 에이전트 존재

1. P-Agent (Prerequisite Agent)
2. S-Agent (Similarity Agent)
3. D-Agent (Difficulty Agent)

#### 2.1 Knowledge Tracing

학습자의 수준과 문제의 난이도를 같이 고려해야 이 사람이 학습을 통해 성장하고 있다는 것을 파악할 수 있음
"이 학생은 본인 수준보다 어려운 문제를 풀었으니, 실력이 높구나" 라는 식의 판별이 가능해짐

- DIMKT -> 문제의 난이도가 학습자에게 끼치는 영향 파악
- 학습자 수준에 맞는 난이도의 문제 추천 가능

#### 2.2 Prerequisite Agent

**P-Agent** : 선수 관계에 기반하여 순차적인 지식 개념을 선정하는 역할

**a)** State encoder

- 학습자의 학습 목표와 과거 학습 기록을 기반으로 knowledge state 예측
- state of the P-agent at step $t$ : $\mathbf{s}_t = \mathbf{h}_{t-1} \oplus \mathbf{G}$, $\mathbf{G} = \{0,1\}^N$

**b)** Policy

- Proximal Policy Optimization (PPO)를 prerequisite relation agent의 모델로서 활용
  - PPO에는 두 가지의 주요 component가 존재
  - Policy network (Actor) : $\pi(\mathbf{G}\mid \mathbf{s}_t;\theta)$
  - Value network (Critic) : $V(s_t;\phi)$
  - $\theta, \phi$: respective network parameters
- Policy network는 데이터셋 속 지식 개념들의 확률분포를 생성
  - $\mathbf{G} \sim \pi(\mathbf{G}\mid \mathbf{s}_t;\theta) = \text{Softmax}(\text{Linear}(\mathbf{s}_t))$
  - Linear is the fully connected layer
- Value network는 relation agent의 상태를 입력으로 받아서, 현재 상태로 갔을 때의 reward를 평가함
  - $V(\mathbf{s}_t;\phi) = Linear(s_t)$
- 각 학습 단계마다, PPO 최적화
  - MSE를 loss로 하고, gradient descent 방식으로 value network 학습
  - $L(\phi) = \mathbb{E}\left(\left\lVert \sum_{i=0}^{T-t} \gamma^{i} Re_{t+i} - V(\mathbf{s}_t;\phi) \right\rVert^2\right)$
  - 학습을 마쳤을 때, 학습자가 실제로 얻은 누적 학습 성취도와 현재 state로 예측된 reward의 차이를 기반으로 학습
  - $\hat{A}_t = -V(\mathbf{s}_t;\phi) + Re_t + \cdots + \gamma^{T-t}V(\mathbf{s}_T;\phi)$
    - 원래 예상했던 reward(V)보다, 이번에 실제로 얻은 결과가 얼마나 더 좋았는 지 평가
    - 양수 -> 이번 추천 행동이 더 좋았음을 의미함.
  - $L(\theta) = \hat{\mathbb{E}}_t\left[\min\left(r_t(\theta)\hat{A}_t,\ \text{clip}\big(r_t(\theta),\,1-\epsilon,\,1+\epsilon\big)\hat{A}_t\right)\right]$
    - $r_t(\theta) = \frac{\pi(G\mid s_t;\theta)}{\pi(G\mid s_t;\theta_{old})}$, $\epsilon = 0.2$
    - $\text{clip}(r_t(\theta),\,1-\epsilon,\,1+\epsilon)\hat{A}_t$
    - $[1-\epsilon,\ 1+\epsilon]$
    - clip을 사용한 이유: 한 번에 너무 과도하게 정책을 바꾸는 것을 방지

**c)** Reward

- 학습자의 학습 목표 숙달도 향상을 극대화하기 위해 각 단계에서 지식 개념을 선택한 후 해당 reward를 계산
- $Re_t = \begin{cases} E_p, & \text{if } t \text{ is the last learning stage} \\ 0, & \text{otherwise.}\end{cases}$

#### 2.3 Similarity Agent

- 현재 지식 개념 $C_t$ 와 관련된 유사한 지식 개념의 집합을 생성
- 학습자의 현재 지식 개념 숙달을 효과적으로 향상시킬 수 있는 햐위 경로 선택
- 선택된 하위 경로는 P-agent에 의해 생성된 학습 경로에 추가

#### 2.4 Difficulty Agent

- 학습자의 학습 수준을 기반으로, 너무 어렵거나 쉬운 문제를 주는 것을 방지
- 학습자의 지식 수준과 비슷한 난이도의 exercise를 찾아야함
- $m^{*} = \arg\min_{m \in M} \left| \text{diff}(e_m) - h^{c_i} \right|$

#### 2.5 Learning Path Construction Mechanism

**a)** Node initialization

- 데이터셋 내에 지식 개념이 너무 많기 때문에, 탐색해야할 경로의 경우의 수가 매우 넓음
- 주로 A\* algorithm을 사용해왔지만, 첫번째 시작 노드를 정확히 찾지 못한다는 한계가 존재함
- 시작점을 잘 못잡기 때문에, 목표로부터 거꾸로 추적하는 Backward Traversal 방식 채택
  - 학습자가 마스터한 개념을 만나면 멈추고, 아니라면 계속 나아가서, 가장 길게 연결된 노드를 시작점으로 채택

**b)** Agent Switching

- step t에서 P-agent는 다음 지식 개념($C_t$)을 선택할 때, 학습자의 이전 선수 지식 ($KC c_{t-1}$)의 숙련도 향상을 평가함
  - $p_t = h^{c_t}_{t-1} - h^{c_t}_{t-2}$
  - $p_t$가 임계값 $\tau$ 보다 낮다면, S-agent 활성화 -> 비슷한 수준의 문제를 학습하게 함으로써 blocked learning 문제를 해결

## 1-5. 검증 설계

### 데이터셋

![[knowlp-datasets.png]]

- Junyi
  - 지식 개념 구조 그래프 존재 (선수관계 데이터 존재)
- MOOCCubeX
  - 불완전한 지식 개념 구조 그래프
- ASSISTments2009
  - 지식 개념 구조 그래프가 없음
- 세 데이터 모두 비슷한 개념의 관계 데이터는 없음
- 데이터마다 지식 개념 구조 그래프의 완성도는 다르나, 공통적으로 지식 개념의 이름은 가지고 있음

### 베이스라인

KNN, GRU4Rec, Actor-Critic, RL-Tutor, CSEAL, SRC, GEHRL, DLPR

### 평가지표

세션 시작과 종료 사이의 학습자 피드백 점수 향상 계산

$$E_p = \frac{E_{\text{end}} - E_{\text{start}}}{E_{\sup} - E_{\text{start}}}$$

## 실험

**RQ1**: 다른 SOTA 모델들과 비교해서, KnowLP의 성능 수준은 어느정도인가?
**RQ2**: 성능 향상에 있어 S-agent가 효과적인가?
**RQ3**: EDU-GraphRAG가 지식 구조 그래프 구축에 효과적인가?
**RQ4**: TextGrad는 KnowLP를 얼마나 효율적으로 향상시키며, KnowLP는 추천된 학습 경로에 대해 합리적인 이유를 생성하는가?
**RQ5**: 시뮬레이션 실험에서 KnowLP는 얼마나 효과적인가?
**RQ6**: KnowLP의 runtime은 얼마나 되는가?
**RQ7**: 하이퍼파라미터 $\tau$ 가 성능에 어떤 영향을 끼치는가?

---

### RQ1. 다른 SOTA 모델들과 비교해서, KnowLP의 성능 수준은 어느정도인가?

![[knowlp-rq1-main.png]]

- 모든 베이스라인과 비교해서, KnowLP가 우수한 성능을 보임
- LLM 기반으로 생성된 지식 그래프와 비슷한 수준의 문제를 통합하는 방식은, 추천 성능 향상에 효과적임
- EDU-GraphRAG는 구조화된 그래프 기반으로 Hallucination 이슈를 해결함
- 대부분의 베이스라인이 step20에서 성능이 하락하는 모습을 보이는데, KnowLP는 일관하게 좋은 성능을 보여줌

### RQ2. 성능 향상에 있어 S-agent가 효과적인가?

![[knowlp-rq2-ablation.png]]

- S-agent를 w, w/o으로 ablation study를 진행했을 때, w S에서 확연한 성능 향상을 보여줌
- 학습 경로 추천에서 유사성 관계를 고려하는 것이 중요함
- w/o S에서는 step 20에서 성능이 떨어지는 모습을 보이는데, w S에서는 점진적인 성능 향상을 보여줌.

### RQ3. EDU-GraphRAG가 지식 구조 그래프 구축에 효과적인가?

![[knowlp-rq3-graph.png]]

- (a)와 (b)를 비교하면, 생성된 선수 지식 그래프의 관계 수가 원본 그래프(a) 보다 높으며, 이는 KnowLP가 지식 개념 간의 더 복잡한 선수 관계를 포착한다는 것을 나타냄
- (c)와 (d)를 보면, MCX 데이터 속 지식 개념(KC)의 전체 개수는 443개인데, (c)의 원본 그래프를 보면 고작 46개의 지식 개념만 그래프에 포함되어 있고, (d)의 KnowLP로 생성된 그래프를 보면, 443개 지식 개념 전체를 그래프로 구축한 것을 확인할 수 있음.
- (c)를 보면 고작 46개의 개념끼리 무려 1035개의 relationship이 복잡하게 얽혀있음 -> 모든 개념이 서로 연결된 fully connected layer에 가깝고, 개념간의 선수 학습 순서에 대한 변별력이 없어서 경로 추천에 도움이 되지 않음.
- (d)를 보면, 443개의 지식 개념이 719개의 relationship으로 연결되어 있고, EDU-GraphRAG 기반으로 교육학적으로 타당하고 명확한 선수 관계만 골라내어 합리적이고 구조적으로 강건한 그래프를 구축함.

![[knowlp-rq3-expert.png]]

- 전문가가 수작업으로 구축한 original 지식 그래프 vs EDU-GraphRAG 모듈이 생성한 지식 그래프
- KnowLP가 자동 생성한 그래프를 기반으로 추천했을 때, 성능 차이가 거의 나지 않음
- Step 15에서는 전문가가 구축한 그래프의 성능을 뛰어넘기도 함.
- 학습 경로 추천을 위한 선수 지식 관계 구축은 전문가의 시간과 비용을 요구하는데, 이 병목이 해결 가능함을 보여준 결과

### RQ4. TextGrad는 KnowLP를 얼마나 효율적으로 향상시키며, KnowLP는 추천된 학습 경로에 대해 합리적인 이유를 생성하는가?

![[knowlp-rq4-textgrad.png]]

- w/o TG -> with out TextGrad
- w TG -> with TextGrad
- LLM만 가지고 logical address와 virtual address를 설명할 때, 두 개념이 쉽게 혼동되기 때문에 혼란이 발생함.
  - LLM은 logical address가 virtual address와 동일하다고 잘못 설명함.
- TextGrad 방법을 사용하면, LLM이 두 개념을 효과적으로 구별 가능함.

![[knowlp-rq4-explanation.png]]

- EDU-GraphRAG를 통한 추천 경로 분석 및 설명
- 각 추천 학습 경로에 대해 EDU-GraphRAG는 해당 개념의 추천 이유를 설명할 수 있음.

### RQ5. 시뮬레이션 실험에서 KnowLP는 얼마나 효과적인가?

![[knowlp-rq5-simulation.png]]

- 시뮬레이션 실험이 필요한 이유
  - 실제 세계의 교육 데이터셋은 학생들의 과거 기록과 같은 정적인 정보만 담고 있음.
  - 추천 시스템이 새로운 문제 시퀀스를 추천했을 때, 학습자가 실시간으로 어떻게 반응하고 학습 능력이 어떻게 변화할 지 직접 검증 불가능
  - 실제 온라인 교육 플랫폼 환경과 유사한 조건에서 모델의 실용적인 효과를 검증하기 위해 시뮬레이션 실험 필요
- Knowledge Evolution-based Simulator (KES)를 사용하여 시뮬레이션 환경 구축
  - DKT 모델을 활용하여 가상 학생이 임의로 생성된 문제 시퀀스를 풀 때, 지식이 어떻게 학습되고 정오답 반응을 보이는 지 시뮬레이션
  - Junyi 데이터셋을 기반으로 KES-Junyi 시뮬레이터 구축
- 학습 경로 추천 모델(SRC, GEHRL, DLPR)과 KnowLP 성능 비교
  - KnowLP가 모든 step에서 다른 모델들보다 우수한 성능을 보임
  - 학습자의 실시간 반응이 변화하는 역동적인 환경 속에서도 KnowLP가 Strong Adaptability를 보임.
  - 실제 동적인 온라인 교육 시나리오에 적용하기 매우 적절한 모델임을 입증

### RQ6. KnowLP의 runtime은 얼마나 되는가?

![[knowlp-rq6-runtime.png]]

- Edu-GraphRAG 모듈이 각 데이터셋에 대해 10분 내외로 지식 그래프를 구축함
- DLRL, DLPR과 비교해서 확연히 빠른 속도를 보여줌

### RQ7. 하이퍼파라미터 $\tau$ 가 성능에 어떤 영향을 끼치는가?

![[knowlp-rq7-tau.png]]

- $\tau$ = 0.001에서 가장 높은 성능을 보임
- 모든 실험에서의 기준값으로 활용됨

## 1-6. 결론

- Dual KC structure, prerequisite relations, similarity relations를 고려하여 보다 효과적인 학습 경로를 추천하는 KnowLP 방법론 제안
- EDU-GraphRAG 모듈을 통해 기존 학습 경로 추천 방법의 적용성 향상
- DLRL 모듈을 통해 blocked learning 이슈 해결

## 참고

- 원문: [Cheng et al., 2026](https://arxiv.org/abs/2506.22303)
