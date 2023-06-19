const playerColors = ["yellow", "blue", "orange", "green", "purple", "cyan", "magenta"];
class Player {
  constructor() {
    this.declaredNoSet = false;
    this.points = 0;
    this.higestReportedScore = 0;
    this.totalPlayTime = 0;
    this.colorIndex = null;
  }

  score(s) {
    if (s) {
      this.points += s;
      if (this.points % 10 == 0 && this.points > this.higestReportedScore) {
        this.higestReportedScore = this.points;
        reportScore(this);
      }
    }
    return this.points;
  }

  mean() {
    return (player.points / (this.totalPlayTime / 60.0)).toFixed(2);
  }

  getColor() {
    if (this.colorIndex === null) {
      let storedColorValue = getItem('playerColor');
      this.colorIndex = storedColorValue === null ? 0 : parseInt(storedColorValue);
      this.calculateAlphaColor();
    }
    return playerColors[this.colorIndex];
  }

  calculateAlphaColor() {
    let c = this.getColor();
    this.colorAlfa = color('rgba(' + red(c) + ',' + green(c) + ',' + blue(c) + ',' + 0.3 + ')');
  }

  nextColor() {
    this.colorIndex = (this.colorIndex + 1) % playerColors.length;
    storeItem('playerColor', "" + this.colorIndex);
    this.calculateAlphaColor();
  }
}
