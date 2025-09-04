// Global app state + small helpers
export const state = {
  name: "", nameMod: "",
  element: "calm", stage: "base", layout: "standard",
  youtube: "", twitch: "", instagram: "", x: "", bluesky: "",
  abilityName: "", abilityText: "",
  attackName: "", attackValue: "", attackEffect: "",
  attack2Name: "", attack2Value: "", attack2Effect: "",
  flavour: "", numXY: "", setName: "",
  rarity: "common",
  artURL: "", prevURL: "", setIconURL: "", bgStandardURL: "", nameModURL: "",
  rarityColorOverride: false,
  rarityColor: "#c9c9c9"
};

export function rarityDefaultColor(r) {
  return ({
    common:  "#c9c9c9",
    uncommon:"#8cd6ff",
    rare:    "#ffd700",
    ultra:   "#ff3b3b",
    epic:    "#b388ff",
    mythic:  "#ff9f43",
    secret:  "#2fd2c9"
  }[r] || "#c9c9c9");
}
