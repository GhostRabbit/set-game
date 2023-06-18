class Player {
  constructor() {
    this.declaredNoSet = false;
    this.points = 0;
    this.higestReportedScore = 0;
    this.totalPlayTime = 0;
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
}
