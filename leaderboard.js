class Leaderboard {
  constructor(jsonFile) {
    this.jsonFile = jsonFile; // Název souboru
    this.results = [];
  }

  // Načtení výsledků ze souboru JSON
  loadResults() {
    this.results = loadJSON(this.jsonFile, (data) => {
      this.results = data.results; // Načtení výsledků
    });
  }

  // Uložení výsledků zpět do souboru JSON (pouze simulace, skutečný zápis na server vyžaduje backend)
  saveResults() {
    let data = { results: this.results };
    saveJSON(data, this.jsonFile); // Toto uloží JSON soubor na lokální disk (simulace)
  }

  // Přidání nového výsledku hráče
  addResult(playerName, energy, time) {
    const newResult = { playerName, energy, time };
    this.results.push(newResult);
    this.results.sort((a, b) => a.energy - b.energy); // Seřadí hráče podle energie
    console.log(this.results);
  }

  // Vrátí top 3 hráče
  getTopThreePlayers() {
    return this.results.slice(0, 3); // První tři hráči podle spotřeby energie
  }

  // Vrátí pořadí aktuálního hráče
  getCurrentPlayerRank(playerName) {
    const index = this.results.findIndex(
      (result) => result.playerName === playerName
    );
    if (index === -1) {
      return null; // Hráč není nalezen
    }
    return index + 1; // Pořadí hráče (index +1, protože indexy začínají na 0)
  }
}
