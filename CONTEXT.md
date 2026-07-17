# Flashcardz

An offline-first flashcard app. Users create Topics of Cards, then play Games to study them and track progress over time.

## Language

**Topic**:
A named collection of Cards a user creates and studies together. Persisted as a `topics` row; Cards reference it via `topic_id`.
_Avoid_: Deck (never used in code — only ever `Topic`/`topics`)

**Card**:
A single question/answer/optional-notes unit belonging to one Topic. Persisted as a `cards` row (`question`, `answer`, `notes?`). The game engine works with a narrower `GameCard` shape (`id`, `question`, `answer`, `notes?`) that omits storage-only fields like `topicId`/`createdAt`.

**Reveal**:
The action that flips a Card from showing only the question to also showing the answer, prior to self-grading. Happens once per card per Game.
_Avoid_: Flip, show answer

**Game**:
A single play session through a selected set of Cards from one Topic, during which the user self-grades each Card and a Result is recorded for it. Persisted as a `sessions` row (started_at/completed_at) plus one `card_results` row per Card played. No timing/duration limit exists today — `started_at`/`completed_at` are recorded only to order Games and to distinguish Completed from Abandoned, not to clock the user.
_Avoid_: Session (reserve for the DB table name), Quiz, Round, "the book" (informal code-comment term for the full ordered card set a Game plays through — not a defined concept; refer to it plainly as the Game's card set)

**Result**:
The self-graded outcome of one Card within one Game: `correct`, `almost`, or `incorrect`. Recorded once per Card per Game as a `card_results` row.
_Avoid_: Score (Score is an aggregate over Results, not a single Result), Grade

**Card Status**:
The Result of a Card's most recently played Game, or `never` if it has no Results yet. Drives `CardStatusFilter`/`CardStatusBadge` on the Topic Detail screen. Not spaced-repetition state — no due dates or scheduling exist.
_Avoid_: Progress, mastery level

**Answer Ratio**:
`correct Results / total Cards played` in a Game. `almost` does not earn partial credit — only `correct` counts toward the numerator.
_Avoid_: Score (see Score), percentage, accuracy

**Score**:
The raw counts of each Result type (`correct`/`almost`/`incorrect`) produced by a Game, shown alongside the Answer Ratio in Game history — including for Abandoned Games. Not a single weighted number.
_Avoid_: Points, Answer Ratio

**Completed Game**:
A Game whose Session has a non-null `completed_at` — the user reached the end of the Card set. An **Abandoned Game** is a Session with `completed_at: null`; its Results are still kept and still count toward Card Status, but it is not counted as a Completed Game in stats.
_Avoid_: Finished, ended

**Resume**:
Continuing an Abandoned Game by appending further Results to that same Session, for whichever Cards in the Topic don't yet have a Result in it. Only the Topic's most recent Abandoned Game is ever offered — an older Abandoned Game left behind by a since-superseded Start over stays in the database (its Results still count toward Card Status, per ADR 0002) but can never be resumed again. Offered as a choice (alongside **Start over**) whenever a Topic has a resumable Abandoned Game; Start over leaves the Abandoned Game and its Results untouched and begins a brand new Game against the full Card set.
_Known gap_: Resume does not faithfully continue the original attempt — it always pulls from the full unfiltered Card set (ignoring whatever filter the abandoned Game was started under) and reshuffles into a new random order each time, rather than preserving the original set/order and simply picking up at the next ungraded Card.
_Avoid_: Restart (ambiguous with Start over), Continue
