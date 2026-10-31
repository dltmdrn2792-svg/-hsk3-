import { useState } from 'react'
import { HSK3_WORDS } from './data/hsk3Words'

const TEASES = [
  '이것도 틀리다니... 혹시 바보?! 🤪',
  'HSK 3급 맞나요? 뇌가 잠시 멈췄나 봐요! ⚡',
  '땡! 찍은 거 다 티 납니다! 👀',
  '앗... 이걸 틀리네? 다시 집중하세요! 🔥',
  '방금 멍 때리고 누르셨죠? 🤪',
]

function shuffle(items) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function pickTease() {
  return TEASES[Math.floor(Math.random() * TEASES.length)]
}

function buildQuestions(answers, bank = HSK3_WORDS) {
  return shuffle(answers).map((answer) => {
    const distractors = shuffle(
      bank.filter((word) => word.id !== answer.id),
    ).slice(0, 3)

    return {
      answer,
      options: shuffle([answer, ...distractors]),
    }
  })
}

function StartScreen({ total, onStart }) {
  return (
    <main className="w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
      <p className="mb-2 text-xs font-semibold tracking-[0.22em] text-rose-300 sm:text-sm">
        HSK 3급
      </p>
      <h1 className="mb-3 font-serif text-3xl text-stone-50 sm:text-4xl">
        필수단어 퀴즈
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-stone-400 sm:text-base">
        한국어 뜻을 보고 알맞은 중국어를 고르세요.
        <br />
        {total}문제 · 4지선다
      </p>
      <button
        type="button"
        className="min-h-12 w-full rounded-2xl bg-rose-500 px-5 py-3 text-base font-semibold text-white transition hover:bg-rose-400 active:scale-[0.99]"
        onClick={onStart}
      >
        시작하기
      </button>
    </main>
  )
}

function ResultScreen({
  score,
  total,
  missed,
  onRetryAll,
  onRetryMissed,
  onHome,
}) {
  const percent = total === 0 ? 0 : Math.round((score / total) * 100)
  const hasMissed = missed.length > 0

  return (
    <main className="w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
      <p className="mb-2 text-sm font-medium tracking-wide text-rose-300">결과</p>
      <h1 className="mb-1 font-serif text-4xl text-stone-50">
        {score} / {total}
      </h1>
      <p className="mb-3 text-amber-200">{percent}점</p>
      <p className="mb-6 text-sm text-stone-400 sm:text-base">
        {hasMissed
          ? `틀린 문제 ${missed.length}개를 오답 노트로 모아 두었어요.`
          : '전부 맞혔어요. 오답 노트가 비었습니다.'}
      </p>

      {hasMissed && (
        <ul className="mb-6 flex flex-wrap justify-center gap-2">
          {missed.map((word) => (
            <li
              key={word.id}
              className="rounded-full border border-rose-400/30 bg-rose-950/50 px-3 py-1 text-sm text-rose-100"
            >
              {word.hanzi}
              <span className="ml-1 text-rose-300/80">{word.meaning}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3">
        {hasMissed && (
          <button
            type="button"
            className="min-h-12 w-full rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-400"
            onClick={onRetryMissed}
          >
            오답 다시 풀기 ({missed.length}문제)
          </button>
        )}
        <button
          type="button"
          className="min-h-12 w-full rounded-2xl border border-stone-700 px-5 py-3 font-semibold text-stone-100 transition hover:bg-stone-800"
          onClick={onRetryAll}
        >
          전체 다시 풀기
        </button>
        <button
          type="button"
          className="min-h-12 w-full rounded-2xl px-5 py-3 font-medium text-stone-400 transition hover:text-stone-200"
          onClick={onHome}
        >
          처음으로
        </button>
      </div>
    </main>
  )
}

function App() {
  const [screen, setScreen] = useState('start')
  const [mode, setMode] = useState('all')
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState([])
  const [tease, setTease] = useState('')

  const current = questions[index]
  const answered = selectedId !== null
  const selectedWord = current?.options.find((word) => word.id === selectedId)
  const isCorrect = selectedId === current?.answer.id

  function startRound(answers, nextMode) {
    setQuestions(buildQuestions(answers))
    setMode(nextMode)
    setIndex(0)
    setSelectedId(null)
    setScore(0)
    setMissed([])
    setTease('')
    setScreen('quiz')
  }

  function startAll() {
    startRound(HSK3_WORDS, 'all')
  }

  function startMissed() {
    startRound(missed, 'review')
  }

  function choose(word) {
    if (answered) return

    setSelectedId(word.id)

    if (word.id === current.answer.id) {
      setScore((value) => value + 1)
      setTease('')
      return
    }

    setMissed((prev) =>
      prev.some((item) => item.id === current.answer.id)
        ? prev
        : [...prev, current.answer],
    )
    setTease(pickTease())
  }

  function goNext() {
    if (index + 1 >= questions.length) {
      setScreen('result')
      return
    }

    setIndex((value) => value + 1)
    setSelectedId(null)
    setTease('')
  }

  return (
    <div className="min-h-svh bg-stone-950 px-4 py-6 text-stone-100 sm:py-10">
      <div
        className={`mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-lg sm:max-w-xl ${
          screen === 'quiz' ? 'items-start' : 'items-center'
        }`}
      >
        {screen === 'start' && (
          <StartScreen total={HSK3_WORDS.length} onStart={startAll} />
        )}

        {screen === 'result' && (
          <ResultScreen
            score={score}
            total={questions.length}
            missed={missed}
            onRetryAll={startAll}
            onRetryMissed={startMissed}
            onHome={() => setScreen('start')}
          />
        )}

        {screen === 'quiz' && current && (
          <main className="w-full pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-rose-300 sm:text-sm">
                  {mode === 'review' ? '오답 노트' : 'HSK 3급 필수단어'}
                </p>
                <p className="text-sm text-stone-400">
                  문제 {index + 1}/{questions.length}
                </p>
              </div>
              <p className="text-xs text-stone-500 sm:text-sm">맞힌 문제 {score}</p>
            </div>

            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-stone-800">
              <div
                className="h-full rounded-full bg-rose-400 transition-all"
                style={{
                  width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%`,
                }}
              />
            </div>

            <section className="rounded-3xl border border-stone-800 bg-stone-900/90 p-4 shadow-2xl shadow-black/40 sm:p-6">
              <p className="mb-2 text-sm text-stone-400">이 뜻에 맞는 중국어는?</p>
              <h2 className="mb-6 break-keep text-center font-serif text-3xl leading-tight text-stone-50 sm:text-5xl">
                {current.answer.meaning}
              </h2>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {current.options.map((word) => {
                  const isSelected = word.id === selectedId
                  const isAnswer = word.id === current.answer.id
                  let style =
                    'border-stone-700 bg-stone-800/80 hover:border-rose-400/70 active:scale-[0.99]'

                  if (answered && isAnswer) {
                    style =
                      'border-emerald-400 bg-emerald-500/20 text-emerald-50 ring-2 ring-emerald-400/40'
                  } else if (answered && isSelected && !isAnswer) {
                    style =
                      'border-rose-400 bg-rose-500/20 text-rose-50 ring-2 ring-rose-400/40'
                  } else if (answered) {
                    style = 'border-stone-800 bg-stone-900/50 text-stone-500'
                  }

                  return (
                    <button
                      key={word.id}
                      type="button"
                      disabled={answered}
                      onClick={() => choose(word)}
                      className={`min-h-16 rounded-2xl border px-3 py-3 text-center transition sm:min-h-20 sm:px-4 ${style} disabled:cursor-default`}
                    >
                      <span className="block font-serif text-2xl sm:text-3xl">
                        {word.hanzi}
                      </span>
                      {answered && (
                        <span className="mt-1 block text-xs sm:text-sm">
                          {word.pinyin}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {answered && selectedWord && (
                <div className="mt-5 space-y-3">
                  <p
                    className={`text-center text-base font-semibold sm:text-lg ${
                      isCorrect ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {isCorrect ? '정답입니다!' : '오답입니다'}
                  </p>

                  <article
                    className={`rounded-2xl border p-4 ${
                      isCorrect
                        ? 'border-emerald-400/30 bg-emerald-950/40'
                        : 'border-rose-400/30 bg-rose-950/40'
                    }`}
                  >
                    {!isCorrect && tease && (
                      <p className="mb-3 text-sm font-medium leading-relaxed text-rose-200 sm:text-base">
                        {tease}
                      </p>
                    )}
                    <p className="text-xs tracking-wide text-stone-400">
                      선택한 단어
                    </p>
                    <p className="mt-1 font-serif text-3xl text-stone-50">
                      {selectedWord.hanzi}
                    </p>
                    <p className="mt-1 text-lg text-amber-200">
                      {selectedWord.pinyin}
                    </p>
                    <p className="mt-1 font-medium text-stone-100">
                      {selectedWord.meaning}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-stone-400">
                      {selectedWord.explanation}
                    </p>
                    {!isCorrect && (
                      <p className="mt-3 rounded-xl bg-emerald-950/70 px-3 py-2 text-sm text-emerald-200">
                        정답: {current.answer.hanzi} ({current.answer.pinyin}) ·{' '}
                        {current.answer.meaning}
                      </p>
                    )}
                  </article>

                  <button
                    type="button"
                    className="min-h-12 w-full rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-400"
                    onClick={goNext}
                  >
                    {index + 1 >= questions.length ? '결과 보기' : '다음 문제'}
                  </button>
                </div>
              )}
            </section>
          </main>
        )}
      </div>
    </div>
  )
}

export default App
