let deck = []
let board = {
  cards: [],
  bounds: [],
  selected: [],
  sets: [],
}
let discard = []
let roundTime
let lastPick
let player = {}
let scoreArea
let splash
const dimensions = {}
const cardBackgrounds = {}
const animationSpeed = 25000
const playerColors = ["yellow", "blue", "green", "red"]

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight)
  cnv.style("display", "block") // Hack to hide scrollbars https://github.com/processing/p5.js/wiki/Positioning-your-canvas#making-the-canvas-fill-the-window
  frameRate(15)
  rectMode(CENTER)
  imageMode(CENTER)
  init()
  clearBoard()
}

function init() {
  console.log("init")
  deck = []

  // Create cards
  const x = [
    color("rgb(204, 102, 0)"),
    color("rgb(0, 204, 102)"),
    color("rgb(102, 0, 204)"),
  ].forEach((c) => {
    Object.keys(Fill).forEach((f) => {
      const y = ["X", "Y", "Z"].forEach((l) => {
        for (let n = 1; n <= 3; n++) {
          deck.push(new Card(l, n, f, c))
        }
      })
    })
  })

  deck = shuffle(deck)
  player.score = 0
  scoreArea = new ScoreArea()
  calculatePlayerColor()
  updateDimensions()
  initGraphics()
  // for (let i = 0; i < 6; i++)
  //   makeSet([deck.pop(), deck.pop(), deck.pop()])
  // splash = board.sets[0]
}

function calculatePlayerColor() {
  const c = color(playerColors[0])
  player.color = c
  player.colorAlfa = color('rgba(' + red(c) + ',' + green(c) + ',' + blue(c) + ',' + 0.3 + ')')
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  updateDimensions()
  initGraphics()
}

function initGraphics() {
  cardBackgrounds[Fill.Striped] = createCardGraphics(
    cardBackgrounds[Fill.Striped]
  ) // Can prolly be precalculated
  cardBackgrounds[Fill.Checker] = createCardGraphics(
    cardBackgrounds[Fill.Checker]
  )
  cardBackgrounds[Fill.Wave] = createCardGraphics(cardBackgrounds[Fill.Wave]) // Can prolly be precalculated
}

function updateDimensions() {
  dimensions.w = (width * 2) / 7
  dimensions.ws = (width - 3 * dimensions.w) / 3
  dimensions.h = height / 6
  dimensions.hs =
    (height / 10 + (3 * height) / 5 + height / 10) / 4 - height / 6
  dimensions.lineWidth = (height + width) / 100
  dimensions.corner = (dimensions.h + dimensions.w) / 20
  dimensions.text = min(dimensions.h / 2, dimensions.w / 3)
  dimensions.stroke = dimensions.text / 8
}

function mouseClicked(event) {
  const x = event.clientX
  const y = event.clientY

  // In splash mode?
  if (splash) {
    splash = undefined
    return
  }

  // In card?
  for (let card of board.cards) {
    if (!card) continue
    if (card.covers(x, y)) {
      selectCard(card)
      return
    }
  }

  // In set?
  for (let set of board.sets) {
    if (set.covers(x, y)) {
      splash = set
      return
    }
  }

  // In score?
  if (scoreArea.covers(x, y)) {
    // Swap player color
    playerColors.push(playerColors.shift())
    calculatePlayerColor()
    return
  }
}

function selectCard(c) {
  // Deselect
  if (board.selected.includes(c)) {
    board.selected.splice(board.selected.indexOf(c), 1)
    return
  }

  // Select
  board.selected.push(c)
  if (board.selected.length == 3) {
    pickUpSet(board.selected)
    board.selected = []
  }
}

function pickUpSet(set) {
  for (let card of set) {
    board.cards[board.cards.indexOf(card)] = undefined
  }
  makeSet(set).score()
  if (board.sets.length > 6) {
    board.sets.shift().discard()
  }
}

function makeSet(set) {
  let s = new Set(set, player.color)
  board.sets.push(s)
  return s
}

function clearBoard() {
  board.cards.forEach((c) => {
    if (c) discard.push(c)
  })
  board.cards = []
  board.bounds = []
  board.selected = []

  lastPick = second()
  resetTimer()
}

function resetTimer() {
  roundTime = 99
}

function draw() {
  background(255)
  cardBackgrounds[Fill.Striped] = updateStripedBackground(
    cardBackgrounds[Fill.Striped]
  )
  cardBackgrounds[Fill.Checker] = updateCheckerBackground(
    cardBackgrounds[Fill.Checker]
  )
  cardBackgrounds[Fill.Wave] = updateWaveBackground(cardBackgrounds[Fill.Wave])

  if (splash) {
    splash.drawSplash()
    return
  }

  if (second() != lastPick) {
    if (deck.length == 0) {
      deck = shuffle(discard)
      discard = []
    }
    let firstEmptySlot = board.cards.indexOf(undefined)
    if (firstEmptySlot != -1) {
      board.cards[firstEmptySlot] = deck.shift()
    } else if (board.cards.length < 12) {
      board.cards.push(deck.shift())
    }
    lastPick = second()
    if (roundTime-- == 0) {
      clearBoard()
    }
  }

  drawBoard()
  drawSets()
  scoreArea.draw()
}

function drawBoard() {
  let x = (dimensions.w + dimensions.ws) / 2
  let y
  const w = dimensions.w
  const h = dimensions.h
  board.bounds = []
  board.cards.forEach((c, i) => {
    if (i % 4 == 0) {
      y = dimensions.hs / 2 + h / 2
      if (i > 0) x += dimensions.w + dimensions.ws
    }
    if (c) {
      c.draw(x, y)
      if (board.selected.includes(c)) {
        const c = player.colorAlfa
        fill(c)
        stroke(c)
        rectMode(CENTER)
        rect(x, y, w, h, dimensions.corner)
      }
    }
    y += dimensions.hs + h
  })
}

function drawSets() {
  let x = dimensions.ws / 2
  let y

  board.sets.forEach((set, i) => {
    if (i % 3 == 0) {
      y = 4 * (dimensions.h + dimensions.hs)
      if (i > 0) x += dimensions.ws + dimensions.w
    }
    set.draw(x, y)
    y += (dimensions.hs + dimensions.h) / 3
  })
}

class Card {
  constructor(letter, count, fill, color) {
    this.letter = letter
    this.count = count
    this.fill = fill
    this.color = color
  }

  draw(x, y, scaleFactor) {
    this.x = x
    this.y = y
    push()
    translate(x, y)
    if (scaleFactor > 0) scale(scaleFactor)
    rectMode(CENTER)
    image(cardBackgrounds[this.fill][0], 0, 0)
    stroke(this.color)
    strokeWeight(dimensions.stroke)
    noFill()
    rect(0, 0, dimensions.w, dimensions.h, dimensions.corner)

    textAlign(CENTER, CENTER)
    textSize(dimensions.text)
    textStyle(BOLD)
    stroke(color("black"))
    fill(this.color)
    strokeWeight(dimensions.stroke)
    text(this.letter.repeat(this.count), 0, 5)
    pop()
  }

  covers(x, y) {
    return this.x - dimensions.w / 2 < x && x < this.x + dimensions.w / 2
      && this.y - dimensions.h / 2 < y && y < this.y + dimensions.h / 2
  }
}

class Set {
  constructor(cards, borderColor) {
    this.cards = cards
    this.borderColor = borderColor
  }

  countUniques(a, b, c) {
    if (a == b && b == c) return 1
    if (a != b && a != c && b != c) return 3
    return 2
  }

  isCorrect([c1, c2, c3]) {
    const letter = this.countUniques(c1.letter, c2.letter, c3.letter) != 2
    const count = this.countUniques(c1.count, c2.count, c3.count) != 2
    const fill = this.countUniques(c1.fill, c2.fill, c3.fill) != 2
    const color = this.countUniques(c1.color, c2.color, c3.color) != 2
    this.corrects = [letter, count, fill, color]
    return letter && count && fill && color
  }

  score() {
    if (this.isCorrect(this.cards)) {
      this.correct = true
      player.score++
      resetTimer()
    } else {
      player.score--
    }
  }

  discard() {
    this.cards.forEach(c => discard.push(c))
  }

  draw(x, y) {
    this.x = x
    this.y = y
    this.cards.forEach((card, i) => {
      card.draw(x + (i + 0.5) * dimensions.w / 3, y + dimensions.h / 6, 1 / 3)
    })
    rectMode(CORNER)
    noFill()
    strokeWeight(dimensions.stroke / 2)
    stroke(this.borderColor)
    if (!this.correct) {
      fill(color("rgba(255,0,0,0.25)"))
    }
    rect(x, y, dimensions.w, dimensions.h / 3, dimensions.corner / 3)
  }

  covers(x, y) {
    return this.x < x && x < this.x + dimensions.w
      && this.y < y && y < this.y + dimensions.h / 3
  }

  drawSplash() {
    this.cards.forEach((card, i) => {
      let x = (i + 0.5) * (dimensions.w + dimensions.ws)
      let y = dimensions.h
      card.draw(x, y)

      this.isCorrect(this.cards)

      y += dimensions.h
      textAlign(CENTER, CENTER)
      textSize(dimensions.text)
      textStyle(BOLD)
      noStroke()
      fill(color("black"))
      text(card.letter, x, y)
      if (!this.corrects[0]) {
        noFill()
        stroke(color("red"))
        strokeWeight(dimensions.stroke)
        ellipse(x, y - dimensions.stroke, dimensions.w / 2, dimensions.h / 2)
      }

      y += dimensions.h
      noStroke()
      fill(color("black"))
      text("I".repeat(card.count), x, y)
      if (!this.corrects[1]) {
        noFill()
        stroke(color("red"))
        strokeWeight(dimensions.stroke)
        ellipse(x, y - dimensions.stroke, dimensions.w / 2, dimensions.h / 2)
      }

      y += dimensions.h
      stroke(color("black"))
      strokeWeight(dimensions.stroke)
      image(cardBackgrounds[card.fill][0], x, y)

      if (!this.corrects[2]) {
        noFill()
        stroke(color("red"))
        strokeWeight(dimensions.stroke)
        line(x - dimensions.w / 2, y - dimensions.h / 2, x + dimensions.w / 2, y + dimensions.h / 2)
        line(x + dimensions.w / 2, y - dimensions.h / 2, x - dimensions.w / 2, y + dimensions.h / 2)
      }

      y += dimensions.h
      noStroke()
      fill(card.color)
      rectMode(CENTER)
      rect(x, y, dimensions.w / 2, dimensions.h / 2, dimensions.corner / 2)
      if (!this.corrects[3]) {
        noFill()
        stroke(color("red"))
        strokeWeight(dimensions.stroke)
        line(x - dimensions.w / 4, y - dimensions.h / 4, x + dimensions.w / 4, y + dimensions.h / 4)
        line(x + dimensions.w / 4, y - dimensions.h / 4, x - dimensions.w / 4, y + dimensions.h / 4)
      }

    })
  }
}

class ScoreArea {

  draw(x, y) {
    textStyle(NORMAL)
    textAlign(LEFT, BOTTOM)
    const hsize = height / 25
    textSize(hsize)
    stroke(color('black'))
    strokeWeight(dimensions.stroke / 2)
    let strings = [
      [player.score + " ", color(player.color)],
      ["p", color("white")],
    ]
    this.drawText(
      width - dimensions.ws / 2 - textWidth(player.score + " p"),
      height - hsize - dimensions.hs / 2,
      strings
    )
    this.drawCountdown()
  }

  drawText(x, y, text_array) {
    var pos_x = x
    for (var i = 0; i < text_array.length; ++i) {
      var part = text_array[i]
      var t = part[0]
      var c = part[1]
      var w = textWidth(t)
      fill(c)
      text(t, pos_x, y)
      pos_x += w
    }
  }

  drawCountdown() {
    textStyle(NORMAL)
    textAlign(LEFT, BOTTOM)
    textSize(height / 25)
    stroke(color("black"))
    fill(color("white"))
    strokeWeight(dimensions.stroke / 2)
    const string = roundTime + " s"
    text(
      string,
      width - dimensions.ws / 2 - textWidth(string),
      height - dimensions.hs / 2
    )
  }

  covers(x, y) {
    return width - dimensions.w < x && x < width
      && height - dimensions.h < y && y < height
  }
}

const Fill = {
  Wave: "Wave",
  Striped: "Striped",
  Checker: "Checker",
}

function createCardGraphics(old) {
  if (old) old[0].remove()

  const w = dimensions.w
  const h = dimensions.h

  const cnv = createGraphics(w, h)
  const ctx = cnv.canvas.getContext("2d")

  cnv.rect(0, 0, w, h, dimensions.corner)
  ctx.clip()

  return [cnv, ctx]
}

function updateStripedBackground([cnv, ctx]) {
  const w = dimensions.w
  const h = dimensions.h
  const lw = dimensions.lineWidth
  const diag = sqrt(w * w + h * h)

  cnv.reset()
  cnv.background(255)

  const cols = w / (4 * lw) + 1
  const rows = h / lw + 1
  let dy = lerp(
    0,
    2 * lw,
    (millis() % animationSpeed) / animationSpeed
  )
  ctx.setLineDash([2 * lw, 2 * lw])
  cnv.noStroke()
  cnv.fill(color("#AAA"))
  for (let j = -1; j <= rows; j++) {
    const y = 2 * j * lw
    for (let i = 0; i <= cols; i++) {
      const x1 = w / 2 + i * 2 * lw
      const x2 = w / 2 - i * 2 * lw
      if (i == 0) {
        cnv.triangle(w / 2, y - dy, w / 2 - lw, y + 2 * lw - dy, w / 2 + lw, y + 2 * lw - dy)
      } else if (i % 2 == 0) {
        cnv.triangle(x1, y - dy, x1 - lw, y + 2 * lw - dy, x1 + lw, y + 2 * lw - dy)
        cnv.triangle(x2, y - dy, x2 - lw, y + 2 * lw - dy, x2 + lw, y + 2 * lw - dy)
      } else {
        cnv.triangle(x1, y + 2 * lw + dy, x1 - lw, y + dy, x1 + lw, y + dy)
        cnv.triangle(x2, y + 2 * lw + dy, x2 - lw, y + dy, x2 + lw, y + dy)
      }
    }
  }
  return [cnv, ctx]
}

function updateWaveBackground([cnv, ctx]) {
  const w = dimensions.w
  const h = dimensions.h
  const lw = dimensions.lineWidth

  cnv.reset()
  cnv.background(255)

  let da = lerp(
    0,
    2 * PI,
    (millis() % (2 * animationSpeed)) / (2 * animationSpeed)
  )
  cnv.strokeWeight(lw)
  cnv.stroke(color("#AAA"))
  cnv.noFill()
  const lines = 2 + h / lw
  let y = -lw
  for (let i = 0; i < lines; i++) {
    cnv.beginShape()
    for (let x = 0; x < w; x += 5) {
      let a = lerp(0, 2 * PI, x + w) / (3 * w) - da
      cnv.vertex(x, y + lw * sin(a))
    }
    cnv.endShape()
    y += 2 * lw
  }
  return [cnv, ctx]
}

function updateCheckerBackground([cnv, ctx]) {
  const w = dimensions.w
  const h = dimensions.h
  const lw = dimensions.lineWidth

  cnv.reset()
  cnv.background(255)

  cnv.noStroke()
  cnv.fill(color("#AAA"))
  let dr =
    lw * sin(lerp(0, 2 * PI, (millis() % animationSpeed) / animationSpeed))
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