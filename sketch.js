const features = {
  wonkyness: false
};

let deck = [];
let board = {
  cards: [],
  bounds: [],
  selected: [],
  sets: [],
};
let discard = [];
let roundTime;
let lastPickTime;
let player;
let scoreArea;
let splash;
let fadeTtl = 0;
const dimensions = {};
const cardBackgrounds = {};
const animationSpeed = 25000;
let bgColor = [() => 255, () => 255, () => 255];

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.style("display", "block"); // Hack to hide scrollbars https://github.com/processing/p5.js/wiki/Positioning-your-canvas#making-the-canvas-fill-the-window
  frameRate(15);
  rectMode(CENTER);
  imageMode(CENTER);
  init();
  clearBoard();
}

function init() {
  console.log("init");
  deck = [];

  // Create cards
  const x = [
    color("rgb(204, 102, 0)"),
    color("rgb(0, 204, 102)"),
    color("rgb(102, 0, 204)"),
  ].forEach((c) => {
    Object.keys(Fill).forEach((f) => {
      const y = ["X", "Y", "Z"].forEach((l) => {
        for (let n = 1; n <= 3; n++) {
          deck.push(new Card(l, n, f, c));
        }
      });
    });
  });

  deck = shuffle(deck);
  scoreArea = new ScoreArea();
  updateDimensions();
  initGraphics();
  player = new Player();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateDimensions();
  initGraphics();
}

function initGraphics() {
  // Can prolly be precalculated
  cardBackgrounds[Fill.Striped] = createCardGraphics(
    cardBackgrounds[Fill.Striped]
  );
  cardBackgrounds[Fill.Checker] = createCardGraphics(
    cardBackgrounds[Fill.Checker]
  );
  cardBackgrounds[Fill.Wave] = createCardGraphics(cardBackgrounds[Fill.Wave]);
}

function updateDimensions() {
  dimensions.w = 2 * width / 7;
  dimensions.ws = (width - 3 * dimensions.w) / 3;
  dimensions.h = height / 6;
  dimensions.hs =
    (height / 10 + (3 * height) / 5 + height / 10) / 4 - height / 6;
  dimensions.lineWidth = (height + width) / 100;
  dimensions.corner = (dimensions.h + dimensions.w) / 20;
  dimensions.text = min(dimensions.h / 2, dimensions.w / 3);
  dimensions.stroke = dimensions.text / 8;
}

function mouseClicked(event) {
  const x = event.clientX;
  const y = event.clientY;

  // In cutscene?
  if (fadeTtl > 0) return;

  // In splash mode?
  if (splash) {
    splash = undefined;
    return;
  }

  // In card?
  for (let card of board.cards) {
    if (!card) continue;
    if (card.covers(x, y)) {
      selectCard(card);
      return;
    }
  }

  // In set?
  for (let set of board.sets) {
    if (set.covers(x, y)) {
      splash = set;
      return;
    }
  }

  // In NoSetBUtton?
  if (scoreArea.noSetButton.covers(x, y)) {
    if (boardIsFull()) {
      triggerFadeScene();
      if (leftoverSet.length > 0) {
        // minus for missed set
        // minus for wrongly declare set whwn there was none
        player.score(-2);
      }
      // Bonus for declararation when no set exist
      else player.score(1);
    }
    return;
  }

  // In score?
  if (scoreArea.covers(x, y)) {
    // Swap player color
    player.nextColor();
    return;
  }
}

function selectCard(c) {
  // Deselect
  if (board.selected.includes(c)) {
    board.selected.splice(board.selected.indexOf(c), 1);
    return;
  }

  // Select
  board.selected.push(c);
  if (board.selected.length == 3) {
    pickUpSet(board.selected);
    board.selected = [];
  }
}

function pickUpSet(set) {
  for (let card of set) {
    board.cards[board.cards.indexOf(card)] = undefined;
  }
  makeSet(set).rateForScore();
  while (board.sets.length > 3) {
    board.sets.shift().discard();
  }
}

function makeSet(set) {
  let s = new Set(set, player.getColor(), isCorrect(set));
  board.sets.push(s);
  return s;
}

function boardIsFull() {
  for (let i = 0; i < 12; i++) if (board.cards[i] === undefined) return false;
  return true;
}

function clearBoard() {
  board.cards.forEach((c) => {
    if (c) discard.push(c);
  });
  board.cards = [];
  board.bounds = [];
  board.selected = [];

  lastPickTime = second();
  resetTimer();
}

function resetTimer() {
  roundTime = 75;
}

function triggerFadeScene() {
  fadeTtl = 5000;
  leftoverSet = findCorrectSetIn(board.cards);
}

function colorBounce() {
  const eventTime = millis();
  const darkerTime = 300;
  const darkestPoint = 75;
  const lighterTime = 600;
  return (now) => {
    const elapsedTime = now - eventTime;
    return map(constrain(darkerTime - elapsedTime, 0, darkerTime), 0, darkerTime, darkestPoint, 255) + // darker
      constrain((elapsedTime - darkerTime) * (255 - darkestPoint) / lighterTime, 0, 255 - darkestPoint);  // lighter
  };
}

function draw() {
  background(bgColor[0](millis()), bgColor[1](millis()), bgColor[2](millis()));
  updateBackgrounds();

  if (fadeTtl > 0) {
    fadeTtl -= deltaTime;
    let x = fadeTtl / 5000.0;
    let col = color(255, 255, 255, 255 * (1.0 - x * x));
    drawBoard(leftoverSet, col);
    if (fadeTtl <= 0) {
      clearBoard();
    }
  }
  else {
    if (splash) {
      splash.drawSplash();
      return;
    }

    if (second() != lastPickTime) {
      if (deck.length == 0) {
        deck = shuffle(discard);
        discard = [];
      }
      let emptySlot = findEmptySlot();
      if (emptySlot != -1) {
        board.cards[emptySlot] = deck.shift();
      } else if (board.cards.length < 12) {
        board.cards.push(deck.shift());
      }
      if (boardIsFull()) {
        roundTime--;
        player.totalPlayTime++;
      }
      lastPickTime = second();
      if (roundTime == 0) {
        triggerFadeScene();
        if (leftoverSet.length > 0) {
          // minus for missed set
          player.score(-1);
        }
      }
    }
    drawBoard();
  }
  drawSets();
  scoreArea.paint();
}

function findEmptySlot() {
  let emptySpots = [];
  for (let i = 0; i < 12; i++) if (board.cards[i] === undefined) emptySpots.push(i);
  if (emptySpots.length == 0) return -1;
  return random(emptySpots);
}

function drawBoard(leftoverSet, fadeColor) {
  let x = (dimensions.w + dimensions.ws) / 2;
  let y;
  const w = dimensions.w;
  const h = dimensions.h;
  board.bounds = [];
  for (let i = 0; i < 12; i++) {
    const card = board.cards[i];
    if (i % 4 == 0) {
      y = dimensions.hs / 2 + h / 2;
      if (i > 0) x += dimensions.w + dimensions.ws;
    }
    if (card) {
      if (board.selected.includes(card))
        card.paint(x, y, 1.0, player.colorAlfa);
      else
        card.paint(x, y, 1.0);
      if (leftoverSet && !leftoverSet.includes(card))
        card.fade(fadeColor);
    }
    y += dimensions.hs + h;
  }
}

function drawSets() {
  let x = dimensions.ws / 2;
  let y;

  board.sets.forEach((set, i) => {
    if (i % 3 == 0) {
      y = 4 * (dimensions.h + dimensions.hs);
      if (i > 0) x += dimensions.ws + dimensions.w;
    }
    set.draw(x, y);
    y += (dimensions.hs + dimensions.h) / 3;
  });
}

function isCorrect([c1, c2, c3]) {
  const letter = countUniques(c1.letter, c2.letter, c3.letter) != 2;
  const count = countUniques(c1.count, c2.count, c3.count) != 2;
  const fill = countUniques(c1.fill, c2.fill, c3.fill) != 2;
  const color = countUniques(c1.color, c2.color, c3.color) != 2;
  return [letter, count, fill, color];
}

function updateBackgrounds() {
  cardBackgrounds[Fill.Striped] = updateStripedBackground(
    cardBackgrounds[Fill.Striped]
  );
  cardBackgrounds[Fill.Checker] = updateCheckerBackground(
    cardBackgrounds[Fill.Checker]
  );
  cardBackgrounds[Fill.Wave] = updateWaveBackground(cardBackgrounds[Fill.Wave]);
}

const Fill = {
  Wave: "Wave",
  Striped: "Striped",
  Checker: "Checker",
};

function createCardGraphics(old) {
  if (old) old[0].remove();

  const w = dimensions.w;
  const h = dimensions.h;

  const cnv = createGraphics(w, h);
  const ctx = cnv.canvas.getContext("2d");

  cnv.rect(0, 0, w, h, dimensions.corner);
  ctx.clip();

  return [cnv, ctx];
}

function updateStripedBackground([cnv, ctx]) {
  const w = dimensions.w;
  const h = dimensions.h;
  const lw = dimensions.lineWidth;
  const diag = sqrt(w * w + h * h);

  cnv.reset();
  cnv.background(255);

  const cols = w / (4 * lw) + 1;
  const rows = h / lw + 1;
  let dy = lerp(
    0,
    2 * lw,
    (millis() % animationSpeed) / animationSpeed
  );
  ctx.setLineDash([2 * lw, 2 * lw]);
  cnv.noStroke();
  cnv.fill(color("#AAA"));
  for (let j = -1; j <= rows; j++) {
    const y = 2 * j * lw;
    for (let i = 0; i <= cols; i++) {
      const x1 = w / 2 + i * 2 * lw;
      const x2 = w / 2 - i * 2 * lw;
      if (i == 0) {
        cnv.triangle(w / 2, y - dy, w / 2 - lw, y + 2 * lw - dy, w / 2 + lw, y + 2 * lw - dy);
      } else if (i % 2 == 0) {
        cnv.triangle(x1, y - dy, x1 - lw, y + 2 * lw - dy, x1 + lw, y + 2 * lw - dy);
        cnv.triangle(x2, y - dy, x2 - lw, y + 2 * lw - dy, x2 + lw, y + 2 * lw - dy);
      } else {
        cnv.triangle(x1, y + 2 * lw + dy, x1 - lw, y + dy, x1 + lw, y + dy);
        cnv.triangle(x2, y + 2 * lw + dy, x2 - lw, y + dy, x2 + lw, y + dy);
      }
    }
  }
  return [cnv, ctx];
}

function updateWaveBackground([cnv, ctx]) {
  const w = dimensions.w;
  const h = dimensions.h;
  const lw = dimensions.lineWidth;

  cnv.reset();
  cnv.background(255);

  let da = lerp(
    0,
    2 * PI,
    (millis() % (2 * animationSpeed)) / (2 * animationSpeed)
  );
  cnv.strokeWeight(lw);
  cnv.stroke(color("#AAA"));
  cnv.noFill();
  const lines = 2 + h / lw;
  let y = -lw;
  for (let i = 0; i < lines; i++) {
    cnv.beginShape();
    for (let x = 0; x < w; x += 5) {
      let a = lerp(0, 2 * PI, x + w) / (3 * w) - da;
      cnv.vertex(x, y + lw * sin(a));
    }
    cnv.endShape();
    y += 2 * lw;
  }
  return [cnv, ctx];
}

function updateCheckerBackground([cnv, ctx]) {
  const w = dimensions.w;
  const h = dimensions.h;
  const lw = dimensions.lineWidth;

  cnv.reset();
  cnv.background(255);

  cnv.noStroke();
  cnv.fill(color("#AAA"));
  let dr =
    lw * sin(lerp(0, 2 * PI, (millis() % animationSpeed) / animationSpeed));
  const rows = h / (2 * lw) + 1;
  const cols = w / (2 * lw) + 1;
  for (let row = 0; row < rows; row++) {
    dr = -dr;
    let dr2 = dr;
    for (let col = 0; col < cols; col++) {
      cnv.circle(2 * lw * col, 2 * lw * row, 1.5 * lw + dr2);
      dr2 = -dr2;
    }
  }
  return [cnv, ctx];
}