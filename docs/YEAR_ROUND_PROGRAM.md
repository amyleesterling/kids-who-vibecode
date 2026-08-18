# Vibe Code Kids 2027 Year-Round Program

The authoritative draft objects are in `db/program2027.mjs`. They are seeded into additive private-operation tables as version 1 drafts. They are not inserted into the existing live `challenges` table, so this branch cannot change the 2026 public schedule.

“Private draft” here means unavailable from public application APIs. This repository is public; the copy is therefore visible in GitHub source. Source-level confidentiality is an open Human Steward decision.

## Operating cadence

- Primary opens Monday at 09:00 `America/New_York`.
- Submissions close the following Monday at 00:00.
- Voting opens that Monday at 09:00 and closes one week later at 09:00.
- UTC storage accounts for U.S. daylight saving time; it does not hard-code 13:00Z all year.
- Week 52 opens December 27, 2027; its voting period correctly closes January 10, 2028.
- A bonus never displaces a primary and has no voting, winner, streak, or completion pressure.

## Primary calendar

| Week | Opens | Arc | Challenge |
|---:|---|---|---|
| 01 | 2027-01-04 | Winter | Pocket-Sized Sunrise |
| 02 | 2027-01-11 | Winter | The Room Behind the Bookshelf |
| 03 | 2027-01-18 | Winter | Weather Orchestra |
| 04 | 2027-01-25 | Winter | Cozy Creature Habitat |
| 05 | 2027-02-01 | Winter | Tiny-Problem Helper |
| 06 | 2027-02-08 | Winter | Kindness Delivery Network |
| 07 | 2027-02-15 | Winter | Impossible Ice Physics |
| 08 | 2027-02-22 | Winter | Clockwork Tale |
| 09 | 2027-03-01 | Winter | Mood Lamp for a Moon |
| 10 | 2027-03-08 | Winter | Invisible-Ink Mystery |
| 11 | 2027-03-15 | Winter | Mini Celebration Generator |
| 12 | 2027-03-22 | Winter | Three Doors, Three Stories |
| 13 | 2027-03-29 | Winter | Museum of Impossible Light |
| 14 | 2027-04-05 | Spring | Seed-to-Sky Machine |
| 15 | 2027-04-12 | Spring | Field Guide to Peculiar Creatures |
| 16 | 2027-04-19 | Spring | Rain Collector Lab |
| 17 | 2027-04-26 | Spring | Pollinator Path Planner |
| 18 | 2027-05-03 | Spring | Mystery Egg Hatchery |
| 19 | 2027-05-10 | Spring | A Map for a Frog |
| 20 | 2027-05-17 | Spring | Pocket Ecosystem Balancer |
| 21 | 2027-05-24 | Spring | Shape-Shifter Workshop |
| 22 | 2027-05-31 | Spring | Birdsong Without Sound |
| 23 | 2027-06-07 | Spring | Bug Hotel Blueprint |
| 24 | 2027-06-14 | Spring | Plant Translator |
| 25 | 2027-06-21 | Spring | Data Garden |
| 26 | 2027-06-28 | Spring | Curious Systems Fair |
| 27 | 2027-07-05 | Summer | Campfire Story Mixer |
| 28 | 2027-07-12 | Summer | Ocean Current Navigator |
| 29 | 2027-07-19 | Summer | Postcard from a Tiny Planet |
| 30 | 2027-07-26 | Summer | One-Screen Theme Park |
| 31 | 2027-08-02 | Summer | Robot Learns the Obvious |
| 32 | 2027-08-09 | Summer | Ridiculous New Sport |
| 33 | 2027-08-16 | Summer | Mystery Island Map |
| 34 | 2027-08-23 | Summer | Kitchen-Sink Music Machine |
| 35 | 2027-08-30 | Summer | Two-Player Rescue, One Keyboard |
| 36 | 2027-09-06 | Summer | Space Snack Delivery |
| 37 | 2027-09-13 | Summer | Monster Parade Choreographer |
| 38 | 2027-09-20 | Summer | Tiny City, Big Consequences |
| 39 | 2027-09-27 | Summer | Grand Summer Remix |
| 40 | 2027-10-04 | Autumn | Impossible Backpack Tool |
| 41 | 2027-10-11 | Autumn | Library After Dark |
| 42 | 2027-10-18 | Autumn | Maze That Changes Its Mind |
| 43 | 2027-10-25 | Autumn | Harvest Chain Reaction |
| 44 | 2027-11-01 | Autumn | Spooky, Not Scary |
| 45 | 2027-11-08 | Autumn | Puzzle Box of Sounds and Shapes |
| 46 | 2027-11-15 | Autumn | The Delightfully Broken Machine |
| 47 | 2027-11-22 | Autumn | Gratitude Constellation |
| 48 | 2027-11-29 | Autumn | Paper-to-Pixel Contraption |
| 49 | 2027-12-06 | Autumn | Repair Shop for Imaginary Things |
| 50 | 2027-12-13 | Autumn | Signal Across the Night |
| 51 | 2027-12-20 | Autumn | Tiny Game as a Gift |
| 52 | 2027-12-27 | Autumn | Time Capsule for Future Coders |

## Optional bonus slate

| Date | Bonus | Neutral alternative | Required gate |
|---|---|---|---|
| Jan 1 | Tiny Restart Machine | First page of an imaginary story | Editorial |
| Feb 6 | Moon-Cycle Welcome Machine | Moon-cycle machine for an imaginary planet | Culture/inclusion + Amy |
| Mar 14 | Never-Ending Pattern Playground | Shape-shifting pattern lab | Curriculum/editorial |
| Mar 20, 20:25 UTC | Day-and-Night Balance Lab | Two-color balance toy | Science/date |
| Apr 21–22 | Joyful Planet Helper | Helpful machine for an imaginary habitat | Science/editorial |
| Jun 1–30 | Everybody Belongs Clubhouse | Welcome machine for any visitor | LGBTQ inclusion + Amy |
| Jun 19 | Community Freedom Exhibit | Community-history lantern for an invented place | Black-history/accuracy + Amy |
| Jun 21, 14:11 UTC | Sunlight Clock | Longest-light day on an imaginary planet | Science/date |
| Jul 30 | Different Strengths Puzzle | Helpful strangers solve a problem | Inclusion/editorial |
| Sep 23, 06:02 UTC | Season-Switch Machine | Transformation machine for an imaginary climate | Science/date |
| Oct 29, with Oct 28 regional caveat | Reviewed Stories of Light and Welcome | Night lights for an imaginary city | Culture/religion + Amy |
| Dec 22, 02:42 UTC | Longest-Night Glow Lab | Cozy glow machine | Science/date |

Reserve drafts—not combined into a December “cultural smoothie”—include Halloween, gratitude, Hanukkah, Christmas, and Kwanzaa. They require their own contextual review before a future rotation.

## State transition

`draft → curriculum reviewed → safety/accuracy reviewed → approved → scheduled → live → archived`

Agent review can advance evidence records, but only recorded human approval can schedule a version. For a latest primary whose dry-run content package has completed curriculum, safety/accuracy, and human approval, Challenge Studio exposes an explicit Human Steward scheduling action with conflict validation and typed confirmation. It copies that exact version into the existing `challenges` table as `upcoming`; the existing clock-driven scheduler later activates and closes it. Public APIs continue to hide upcoming title/copy. Bonus scheduling is deliberately unsupported until a separate inclusion-reviewed public surface exists.

Clubhouse Admin’s Year Calendar and Challenge Studio read the private sidecar. Saving structured copy or choosing “Copy version” creates a new draft version, preserves the prior record, resets curriculum/age-fit/accessibility/inclusion reviews to pending, and marks copied editorial/social packages for refresh. Editing alone never mutates the live schedule.

## Validation

`npm run validate:program` verifies count, four 13-week arcs, unique IDs/titles/prompts, every required field and content package, Spark/Build/Glow-Up, dry-run status, bonus gates, date ordering, DST-aware Monday cadence, and the 2028 rollover.
