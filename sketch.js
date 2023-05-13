let deck = []
let board = []
let discard = []
let lastPick
let lastBoard
const cardBackgrounds = new Object
const weightOfStroke = 5
const animationSpeed = 5000

function setup() {
  createCanvas(500, 500)
  rectMode(CENTER)
  imageMode(CENTER)
  textAlign(CENTER, CENTER)
  init()
  clearBoard()
}

function init() {
  console.log("init")
  deck = []
  board = []

  const x = [color('red'), color('green'), color('blue')].forEach(c => {
    Object.keys(Fill).forEach(f => {
      const y = ['A', 'B', 'C'].forEach(l => {
        for (let n = 1; n <= 3; n++) {
          deck.push(new Card(l, n, f, c))
        }
      })
    })
  })

  deck = shuffle(deck)
}

function clearBoard() {
  board.forEach(c => discard.push(c))
  board = []

  if (deck.length < 12) {
    discard = shuffle(discard)
    discard.forEach(c => deck.push(c))
    discard = []
  }

  lastBoard = minute()
  lastPick = second()
}

function draw() {
  clear()
  background(255)

  if (minute() != lastBoard) clearBoard()

  if (second() != lastPick) {
    if (board.length < 12) {
      board.push(deck.shift())
    }
    lastPick = second()
  }

  cardBackgrounds[Fill.Striped] = createStripedBackground()
  cardBackgrounds[Fill.Checker] = createCheckerBackground()
  cardBackgrounds[Fill.Solid] = createSolidBackground()
  drawBoard()
  drawCountdown()
}

function createStripedBackground() {
  const w = width * 2 / 7
  const h = height / 6
  const lineWidth = height / 50

  const cnv = createGraphics(w, h)
  const ctx = cnv.canvas.getContext('2d')

  cnv.rect(0, 0, w, h, height / 60)
  ctx.clip()

  ctx.rotate(PI / 4)
  cnv.strokeWeight(lineWidth)
  cnv.stroke(color('#AAA'))
  let y = -h * 2 + lerp(0, 2 * lineWidth, (millis() % animationSpeed) / animationSpeed)
  for (let i = 0; i < 20; i++) {
    cnv.line(-w, y, 2 * w, y)
    y += 2 * lineWidth
  }
  return cnv
}

function createSolidBackground() {
  const w = width * 2 / 7
  const h = height / 6

  const cnv = createGraphics(w, h)
  const ctx = cnv.canvas.getContext('2d')

  cnv.rect(0, 0, w, h, height / 60)
  ctx.clip()

  let dc = 50 * sin(lerp(0, 2 * PI, (millis() % animationSpeed) / animationSpeed))
  cnv.background(180 + dc)
  return cnv
}

function createCheckerBackground() {
  const w = width * 2 / 7
  const h = height / 6
  const lineWidth = height / 50

  const cnv = createGraphics(w, h)
  const ctx = cnv.canvas.getContext('2d')

  cnv.rect(0, 0, w, h, height / 60)
  ctx.clip()

  ctx.rotate(PI / 4)
  cnv.strokeWeight(lineWidth)
  cnv.stroke(color('#AAA'))
  let y = -h * 2
  let dr = lineWidth / 2 * sin(lerp(0, 2 * PI, (millis() % animationSpeed) / animationSpeed))
  for (let i = 0; i < 20; i++) {
    for (let x = 0; x < w; x += 2 * lineWidth) {
      cnv.circle(x, y, dr + lineWidth / 3)
      dr *= -1
    }
    y += 2 * lineWidth
  }
  return cnv
}

function drawBoard() {
  let x = -width / 6
  let y = height / 4
  board.forEach((c, i) => {
    if (i % 4 == 0) {
      y = height / 5
      x += width / 3
    }
    c.draw(x, y)
    y += height / 5
  })
}

function drawCountdown() {
  textStyle(NORMAL)
  textSize(height / 25)
  fill(color('#000'))
  noStroke()
  text(60 - second(), 20, 20)
}

const Fill = {
  Solid: 'Solid',
  Striped: 'Striped',
  Checker: 'Checker'
}

class Card {
  constructor(letter, count, fill, color) {
    this.letter = letter
    this.count = count
    this.fill = fill
    this.color = color
  }

  draw(x, y) {
    image(cardBackgrounds[this.fill], x, y)
    stroke(this.color)
    noFill()
    rect(x, y, 2 * width / 7, height / 6, height / 60)

    textSize(height / 9)
    textStyle(BOLD)
    stroke(color('black'))
    fill(this.color)
    strokeWeight(weightOfStroke)
    text(this.letter.repeat(this.count), x, y + 5)
  }
}