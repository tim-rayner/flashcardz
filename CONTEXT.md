# Flashcardz

An on-device flashcard study app. Users organize cards into decks and study them in timed sessions, with per-answer results tracked for spaced-repetition-style feedback. Card content and study history are local-only by design; only account/subscription data (and, in future, purchased deck content) ever reaches the backend.

## Language

**Deck**:
A named collection of Cards, owned entirely on-device unless the user opts it into sync.
_Avoid_: Collection, set, folder

**Card**:
A single question/answer flashcard belonging to one Deck.

**Study Session**:
A single run through some or all of a Deck's Cards, bounded by a start time and (optionally) a completion time. A Deck may have several incomplete Study Sessions at once — starting a new one never merges into or deletes an older incomplete one, it's simply left behind as permanent partial history. Only the most recently started incomplete Study Session for a Deck is offered to the user as resumable.
_Avoid_: Quiz, round

**Card Result**:
The outcome of answering one Card, timestamped, recorded as part of a Study Session. A Card can be answered at most once within a given Study Session — there is no retry-within-session concept. Three outcomes are recorded — "correct", "incorrect", "almost" — but only two are scored: "almost" is a distinct self-reported outcome shown to the user, yet counts as a failure in any correct/incorrect statistic (accuracy %, streaks, etc). Nothing that aggregates results should treat "almost" as a third bucket.
_Avoid_: Answer, attempt, response

**Last Result**:
A Card's most recent Card Result. Derived on read from Card Result history — never stored as a column on Card, to avoid a write path that must keep a cached value in sync with the history it's cached from.

**Notes**:
Learner-authored free text attached to a Card. Surfaced only when the Card's answer is revealed — never shown during the question phase.

**Interview Mode**:
A global toggle affecting app behavior (behavior not yet defined). Not scoped to any Deck or Session.

**Setting**:
A single named piece of app-wide configuration (e.g. Interview Mode), persisted as a key/value pair independent of any Deck.
