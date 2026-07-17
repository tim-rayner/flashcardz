# Flashcardz

An offline-first flashcard app. Users create Topics (decks) of Cards, then play Games to study them and track progress over time.

## Language

**Reveal**:
The action that flips a Card from showing only the question to also showing the answer, prior to self-grading. Happens once per card per Game.
_Avoid_: Flip, show answer

**Game**:
A single timed play session through a selected set of Cards from one Topic, during which the user self-grades each Card and a Result is recorded for it. Persisted as a `sessions` row (started_at/completed_at) plus one `card_results` row per Card played.
_Avoid_: Session (reserve for the DB table name), Quiz, Round

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
The raw counts of each Result type (`correct`/`almost`/`incorrect`) produced by a completed Game, shown alongside the Answer Ratio. Not a single weighted number.
_Avoid_: Points, Answer Ratio

**Completed Game**:
A Game whose Session has a non-null `completed_at` — the user reached the end of the Card set. An **Abandoned Game** is a Session with `completed_at: null`; its Results are still kept and still count toward Card Status, but it is not counted as a Completed Game in stats.
_Avoid_: Finished, ended

**Resume**:
Continuing an Abandoned Game from its next ungraded Card, appending further Results to that same Session. Offered as a choice (alongside **Start over**) whenever a Topic has an Abandoned Game; Start over leaves the Abandoned Game and its Results untouched and begins a brand new Game against the full Card set.
_Avoid_: Restart (ambiguous with Start over), Continue
