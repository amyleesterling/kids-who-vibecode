export const PROGRAM_2027_ID = 'vibe-code-kids-2027'
export const PROGRAM_2027_POLICY_VERSION = 'curriculum-2027.1'

export const seasonalArcs2027 = [
  { id: 'winter', title: 'Glow, Cozy Worlds, and New Beginnings', weeks: [1, 13] },
  { id: 'spring', title: 'Growth, Creatures, and Curious Systems', weeks: [14, 26] },
  { id: 'summer', title: 'Adventure, Games, and Big Imagination', weeks: [27, 39] },
  { id: 'autumn', title: 'Stories, Puzzles, Magic, and Making Things Work', weeks: [40, 52] },
]

const weekSpecs = [
  ['Pocket-Sized Sunrise', 'Make a tiny sunrise you can control.', 'light-and-shadow art', 'a button, tap, or key slowly wakes a dark world', 'Layer shapes and change brightness or color over time.', 'Add shadows that move differently for three imaginary suns.', ['color', 'animation', 'visual storytelling'], ['events', 'variables', 'timing']],
  ['The Room Behind the Bookshelf', 'Invent a secret indoor world with one surprising rule.', 'explorable story', 'one object reveals a hidden room and its peculiar rule', 'Build a room with three clickable clues that reveal how the world works.', 'Let the clues change the ending without scoring the visitor.', ['world-building', 'writing', 'interface design'], ['events', 'state', 'branching']],
  ['Weather Orchestra', 'Turn pretend weather into a playful visual orchestra.', 'sound-optional music toy', 'one weather control changes a visible rhythm', 'Conduct rain, wind, clouds, and sunshine with shapes; sound stays optional.', 'Create a quiet visual mode and let two weather patterns harmonize.', ['music', 'patterns', 'animation'], ['loops', 'mapping', 'conditionals']],
  ['Cozy Creature Habitat', 'Build a snug habitat for a creature nobody has discovered yet.', 'habitat simulation', 'one habitat control makes the creature more comfortable', 'Give the creature three needs and clear visual clues about each one.', 'Add a surprising adaptation that helps in two different conditions.', ['creature design', 'systems thinking', 'empathy'], ['variables', 'conditionals', 'feedback']],
  ['Tiny-Problem Helper', 'Invent a machine that solves a wonderfully tiny problem.', 'useful tool', 'one control solves one tiny imaginary annoyance', 'Show the problem, the machine steps, and a funny success moment.', 'Add a safe failure mode that helps the visitor try another idea.', ['invention', 'sequencing', 'humor'], ['functions', 'events', 'debugging']],
  ['Kindness Delivery Network', 'Route cheerful messages between imaginary creatures.', 'routing puzzle', 'deliver one prewritten kind message along one path', 'Create three destinations and let the visitor choose a safe route.', 'Add obstacles that are solved by cooperation, never speed or popularity.', ['kindness', 'maps', 'problem solving'], ['sequences', 'conditionals', 'coordinates']],
  ['Impossible Ice Physics', 'Make ice behave in a surprising but consistent way.', 'physics toy', 'slide one shape with one made-up ice rule', 'Design three surfaces with different movement rules and visible cues.', 'Let the visitor discover a secret rule by experimenting.', ['motion', 'experimentation', 'rule-making'], ['velocity', 'collision', 'state']],
  ['Clockwork Tale', 'Tell a story that changes when an imaginary clock turns.', 'time-based story', 'move one clock hand to reveal one scene change', 'Create morning, middle, and night scenes linked by the clock.', 'Add a loop in time with one detail that changes each trip.', ['storytelling', 'time', 'illustration'], ['variables', 'mapping', 'branching']],
  ['Mood Lamp for a Moon', 'Design a lamp that helps an imaginary moon show its weather.', 'interactive light sculpture', 'choose one color and one animation for a moon mood', 'Build controls for color, pattern, and speed with text labels.', 'Make a color-independent pattern mode for visitors who see color differently.', ['digital art', 'accessibility', 'interface design'], ['inputs', 'parameters', 'animation']],
  ['Invisible-Ink Mystery', 'Hide a friendly mystery in plain sight.', 'reveal puzzle', 'one safe action reveals one hidden clue', 'Plant three clues using contrast, movement, or pattern—not tiny text alone.', 'Create two clue orders that reach the same satisfying answer.', ['mystery writing', 'visual design', 'puzzles'], ['events', 'visibility', 'branching']],
  ['Mini Celebration Generator', 'Make a celebration for an absurd imaginary achievement.', 'generative nonsense', 'combine one achievement with one tiny celebration', 'Mix safe word lists, colors, and movements into silly results.', 'Prevent awkward combinations with a rule you invent.', ['comedy', 'wordplay', 'randomness'], ['arrays', 'random choice', 'validation']],
  ['Three Doors, Three Stories', 'Create a branching tale where every choice is interesting.', 'branching narrative', 'one choice opens one complete mini-scene', 'Build three choices and at least two different endings with no wrong answer.', 'Let one early detail reappear in every ending in a new way.', ['writing', 'choice design', 'character'], ['branching', 'state', 'reusable scenes']],
  ['Museum of Impossible Light', 'Curate light effects that could not exist in real life.', 'interactive gallery', 'display one impossible light artwork with a label', 'Create three exhibits that respond in different ways.', 'Add an accessible guided tour using text and keyboard controls.', ['curation', 'art', 'explanation'], ['components', 'events', 'transitions']],

  ['Seed-to-Sky Machine', 'Grow an impossible plant from seed to surprise.', 'growth animation', 'trigger one clear stage of growth', 'Show at least four stages and let the visitor control the pace.', 'Add one environmental variable that changes the plant without harming it.', ['plant design', 'sequence', 'observation'], ['state machine', 'timing', 'variables']],
  ['Field Guide to Peculiar Creatures', 'Make an interactive guide to creatures with odd adaptations.', 'catalog tool', 'make one creature card with one discoverable fact', 'Create three sortable creature cards using invented, nonpersonal data.', 'Add a comparison view that never ranks creatures as best.', ['classification', 'illustration', 'science imagination'], ['objects', 'filtering', 'events']],
  ['Rain Collector Lab', 'Simulate where raindrops travel after they land.', 'water-path simulation', 'guide one drop through one path', 'Create surfaces that soak, bounce, or channel drops with clear labels.', 'Let visitors redesign the path and compare outcomes without real location data.', ['weather', 'systems', 'design'], ['loops', 'collision', 'counters']],
  ['Pollinator Path Planner', 'Help an imaginary pollinator visit a varied garden.', 'route planner', 'move one pollinator between two flowers', 'Build a route with different flower shapes and rest spots.', 'Add a fairness rule so no flower type is always ignored.', ['ecology', 'maps', 'care'], ['coordinates', 'pathfinding', 'conditionals']],
  ['Mystery Egg Hatchery', 'Design an egg that hatches through clues, not tapping speed.', 'anticipation story', 'reveal one hatch clue with one interaction', 'Create three clue stages and an original creature reveal.', 'Let different clue choices produce different harmless adaptations.', ['character design', 'suspense', 'animation'], ['state', 'events', 'branching']],
  ['A Map for a Frog', 'Draw a frog-scale map of a wonderfully strange place.', 'perspective map', 'make one landmark react from a frog-sized viewpoint', 'Connect three landmarks with safe, readable routes.', 'Add a weather layer that changes paths without using real maps.', ['mapping', 'perspective', 'world-building'], ['coordinates', 'layers', 'conditionals']],
  ['Pocket Ecosystem Balancer', 'Make a tiny pretend ecosystem where everything has a job.', 'systems simulation', 'change one variable and show one visible effect', 'Connect three invented species with simple, nonviolent relationships.', 'Add a recovery behavior so the system can wobble without doom.', ['systems thinking', 'ecology', 'feedback'], ['variables', 'loops', 'cause and effect']],
  ['Shape-Shifter Workshop', 'Transform one thing into another through a surprising sequence.', 'transformation art', 'animate one clear before-and-after change', 'Create three transformation steps the visitor can scrub through.', 'Make the same transformation work with keyboard, touch, and reduced motion.', ['animation', 'morphing', 'story'], ['interpolation', 'functions', 'input events']],
  ['Birdsong Without Sound', 'Show the shape and rhythm of an invented birdsong.', 'visual rhythm maker', 'animate one repeating visual call', 'Give three imaginary birds distinct visible rhythms and text descriptions.', 'Let two calls answer each other without requiring audio.', ['pattern', 'nature imagination', 'accessible music'], ['loops', 'timing', 'sequences']],
  ['Bug Hotel Blueprint', 'Design a safe hotel for entirely imaginary tiny guests.', 'planning interface', 'place one room with one guest need', 'Create rooms for three invented guests and explain each design choice.', 'Add a check that spots conflicting needs without declaring a winner.', ['architecture', 'creature design', 'explanation'], ['drag and drop', 'validation', 'data objects']],
  ['Plant Translator', 'Translate pretend plant signals into friendly messages.', 'signal decoder', 'turn one visual signal into one prewritten message', 'Design three signals and let visitors test the decoder.', 'Add an uncertainty state that says when the machine does not know.', ['communication', 'interface', 'science imagination'], ['lookup tables', 'conditionals', 'input mapping']],
  ['Data Garden', 'Grow a garden from a tiny made-up dataset.', 'data art', 'map three provided numbers to three visible plant traits', 'Use a small fictional dataset to create a labeled garden.', 'Offer two different visual mappings and explain the choice.', ['data literacy', 'art', 'explanation'], ['arrays', 'scales', 'iteration']],
  ['Curious Systems Fair', 'Build a booth that demonstrates one surprising system.', 'interactive exhibit', 'show one input and one clear output', 'Teach a visitor how three parts work together through play.', 'Add a reset, a help mode, and one funny edge case.', ['teaching', 'systems', 'exhibit design'], ['functions', 'state', 'debugging']],

  ['Campfire Story Mixer', 'Mix a campfire tale without using anyone’s real memories.', 'story generator', 'combine one setting, visitor, and twist', 'Build a three-part story mixer from safe invented word lists.', 'Add a continuity checker so the ending remembers an early detail.', ['storytelling', 'comedy', 'atmosphere'], ['arrays', 'randomness', 'state']],
  ['Ocean Current Navigator', 'Guide a tiny vessel using currents instead of speed.', 'navigation simulation', 'steer through one visible current', 'Create three current zones and a destination with no real coordinates.', 'Let visitors place currents and test one another’s routes locally.', ['ocean science', 'planning', 'motion'], ['vectors', 'collision', 'variables']],
  ['Postcard from a Tiny Planet', 'Make an interactive postcard from an invented world.', 'interactive postcard', 'reveal one animated detail on a postcard', 'Design a front, a nonpersonal message, and three interactive details.', 'Add a translation into shapes or icons, not a real language imitation.', ['world-building', 'writing', 'illustration'], ['layers', 'events', 'animation']],
  ['One-Screen Theme Park', 'Invent a tiny amusement park with one unforgettable attraction.', 'park simulation', 'make one attraction start, stop, and reset', 'Add a map, two supporting attractions, and readable controls.', 'Build a calm mode with slower motion and no flashing.', ['game design', 'architecture', 'animation'], ['state machines', 'timers', 'input']],
  ['Robot Learns the Obvious', 'Teach a robot a task humans find hilariously simple.', 'instruction puzzle', 'give a robot three exact steps', 'Create a task where vague instructions cause funny, harmless mistakes.', 'Add a debugger that highlights the first unclear instruction.', ['logic', 'humor', 'instruction writing'], ['sequences', 'conditionals', 'debugging']],
  ['Ridiculous New Sport', 'Invent a sport where creativity matters more than points.', 'movement game', 'make one move trigger a playful response', 'Define three actions, a noncompetitive goal, and an accessible alternative.', 'Let visitors remix the rules and explain what changed.', ['movement', 'rule design', 'inclusion'], ['events', 'collision', 'rule variables']],
  ['Mystery Island Map', 'Map an island mystery without real places or personal clues.', 'map mystery', 'make one landmark reveal one clue', 'Connect three clues through an explorable illustrated map.', 'Add a clue journal that stores only game state in the page.', ['mystery', 'maps', 'visual storytelling'], ['coordinates', 'state', 'branching']],
  ['Kitchen-Sink Music Machine', 'Make music from the silliest safe objects you can imagine.', 'music toy', 'show one object making one visible beat; sound is optional', 'Sequence three object rhythms with mute and visual modes.', 'Add a pattern editor that works without precise dragging.', ['music', 'comedy', 'interaction'], ['loops', 'sequencing', 'controls']],
  ['Two-Player Rescue, One Keyboard', 'Design a cooperative game with no chat and no accounts.', 'local cooperative game', 'give two local players one shared action', 'Build a small task where two different controls must cooperate.', 'Add a one-player accessibility mode with the same story.', ['cooperation', 'game design', 'accessibility'], ['multiple inputs', 'shared state', 'collision']],
  ['Space Snack Delivery', 'Deliver bizarre snacks through a very inconvenient galaxy.', 'route game', 'move one snack to one destination', 'Create three delivery constraints and a funny, forgiving retry.', 'Add a route-planning view before movement begins.', ['comedy', 'space', 'planning'], ['coordinates', 'conditionals', 'state']],
  ['Monster Parade Choreographer', 'Choreograph friendly monsters with wildly different moves.', 'animation sequencer', 'animate one monster with two moves', 'Sequence three monsters and label controls clearly.', 'Create a reduced-motion parade using color, pose, and position changes.', ['character art', 'dance', 'timing'], ['arrays', 'timelines', 'functions']],
  ['Tiny City, Big Consequences', 'Simulate a tiny imaginary city where one change ripples outward.', 'city simulation', 'change one city setting and show two effects', 'Connect homes, parks, and transport with simple visible feedback.', 'Add a citizen-needs view using invented aggregate counts only.', ['systems', 'urban imagination', 'data'], ['variables', 'graphs', 'feedback']],
  ['Grand Summer Remix', 'Combine two ideas from this summer into one surprising creation.', 'creative remix', 'join two mechanics in one tiny scene', 'Choose two different formats and make their rules work together.', 'Add a remix note crediting ideas, never copying a child submission.', ['synthesis', 'iteration', 'explanation'], ['composition', 'refactoring', 'events']],

  ['Impossible Backpack Tool', 'Invent a back-to-learning tool for an imaginary problem.', 'invention prototype', 'make one tool control do one useful thing', 'Show the problem, prototype, and a safe test.', 'Add settings for two different ways of using the tool.', ['invention', 'learning', 'interface'], ['events', 'state', 'testing']],
  ['Library After Dark', 'Tell what imaginary books do when the library closes.', 'animated story world', 'animate one book doing one unexpected thing', 'Create three book characters whose actions connect.', 'Let the visitor arrange the scene and trigger a new ending.', ['storytelling', 'character', 'animation'], ['objects', 'events', 'branching']],
  ['Maze That Changes Its Mind', 'Build a maze that changes fairly while you explore.', 'adaptive maze', 'make one path switch with a clear warning', 'Create three maze states and always leave a visible route.', 'Add an assist control that reveals the next safe choice.', ['puzzle design', 'fairness', 'maps'], ['grids', 'state', 'path rules']],
  ['Harvest Chain Reaction', 'Set off a cheerful chain reaction with imaginary ingredients.', 'cause-and-effect toy', 'connect two objects in one visible reaction', 'Build a five-step chain with reset and replay controls.', 'Allow visitors to reorder steps and predict what happens.', ['sequencing', 'animation', 'prediction'], ['events', 'timers', 'dependency graphs']],
  ['Spooky, Not Scary', 'Make a world that is mysterious, funny, and safe to explore.', 'atmosphere builder', 'reveal one silly surprise with a clear exit', 'Use lighting, movement, and words to create gentle suspense.', 'Add a comfort control that brightens, slows, or previews surprises.', ['atmosphere', 'humor', 'accessibility'], ['transitions', 'state', 'preferences']],
  ['Puzzle Box of Sounds and Shapes', 'Unlock a puzzle box using patterns; sound stays optional.', 'pattern puzzle', 'solve one two-step visual pattern', 'Create three clues using shape, position, and optional sound.', 'Generate new solvable patterns and include a hint path.', ['puzzles', 'pattern', 'accessible design'], ['sequences', 'validation', 'randomness']],
  ['The Delightfully Broken Machine', 'Build a machine with bugs that teach visitors how to fix it.', 'debugging game', 'find and repair one clearly labeled bug', 'Create three harmless faults and clues that explain their cause.', 'Add a diagnostic mode that shows state changing step by step.', ['debugging', 'systems', 'humor'], ['tests', 'conditionals', 'state tracing']],
  ['Gratitude Constellation', 'Connect invented moments of appreciation without sharing private stories.', 'reflective data art', 'connect three prewritten appreciation stars', 'Create a constellation from fictional helpers, places, or small acts.', 'Let visitors add private-on-device words with a clear do-not-submit warning.', ['reflection', 'art', 'kindness'], ['nodes', 'lines', 'local state']],
  ['Paper-to-Pixel Contraption', 'Turn a paper doodle idea into a clickable invention—without uploading it.', 'prototype bridge', 'recreate one paper shape with one digital action', 'Plan on paper, then build three digital controls from simple shapes.', 'Compare the prototype and final design using written observations only.', ['prototyping', 'drawing', 'iteration'], ['components', 'events', 'refactoring']],
  ['Repair Shop for Imaginary Things', 'Repair objects that could not possibly exist.', 'diagnostic story', 'choose one repair for one silly fault', 'Create three objects, clues, and multiple kind repair options.', 'Add a repair log containing only invented object data.', ['problem solving', 'story', 'care'], ['decision trees', 'objects', 'validation']],
  ['Signal Across the Night', 'Send a message with patterns of light, shape, or motion.', 'encoding toy', 'encode one short provided word as a pattern', 'Create an encoder and decoder using a tiny invented alphabet.', 'Detect ambiguous patterns and ask for a clearer signal.', ['communication', 'patterns', 'logic'], ['encoding', 'arrays', 'validation']],
  ['Tiny Game as a Gift', 'Make a small playable gift for an imaginary character.', 'microgame', 'create one joyful interaction with a beginning and end', 'Build a short game around the character’s invented likes.', 'Add a creator note about one choice, without names or private details.', ['game design', 'empathy', 'polish'], ['state', 'events', 'reset']],
  ['Time Capsule for Future Coders', 'Leave an interactive note for an imaginary coder in the future.', 'future-facing story', 'make one object reveal one hopeful idea', 'Create three artifacts showing what you learned, wondered, and might invent.', 'Add a remixable challenge for the future visitor—no personal predictions.', ['reflection', 'world-building', 'curation'], ['components', 'events', 'versioning']],
]

const preferredTools = ['Scratch (may stay unshared)', 'HTML/CSS/JavaScript', 'p5.js editor with grown-up supervision']
const freeAlternatives = ['Scratch offline editor', 'paper storyboard plus a local browser file', 'Twine or a simple slide prototype']

function easternOffset(date, hour) {
  const day = date.toISOString().slice(0, 10)
  if (day > '2027-03-14' && day < '2027-11-07') return -4
  if (day === '2027-03-14' && hour >= 3) return -4
  if (day === '2027-11-07' && hour < 2) return -4
  return -5
}

function easternIso(date, hour) {
  const offset = easternOffset(date, hour)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour - offset)).toISOString()
}

function plusDays(date, days) {
  const copy = new Date(date)
  copy.setUTCDate(copy.getUTCDate() + days)
  return copy
}

function packageFor(challenge) {
  const short = challenge.prompt
  return {
    websiteCopy: challenge.fullBrief,
    parentNewsletter: {
      subject: 'This week: ' + challenge.title,
      preview: short,
      body: 'This week, young makers can ' + short.charAt(0).toLowerCase() + short.slice(1) + ' Spark takes about 15–30 minutes; Build is the main adventure; Glow-Up is always optional. A grown-up should preview tools and links before anything is shared.',
    },
    educatorLibraryVersion: 'Invite makers to try ' + challenge.title + ' in pairs or solo. Start with the no/low-code route, celebrate different solutions, and keep every project private until the grown-up safety check is complete.',
    launchPost: 'Grown-ups and educators: this week’s Vibe Code Kids prompt is ' + challenge.title + '. ' + short + ' Free routes, three build paths, and parent guidance are included.',
    midweekPost: 'A midweek nudge for grown-ups: ask the maker what rule they chose for ' + challenge.title + '. Original decisions matter more than extra features.',
    submissionReminder: 'Grown-ups: if a child wants to share their ' + challenge.title + ' project, preview every screen and link together first. Skipping submission is always okay.',
    votingPost: 'The grown-up-reviewed gallery for ' + challenge.title + ' is ready to explore. Voting is optional; curiosity and kind noticing come first.',
    galleryPost: 'Approved ' + challenge.title + ' creations are appearing in the gallery. Only kid-safe public fields are included.',
    favoritesPost: 'This week’s community favorites show many ways to answer one prompt. There is no single best way to build ' + challenge.title + '.',
    parentTip: challenge.parentNote,
    shortVariant: challenge.title + ': ' + short,
    longVariant: 'For parents, guardians, educators, librarians, camps, and after-school programs: ' + challenge.fullBrief + ' Participation and sharing are optional.',
    altText: 'Playful illustrated scene for ' + challenge.title + ', showing imaginary objects and code-like shapes with no people or identifying details.',
    campaignLink: '/?challenge=' + challenge.id + '&utm_source={{adult_channel}}&utm_medium=organic&utm_campaign=2027_weekly_challenge',
    publicationMode: 'dry_run',
  }
}

function buildChallenge(spec, index) {
  const [title, prompt, format, sparkAction, buildAction, glowAction, creativeSkills, codingConcepts] = spec
  const weekNumber = index + 1
  const arc = seasonalArcs2027.find((item) => weekNumber >= item.weeks[0] && weekNumber <= item.weeks[1])
  const opens = plusDays(new Date('2027-01-04T00:00:00.000Z'), index * 7)
  const closes = plusDays(opens, 7)
  const votingCloses = plusDays(opens, 14)
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const id = '2027-w' + String(weekNumber).padStart(2, '0') + '-' + slug
  const challenge = {
    id,
    year: 2027,
    weekNumber,
    kind: 'primary',
    seasonalArc: arc.id,
    seasonalArcTitle: arc.title,
    title,
    eyebrow: format + ' · week ' + String(weekNumber).padStart(2, '0'),
    prompt,
    fullBrief: prompt + ' Build a small, complete version first, then decide what deserves more detail. Your rules, characters, art, words, and surprising choices should lead the project; code is the material, not the boss.',
    openingDate: easternIso(opens, 9),
    submissionCloseDate: easternIso(closes, 0),
    votingOpenDate: easternIso(closes, 9),
    votingCloseDate: easternIso(votingCloses, 9),
    editorialTimezone: 'America/New_York',
    ageBand: '8–10',
    estimatedTime: { spark: '15–30 minutes', build: '45–120 minutes', glowUp: 'optional extra session' },
    creativeSkills,
    codingConcepts,
    pathways: {
      spark: { name: 'Spark', brief: sparkAction + '. Stop when that one interaction feels satisfying.' },
      build: { name: 'Build', brief: buildAction },
      glowUp: { name: 'Glow-Up', brief: glowAction + ' This is a stretch quest, never required.' },
    },
    starterIdeas: [sparkAction, buildAction, 'Swap the setting, characters, colors, or rules until the idea feels unmistakably yours.'],
    recommendedTools: preferredTools,
    freeToolAlternatives: freeAlternatives,
    noOrLowCodeRoute: 'Storyboard the states on paper, then connect them with Scratch blocks, Twine passages, or clickable slides. A polished drawing with one working choice counts.',
    parentNote: 'Let the child choose the idea and make the creative calls. Help with accounts, reading, typing, and debugging only as needed; preview external tools and keep real names, faces, schools, locations, and contact details out of the project.',
    safetyNotes: ['Use invented people, places, and data.', 'No camera, microphone, geolocation, chat, payments, ads, logins, downloads, or uncontrolled external links.', 'A grown-up previews every screen, link, image, and visible word before submission.'],
    accessibilityNotes: ['Use labels as well as color.', 'Offer keyboard or tap controls where possible.', 'Avoid flashing and include a reduced-motion or pause option for busy animation.', 'Make sound optional and communicate the same idea visually.'],
    aiAssistanceGuidance: {
      principle: 'The child chooses the concept, rules, words, art, and final changes. AI may explain or help debug, but it is not the creator.',
      parentSupervisedPrompt: 'Grown-up supervising: My 8–10-year-old chose the idea “' + title + '.” Ask one short question at a time, starting with what they want the visitor to do. Help us make the smallest version in the tool the child names. Explain each code change in plain language and ask before adding it. Do not invent the story, art, characters, or rules for them. Do not ask for or include names, faces, voices, schools, locations, contact details, accounts, tracking, payments, downloads, or external data.',
    },
    makeItYoursQuestion: 'Which rule, detail, or surprise would make someone say, “Only you would have thought of that”?',
    projectExamples: ['A one-screen version with one delightful response', 'A short interactive story with two meaningful choices', 'A visual simulation with a reset and a clear explanation'],
    submissionRequirements: ['One complete, testable interaction', 'A short description of one creative decision', 'Only grown-up-reviewed HTTPS project links', 'No personal information or required accounts for visitors'],
    prePublishSafetyCheck: 'With a grown-up, test from the beginning in a private window. Check visible words and images, every control and link, permissions, network surprises, and the mobile-sized layout. Remove identifying details; do not submit if anything is uncertain.',
    reflectionQuestion: 'What creative decision changed most while you built, and why did you keep the version you chose?',
    reviewRiskFlags: ['external_project_url', 'visible_text', 'interactive_state_coverage', 'source_or_deployment_may_change'],
    visualBrief: 'A warm, screen-print-style illustration of ' + title.toLowerCase() + ' using simple invented objects, bold shapes, high contrast, and generous empty space; no child faces, photos, logos, branded interfaces, tiny text, sacred symbols, or personal details.',
    status: 'draft',
    version: 1,
    curriculumReview: 'reviewed',
    ageFitReview: 'reviewed',
    inclusionReview: 'reviewed_general',
    humanApprovalRequired: true,
  }
  challenge.socialContentPackage = packageFor(challenge)
  challenge.newsletterPackage = challenge.socialContentPackage.parentNewsletter
  return challenge
}

export const primaryChallenges2027 = weekSpecs.map(buildChallenge)

const bonusSpecs = [
  { slug: 'new-year', title: 'Tiny Restart Machine', date: '2027-01-01', window: ['2027-01-01', '2027-01-04'], prompt: 'Give an imaginary world one playful new beginning.', alternative: 'Create the first page of an imaginary story.', source: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/', gate: 'editorial' },
  { slug: 'lunar-new-year', title: 'Moon-Cycle Welcome Machine', date: '2027-02-06', window: ['2027-02-05', '2027-02-08'], prompt: 'Using a curator-reviewed source kit, make an interactive welcome to a new lunisolar year without borrowing sacred or cultural symbols as decorations.', alternative: 'Build a moon-cycle machine for an imaginary planet.', source: 'https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2027e.pdf', gate: 'culture_inclusion_and_amy' },
  { slug: 'pi-day', title: 'Never-Ending Pattern Playground', date: '2027-03-14', window: ['2027-03-13', '2027-03-16'], prompt: 'Play with circles, tiling, motion, or rhythm—without turning math into a speed contest.', alternative: 'Make any shape-shifting pattern lab.', source: 'https://www.unesco.org/en/days/mathematics', gate: 'curriculum_editorial' },
  { slug: 'march-equinox', title: 'Day-and-Night Balance Lab', date: '2027-03-20T20:25:00.000Z', window: ['2027-03-19', '2027-03-22'], prompt: 'Explore balance between light and dark using provided data, never a visitor’s location.', alternative: 'Build a two-color balance toy on an imaginary planet.', source: 'https://aa.usno.navy.mil/api/seasons?year=2027', gate: 'science_date' },
  { slug: 'creativity-earth', title: 'Joyful Planet Helper', date: '2027-04-21/2027-04-22', window: ['2027-04-20', '2027-04-24'], prompt: 'Invent or simulate one small planet helper with careful, sourced claims and no pressure to solve a crisis.', alternative: 'Invent a helpful machine for an imaginary habitat.', source: 'https://www.un.org/en/observances/creativity-and-innovation-day', secondarySource: 'https://www.un.org/en/observances/earth-day', gate: 'science_editorial' },
  { slug: 'pride-month', title: 'Everybody Belongs Clubhouse', date: '2027-06-01/2027-06-30', window: ['2027-06-01', '2027-06-07'], prompt: 'Design an imaginary clubhouse that welcomes varied creatures, families, bodies, and access needs without asking anyone to disclose identity.', alternative: 'Build a welcome machine for any imaginary visitor.', source: 'https://www.loc.gov/lgbt-pride-month/about/', gate: 'lgbtq_inclusion_and_amy' },
  { slug: 'juneteenth', title: 'Community Freedom Exhibit', date: '2027-06-19', window: ['2027-06-18', '2027-06-21'], prompt: 'Use only curator-provided facts to make a non-scored interactive exhibit about community, freedom, and unfinished history.', alternative: 'Create a community-history lantern using an invented place.', source: 'https://www.nps.gov/subjects/npscelebrates/juneteenth.htm', gate: 'black_history_accuracy_and_amy' },
  { slug: 'june-solstice', title: 'Sunlight Clock', date: '2027-06-21T14:11:00.000Z', window: ['2027-06-20', '2027-06-23'], prompt: 'Use provided astronomy data to show how a sunlight clock changes—never request geolocation.', alternative: 'Make a longest-light day on an imaginary planet.', source: 'https://aa.usno.navy.mil/api/seasons?year=2027', gate: 'science_date' },
  { slug: 'friendship-day', title: 'Different Strengths Puzzle', date: '2027-07-30', window: ['2027-07-29', '2027-08-02'], prompt: 'Make a cooperative creature puzzle where different abilities matter and no real friend needs to be named.', alternative: 'Let helpful strangers solve an imaginary problem.', source: 'https://www.un.org/en/observances/international-day-friendship', gate: 'inclusion_editorial' },
  { slug: 'september-equinox', title: 'Season-Switch Machine', date: '2027-09-23T06:02:00.000Z', window: ['2027-09-22', '2027-09-25'], prompt: 'Show change, rest, and renewal while remembering that seasons differ around the world.', alternative: 'Create a transformation machine for an imaginary climate.', source: 'https://aa.usno.navy.mil/api/seasons?year=2027', gate: 'science_date' },
  { slug: 'diwali', title: 'Reviewed Stories of Light and Welcome', date: '2027-10-29', dateNote: 'Government of India central date; some states may observe Naraka Chaturdasi on October 28.', window: ['2027-10-28', '2027-11-01'], prompt: 'Using a culturally reviewed source kit, tell a story about light, welcome, or renewal; sacred imagery is never required or used as a game prop.', alternative: 'Design night lights for an imaginary city.', source: 'https://ncr.indianrailways.gov.in/uploads/files/1785500162425-NCRPS%206464_2026_merged.pdf', gate: 'culture_religion_and_amy' },
  { slug: 'december-solstice', title: 'Longest-Night Glow Lab', date: '2027-12-22T02:42:00.000Z', dateNote: 'December 21 at 9:42 p.m. EST in New York; December 22 in UTC.', window: ['2027-12-20', '2027-12-23'], prompt: 'Experiment with light and shadow while remembering it is summer in the Southern Hemisphere.', alternative: 'Build a cozy glow machine for an imaginary world.', source: 'https://aa.usno.navy.mil/api/seasons?year=2027', gate: 'science_date' },
]

export const bonusChallenges2027 = bonusSpecs.map((bonus, index) => ({
  id: '2027-bonus-' + bonus.slug,
  year: 2027,
  weekNumber: null,
  kind: 'bonus',
  seasonalArc: index < 4 ? 'winter' : index < 8 ? 'spring' : index < 10 ? 'summer' : 'autumn',
  title: bonus.title,
  eyebrow: 'Optional special-event spark',
  prompt: bonus.prompt,
  fullBrief: bonus.prompt + ' This bonus never replaces the weekly challenge, has no voting or winner, and is always safe to skip.',
  observanceDate: bonus.date,
  observanceDateNote: bonus.dateNote || null,
  openingDate: bonus.window[0] + 'T14:00:00.000Z',
  submissionCloseDate: bonus.window[1] + 'T05:00:00.000Z',
  votingOpenDate: null,
  votingCloseDate: null,
  editorialTimezone: 'America/New_York',
  ageBand: '8–10',
  estimatedTime: { spark: '15–30 minutes', build: 'optional 45–90 minutes', glowUp: 'not required' },
  creativeSkills: ['research', 'interpretation', 'inclusive design'],
  codingConcepts: ['events', 'state', 'visual communication'],
  pathways: {
    spark: { name: 'Spark', brief: 'Make one small interaction that communicates the core idea.' },
    build: { name: 'Build', brief: 'Create a short interactive experience using the reviewed brief and source kit.' },
    glowUp: { name: 'Glow-Up', brief: 'Add an accessible explanation or alternate path; never add cultural details from guesswork.' },
  },
  starterIdeas: [bonus.alternative, 'Make a single-screen interactive poster.', 'Create a calm pattern or story with a clear reset.'],
  recommendedTools: preferredTools,
  freeToolAlternatives: freeAlternatives,
  noOrLowCodeRoute: 'Use paper cards, Twine, Scratch blocks, or clickable slides; a sourced one-screen prototype is enough.',
  parentNote: 'Participation is optional. Read the source kit together, use the neutral alternative if preferred, and do not ask the child to disclose identity, heritage, belief, family practice, or personal experience.',
  safetyNotes: ['Use invented characters and no identifying information.', 'No photos, voices, location, chat, accounts, commerce, or external collection.', 'Do not use sacred symbols, people, or painful history as points, obstacles, costumes, or random decorations.'],
  accessibilityNotes: ['Use text and shapes as well as color.', 'Keep sound optional.', 'Avoid flashing and provide simple controls.'],
  aiAssistanceGuidance: {
    principle: 'AI cannot supply cultural authority. Use only the approved source kit; the child remains creative lead.',
    parentSupervisedPrompt: 'Grown-up supervising: Help my 8–10-year-old implement their chosen interaction for “' + bonus.title + '.” Use only facts in the source text I provide. If cultural context is missing, say so and stop instead of guessing. Ask before adding code. Do not invent sacred symbols, customs, languages, foods, clothing, identity details, or personal stories, and do not request private information.',
  },
  makeItYoursQuestion: 'What visual rule or interaction can make your idea original without borrowing someone else’s tradition?',
  projectExamples: ['A sourced interactive poster', 'A gentle pattern explorer', 'The neutral alternative as a small animation'],
  submissionRequirements: ['Optional participation', 'Source credit in private review notes', 'One complete interaction', 'Grown-up safety and context review'],
  prePublishSafetyCheck: 'A grown-up checks every fact against the source kit, confirms the neutral option is visible, removes personal details, and verifies the required inclusion approval. If context is uncertain, keep the draft private.',
  reflectionQuestion: 'Which choice helped you welcome more than one way of experiencing this day or season?',
  reviewRiskFlags: ['special_event_context', 'human_context_review_required', 'visible_text', 'external_project_url'],
  visualBrief: 'An abstract, welcoming illustration using original shapes and light; no flags, sacred symbols, people, cultural clothing, food tokens, holiday mashups, brand marks, or identifying details unless an approved curator brief explicitly requires them.',
  sourceUrl: bonus.source,
  secondarySourceUrl: bonus.secondarySource || null,
  neutralAlternative: bonus.alternative,
  status: 'draft',
  version: 1,
  curriculumReview: 'reviewed',
  ageFitReview: 'reviewed',
  inclusionReview: 'pending_human',
  humanApprovalRequired: true,
  approvalGate: bonus.gate,
  votingEnabled: false,
  socialContentPackage: { publicationMode: 'dry_run', blockedUntilHumanApproval: true },
  newsletterPackage: { publicationMode: 'dry_run', blockedUntilHumanApproval: true },
}))

export const challengeProgram2027 = {
  id: PROGRAM_2027_ID,
  year: 2027,
  title: 'Vibe Code Kids 2027: Wonderfully Ridiculous Things',
  ageBand: '8–10',
  editorialTimezone: 'America/New_York',
  status: 'private_draft',
  version: 1,
  policyVersion: PROGRAM_2027_POLICY_VERSION,
  arcs: seasonalArcs2027,
  primaryChallenges: primaryChallenges2027,
  bonusChallenges: bonusChallenges2027,
}

export const allChallengeDrafts2027 = [...primaryChallenges2027, ...bonusChallenges2027]
