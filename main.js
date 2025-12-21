const menuTabs = Array.from(document.querySelectorAll(".panel-tab"));
const menus = Array.from(document.querySelectorAll(".menu"));

const roles = new Map();
let activeRoles = [];
let roleDrawPile = [];
let activeRoleSets = ["standard", "bonus"];

const traits = new Map();
let activeTraits = [];
let traitDrawPile = [];
let activeTraitSets = ["standard", "bonus"];

let activePowerTiers = "<-=+>";

const addRoleBtn = document.querySelector("#btn-add-role");
const addTraitBtn = document.querySelector("#btn-add-trait");
const tilesRoot = document.querySelector("#tiles");

function setActive(tabName) {
  menuTabs.forEach(t => {
    const active = t.dataset.tab === tabName;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });

  menus.forEach(m => {
    const active = m.id === "menu-" + tabName;
    m.classList.toggle("is-active", active);
    m.hidden = !active;
  });
}

menuTabs.forEach(t => {
  t.addEventListener("click", () => setActive(t.dataset.tab));
});

function getFirstTraitTileNode() {
  return tilesRoot.querySelector(".trait-tile");
}

function updateActiveRoles() {
  activeRoles = [];
  activeRoleSets.forEach(setName => {
    const set = roles.get(setName) || [];
    const filteredSet = set
      .filter(s => s && activePowerTiers.includes(s[0]))
      .map(s => s.slice(1));
    activeRoles.push(...filteredSet);
  });
}

function refillRoleDrawPile() {
  roleDrawPile = [...activeRoles];
  shuffleRoleDrawPile();
}

function shuffleRoleDrawPile() {
  for (let i = roleDrawPile.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roleDrawPile[i], roleDrawPile[j]] = [roleDrawPile[j], roleDrawPile[i]];
  }
}

function pickRandomRole() {
  if (!activeRoles || activeRoles.length === 0) return null;
  return roleDrawPile.pop();
}

function returnRoleToPile(role) {
  if (!roleDrawPile.includes(role) && activeRoles.includes(role)) {
    roleDrawPile.push(role);
  }
}

function addRoleTile() {
  const phrase = pickRandomRole();
  if (!phrase) return;

  const tile = document.createElement("div");
  tile.className = "role-tile";
  tile.textContent = phrase;

  const firstTraitTile = getFirstTraitTileNode();
  if (firstTraitTile) {
    tilesRoot.insertBefore(tile, firstTraitTile);
  } else {
    tilesRoot.appendChild(tile);
  }

  updateRoleButtonState();
}

function updateRoleButtonState() {
  addRoleBtn.disabled = roleDrawPile.length === 0;
}

addRoleBtn.addEventListener("click", addRoleTile);

function updateActiveTraits() {
  activeTraits = [];
  activeTraitSets.forEach(setName => {
    const set = traits.get(setName) || [];
    const filteredSet = set
      .filter(s => s && activePowerTiers.includes(s[0]))
      .map(s => s.slice(1));
    activeTraits.push(...filteredSet);
  });
}

function refillTraitDrawPile() {
  traitDrawPile = [...activeTraits];
  shuffleTraitDrawPile();
}

function shuffleTraitDrawPile() {
  for (let i = traitDrawPile.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [traitDrawPile[i], traitDrawPile[j]] = [traitDrawPile[j], traitDrawPile[i]];
  }
}

function pickRandomTrait() {
  if (!activeTraits || activeTraits.length === 0) return null;
  return traitDrawPile.pop();
}

function returnTraitToPile(trait) {
  if (!traitDrawPile.includes(trait) && activeTraits.includes(trait)) {
    traitDrawPile.push(trait);
  }
}

function addTraitTile() {
  const phrase = pickRandomTrait();
  if (!phrase) return;

  const tile = document.createElement("div");
  tile.className = "trait-tile";
  tile.textContent = phrase;

  tilesRoot.appendChild(tile);

  updateTraitButtonState();
}

function updateTraitButtonState() {
  addTraitBtn.disabled = traitDrawPile.length === 0;
}

addTraitBtn.addEventListener("click", addTraitTile);

const tierUpdaters = document.querySelectorAll(".update-role-tiers");

tierUpdaters.forEach(updater => {
  updater.addEventListener("click", (event) => {
    let count = 0;
    tierUpdaters.forEach(checkbox => {
      if (checkbox.checked) count++;
    });
    if (count === 0) event.preventDefault();
  });
});

tierUpdaters.forEach(updater => {
  updater.addEventListener("change", async (event) => {
    const isChecked = event.target.checked;
    const chars = updater.dataset.chars;

    if (isChecked) {
      activePowerTiers = chars + activePowerTiers;
    } else {
      activePowerTiers = activePowerTiers.replaceAll(chars, "");
    }

    updateActiveRoles();
    refillRoleDrawPile();
    updateRoleButtonState();

    updateActiveTraits();
    refillTraitDrawPile();
    updateTraitButtonState();
  });
});

async function loadRoleSets() {
  const manifestRes = await fetch("/roles/index.json");
  const files = await manifestRes.json();

  for (const file of files) {
    const res = await fetch(`/roles/${file}`);
    const text = await res.text();

    const setName = file.replace(/\.set$/, "");

    const entries = text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"));

    roles.set(setName, entries);
  }
}

async function loadTraitSets() {
  const manifestRes = await fetch("/traits/index.json");
  const files = await manifestRes.json();

  for (const file of files) {
    const res = await fetch(`/traits/${file}`);
    const text = await res.text();

    const setName = file.replace(/\.set$/, "");

    const entries = text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"));

    traits.set(setName, entries);
  }
}

(async () => {
  await loadRoleSets();
  updateActiveRoles();
  refillRoleDrawPile();
  updateRoleButtonState();

  await loadTraitSets();
  updateActiveTraits();
  refillTraitDrawPile();
  updateTraitButtonState();
})();

setActive("setup");
