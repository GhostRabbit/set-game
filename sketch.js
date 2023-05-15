let deck = []
let board = {
  cards: [],
  bounds: [],
  selected: [],
  sets: []
}
let discard = []
let roundTime
let lastPick
let player = {}
const dimentions = {}
const cardBackgrounds = {}
const animationSpeed = 5000

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight)
  cnv.style('display', 'block') // Hack to hide scrollbars https://github.com/processing/p5.js/wiki/Positioning-your-canvas#making-the-canvas-fill-the-window
  rectMode(CENTER)
  imageMode(CENTER)
  init()
  clearBoard()
}

function init() {
  console.log("init")
  deck = []

  // Create cards
  const x = [color('rgb(204, 102, 0)'), color('rgb(0, 204, 102)'), color('rgb(102, 0, 204)')].forEach(c => {
    Object.keys(Fill).forEach(f => {
      const y = ['X', 'Y', 'Z'].forEach(l => {
        for (let n = 1; n <= 3; n++) {
          deck.push(new Card(l, n, f, c))
        }
      })
    })
  })

  deck = shuffle(deck)
  player.score = 0
  player.color = color('yellow')
  updateDimensions()
  initGraphics()

  // for (let i = 0; i < 6; i++)
    // makeSet(deck.pop(), deck.pop(), deck.pop())
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  updateDimensions()
  initGraphics()
}

function initGraphics() {
  cardBackgrounds[Fill.Striped] = createCardGraphics(cardBackgrounds[Fill.Striped]) // Can prolly be precalculated
  cardBackgrounds[Fill.Checker] = createCardGraphics(cardBackgrounds[Fill.Checker])
  cardBackgrounds[Fill.Wave] = createCardGraphics(cardBackgrounds[Fill.Wave]) // Can prolly be precalculated
}

function updateDimensions() {
  dimentions.w = width * 2 / 7
  dimentions.ws = (width - 3 * dimentions.w) / 3
  dimentions.h = height / 6
  dimentions.hs = (height / 10 + 3 * height / 5 + height / 10) / 4 - height / 6
  dimentions.lineWidth = (height + width) / 100
  dimentions.corner = (dimentions.h + dimentions.w) / 20
  dimentions.text = min(dimentions.h / 2, dimentions.w / 3)
  dimentions.stroke = dimentions.text / 8
}

function mouseClicked(event) {
  const mx = event.clientX
  const my = event.clientY

  // Find card to select
  let result = -1
  for (let i = 0; i < board.bounds.length; i++) {
    const b = board.bounds[i]
    if (!b) continue
    if (b.x - b.w2 < mx && mx < b.x + b.w2
      && b.y - b.h2 < my && my < b.y + b.h2
    ) {
      result = i
      break
    }
  }
  if (result != -1) {
    selectCard(result)
  }
}

function selectCard(i) {
  // Deselect
  if (board.selected.includes(i)) {
    board.selected.splice(board.selected.indexOf(i), 1)
    return
  }

  // Select
  board.selected.push(i)
  if (board.selected.length == 3) {
    pickSet(board.selected)
    board.selected = []
  }
}

function pickSet([c1, c2, c3]) {
  makeSet(pickCardFromBoard(c1), pickCardFromBoard(c2), pickCardFromBoard(c3))
}

function makeSet(c1, c2, c3) {
  let set = [c1, c2, c3]
  if (isSetCorrect(set)) {
    set.correct = true
    player.score++
    resetTimer()
  } else {
    player.score--
  }

  set.playerColor = player.color
  board.sets.push(set)
  if (board.sets.length > 6) {
    board.sets.shift().forEach(c => discard.push())
  }
}

function isSetCorrect([c1, c2, c3]) {
  function countUniqes(a, b, c) {
    if (a == b && b == c) return 1
    if (a != b && a != c && b != c) return 3
    return 2
  }
  const letter = countUniqes(c1.letter, c2.letter, c3.letter) != 2
  const count = countUniqes(c1.count, c2.count, c3.count) != 2
  const fill = countUniqes(c1.fill, c2.fill, c3.fill) != 2
  const color = countUniqes(c1.color, c2.color, c3.color) != 2
  return letter && count && fill && color
}

function pickCardFromBoard(i) {
  const c = board.cards[i]
  board.cards[i] = undefined
  return c
}

function clearBoard() {
  board.cards.forEach(c => discard.push(c))
  board.cards = []
  board.bounds = []
  board.selected = []

  if (deck.length < 12) {
    discard = shuffle(discard)
    discard.forEach(c => deck.push(c))
    discard = []
  }

  lastPick = second()
  resetTimer()
}

function resetTimer() {
  roundTime = 60
}

function draw() {
  clear()
  background(255)

  if (second() != lastPick) {
    let firstEmptySlot = board.cards.indexOf(undefined)
    if (firstEmptySlot != -1) {
      board.cards[firstEmptySlot] = deck.shift()
    }
    else if (board.cards.length < 12) {
      board.cards.push(deck.shift())
    }
    lastPick = second()
    if (roundTime-- == 0) {
      clearBoard()
    }
  }

  cardBackgrounds[Fill.Striped] = updateStripedBackground(cardBackgrounds[Fill.Striped])
  cardBackgrounds[Fill.Checker] = updateCheckerBackground(cardBackgrounds[Fill.Checker])
  cardBackgrounds[Fill.Wave] = updateWaveBackground(cardBackgrounds[Fill.Wave])
  drawBoard()
  drawSets()
  drawScore()
  drawCountdown()
}


function drawBoard() {
  let x = (dimentions.w + dimentions.ws) / 2
  let y
  const w = dimentions.w
  const h = dimentions.h
  board.bounds = []
  board.cards.forEach((c, i) => {
    if (i % 4 == 0) {
      y = dimentions.hs / 2 + h / 2
      if (i > 0) x += dimentions.w + dimentions.ws
    }
    if (c) {
      c.draw(x, y, w, h)
      if (board.selected.includes(i)) {
        const c = color('rgba(204, 204, 0, 0.3)')
        fill(c)
        stroke(c)
        rect(x, y, w, h, dimentions.corner)
      }
      board.bounds[i] = ({ x: x, y: y, w2: w / 2, h2: h / 2 })
    }
    y += dimentions.hs + h
  })
}

function drawSets() {
  const w = dimentions.w
  const h = dimentions.h
  let x = w / 2
  let y

  push()
  translate(dimentions.ws / 2, 4 * (h + dimentions.hs))
  scale(1 / 3)
  rectMode(CENTER)
  board.sets.forEach((set, i) => {
    if (i % 3 == 0) {
      y = dimentions.hs / 2 + h / 2
      if (i > 0) x += 3 * dimentions.ws + 3 * w
    }
    set[0].draw(x, y)
    set[1].draw(x + w, y)
    set[2].draw(x + 2 * w, y)
    noFill()
    strokeWeight(dimentions.stroke * 2)
    stroke(set.playerColor)
    if (!set.correct) {
      fill(color('rgba(255,0,0,0.25)'))
    }
    rect(x + w, y, w * 3, h, dimentions.corner)

    y += dimentions.hs + h
  })
  pop()
}

function drawScore() {
  textStyle(NORMAL)
  textAlign(RIGHT, BOTTOM)
  const size = height / 25
  textSize(size)
  noFill()
  strokeWeight(dimentions.stroke / 2)
  stroke(color('black'))
  fill(player.color)
  text(player.score + "   ", width - dimentions.lineWidth, height - size - dimentions.lineWidth)
  fill(color('white'))
  text("p", width - dimentions.lineWidth, height - size - dimentions.lineWidth)
}

function drawCountdown() {
  textAlign(RIGHT, BOTTOM)
  textStyle(NORMAL)
  const size = height / 25
  textSize(height / 25)
  fill(color('white'))
  strokeWeight(dimentions.stroke / 2)
  stroke(color('black'))
  text(roundTime + " s", width - dimentions.lineWidth, height - dimentions.lineWidth)
}

const Fill = {
  Wave: 'Wave',
  Striped: 'Striped',
  Checker: 'Checker'
}

function createCardGraphics(old) {
  if (old) old[0].remove()

  const w = dimentions.w
  const h = dimentions.h

  const cnv = createGraphics(w, h)
  const ctx = cnv.canvas.getContext('2d')

  cnv.rect(0, 0, w, h, dimentions.corner)
  ctx.clip()

  return [cnv, ctx]
}

function updateStripedBackground([cnv, ctx]) {
  const w = dimentions.w
  const h = dimentions.h
  const lw = dimentions.lineWidth
  const diag = sqrt(w * w + h * h)

  cnv.reset()
  cnv.background(255)

  ctx.translate(w / 2, h / 2)
  ctx.rotate(PI / 4)
  ctx.translate(-diag / 2, -diag / 2)

  cnv.strokeWeight(lw)
  cnv.stroke(color('#AAA'))
  const lines = diag / lw
  let y = lerp(0, 2 * lw, (millis() % animationSpeed) / animationSpeed)
  for (let i = 0; i < lines; i++) {
    cnv.line(0, y, diag, y)
    y += 2 * lw
  }
  return [cnv, ctx]
}

function updateWaveBackground([cnv, ctx]) {
  const w = dimentions.w
  const h = dimentions.h
  const lw = dimentions.lineWidth

  cnv.reset()
  cnv.background(255)

  let da = lerp(0, 2 * PI, (millis() % (2 * animationSpeed)) / (2 * animationSpeed))
  cnv.strokeWeight(lw)
  cnv.stroke(color('#AAA'))
  cnv.noFill()
  const lines = 2 + h / lw
  let y = -lw
  for (let i = 0; i < lines; i++) {
    cnv.beginShape()
    for (let x = 0; x < w; x += 5) {
      let a = lerp(0, 2 * PI, (x + w)) / (3 * w) - da
      cnv.vertex(x, y + lw * sin(a))
    }
    cnv.endShape()
    y += 2 * lw
  }
  return [cnv, ctx]
}

function updateCheckerBackground([cnv, ctx]) {
  const w = dimentions.w
  const h = dimentions.h
  const lw = dimentions.lineWidth

  cnv.reset()
  cnv.background(255)

  cnv.noStroke()
  cnv.fill(color('#AAA'))
  let dr = lw * sin(lerp(0, 2 * PI, (millis() % animationSpeed) / animationSpeed))
  const rows = h / (2 * lw) + 1
  const cols = w / (2 * lw) + 1
  for (let row = 0; row < rows; row++) {
    dr = -dr
    let dr2 = dr
    for (let col = 0; col < cols; col++) {
      cnv.circle(2 * lw * col, 2 * lw * row, 1.5 * lw + dr2)
      dr2 = -dr2
    }
  }
  return [cnv, ctx]
}

class Card {
  constructor(letter, count, fill, color) {
    this.letter = letter
    this.count = count
    this.fill = fill
    this.color = color
  }

  draw(x, y) {
    textAlign(CENTER, CENTER)
    image(cardBackgrounds[this.fill][0], x, y)
    stroke(this.color)
    strokeWeight(dimentions.stroke)
    noFill()
    rect(x, y, dimentions.w, dimentions.h, dimentions.corner)

    textSize(dimentions.text)
    textStyle(BOLD)
    stroke(color('black'))
    fill(this.color)
    strokeWeight(dimentions.stroke)
    text(this.letter.repeat(this.count), x, y + 5)
  }
}