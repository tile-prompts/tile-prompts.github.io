//Todo: make role tiles always first within a character panel
//Todo: add quick reroll option to individual tiles
//Todo: fix character reroll button
//Todo: set up a marvel.set, an anime.set, a video-games.set
//Todo: implement Sets tab of setup panel and the ability to toggle sets on and off, adding/removing them from the drawpiles
//Todo: create all the .set files for situations, places, and tasks
/*Todo: Give meta panel a top-tab similar to char-tab, with the same buttons, but its add-tile dropdown
        will have "+ Place", "+ Task", and "+ Situation"
*/
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

const charactersRoot = document.querySelector("#characters");
const clearTilesBtn = document.querySelector("#btn-clear-tiles");

let lastActiveCharPanel = null;

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

function enableSmoothHorizontalScroll(element) {
  let targetScroll = element.scrollLeft;
  let isAnimating = false;

  function animate() {
    if (!isAnimating) return;

    const current = element.scrollLeft;
    const delta = (targetScroll - current) * 0.15;

    if (Math.abs(delta) < 0.5) {
      element.scrollLeft = targetScroll;
      isAnimating = false;
      return;
    }

    element.scrollLeft += delta;
    requestAnimationFrame(animate);
  }

  element.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();

      targetScroll += event.deltaY;
      targetScroll = Math.max(
        0,
        Math.min(targetScroll, element.scrollWidth - element.clientWidth)
      );

      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animate);
      }
    },
    { passive: false }
  );
}

enableSmoothHorizontalScroll(charactersRoot);

function getActiveCharacterPanel() {
  if (lastActiveCharPanel && lastActiveCharPanel.isConnected) return lastActiveCharPanel;
  const first = charactersRoot.querySelector(".panel.char");
  return first || null;
}

function setActiveCharacterPanel(panel) {
  if (!panel) return;
  lastActiveCharPanel = panel;
}

function getTileHolder(panel) {
  if (!panel) return null;
  return panel.querySelector(".tile-holder");
}

function getFirstTraitTileNodeIn(holder) {
  if (!holder) return null;
  return holder.querySelector(".trait-tile");
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

function addRoleTileToPanel(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;

  const phrase = pickRandomRole();
  if (!phrase) return;

  const tile = document.createElement("div");
  tile.className = "role tile";
  tile.textContent = phrase;

  const firstTraitTile = getFirstTraitTileNodeIn(holder);
  if (firstTraitTile) holder.insertBefore(tile, firstTraitTile);
  else holder.appendChild(tile);

  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function addTraitTileToPanel(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;

  const phrase = pickRandomTrait();
  if (!phrase) return;

  const tile = document.createElement("div");
  tile.className = "trait tile";
  tile.textContent = phrase;

  holder.appendChild(tile);

  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function discardTilesOfType(holder, className) {
  const tiles = Array.from(holder.querySelectorAll("." + className));
  tiles.forEach(t => t.remove());
  return tiles.length;
}

function clearPanelTilesAndRefill(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;

  const tiles = Array.from(holder.children);
  tiles.forEach(tile => tile.remove());

  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function clearPanelTilesAndDiscard(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;

  discardTilesOfType(holder, "role-tile");
  discardTilesOfType(holder, "trait-tile");

  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function clearAllTilesAndRefill() {
  const panels = Array.from(charactersRoot.querySelectorAll(".panel.char"));
  panels.forEach(p => clearPanelTilesAndRefill(p));

  refillRoleDrawPile();
  refillTraitDrawPile();

  updateRerollButtons();
  updateAllCharAddDropdownButtons();
}

function rerollCharacter(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;

  const roleCount = holder.querySelectorAll(".role-tile").length;
  const traitCount = holder.querySelectorAll(".trait-tile").length;

  if (roleCount === 0 && traitCount === 0) return;

  if (roleDrawPile.length < roleCount || traitDrawPile.length < traitCount) {
    updateRerollButtons();
    updateCharAddDropdownButtons(panel);
    return;
  }

  discardTilesOfType(holder, "role-tile");
  discardTilesOfType(holder, "trait-tile");

  for (let i = 0; i < roleCount; i++) addRoleTileToPanel(panel);
  for (let i = 0; i < traitCount; i++) addTraitTileToPanel(panel);

  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function updateRerollButtons() {
  const panels = charactersRoot.querySelectorAll(".panel.char");

  panels.forEach(panel => {
    const holder = getTileHolder(panel);
    const rerollBtn = panel.querySelector(".char-reroll");
    if (!holder || !rerollBtn) return;

    const roleCount = holder.querySelectorAll(".role-tile").length;
    const traitCount = holder.querySelectorAll(".trait-tile").length;

    const canReroll =
      roleDrawPile.length >= roleCount &&
      traitDrawPile.length >= traitCount;

    rerollBtn.disabled = !canReroll;
  });
}

function deleteCharacter(panel) {
  if (!panel) return;
  closeAllCharDropdowns();
  clearPanelTilesAndRefill(panel);
  panel.remove();

  if (lastActiveCharPanel === panel) lastActiveCharPanel = null;

  const remaining = charactersRoot.querySelectorAll(".panel.char");
  if (remaining.length === 0) {
    const addPanel = charactersRoot.querySelector(".panel.add");
    if (addPanel) addPanel.scrollIntoView({ behavior: "smooth", inline: "end" });
  }

  updateRerollButtons();
  updateAllCharAddDropdownButtons();
}

function buildCharTab(nameText) {
  const tab = document.createElement("div");
  tab.className = "char-tab";

  const name = document.createElement("div");
  name.className = "char-name";
  name.innerText = nameText;
  tab.appendChild(name);

  const actions = document.createElement("div");
  actions.className = "char-actions";
  actions.setAttribute("aria-label", "Character actions");

  const reroll = document.createElement("button");
  reroll.className = "char-btn char-reroll";
  reroll.type = "button";
  reroll.setAttribute("aria-label", "Reroll character");
  reroll.textContent = "↻";

  const addTile = document.createElement("button");
  addTile.className = "char-btn char-add-tile";
  addTile.type = "button";
  addTile.setAttribute("aria-label", "Add tile");
  addTile.textContent = "+";

  const clear = document.createElement("button");
  clear.className = "char-btn char-clear";
  clear.type = "button";
  clear.setAttribute("aria-label", "Clear character tiles");
  clear.textContent = "✕";

  const del = document.createElement("button");
  del.className = "char-btn char-delete";
  del.type = "button";
  del.setAttribute("aria-label", "Delete character");
  del.textContent = "🗑";

  actions.appendChild(reroll);
  actions.appendChild(addTile);
  actions.appendChild(clear);
  actions.appendChild(del);

  tab.appendChild(actions);
  return tab;
}

function buildCharacterPanel(index) {
  const newCharacterPanel = document.createElement("section");
  newCharacterPanel.className = "panel char";
  newCharacterPanel.setAttribute("aria-label", `Character Panel ${index}`);

  const tab = buildCharTab(`Character ${index}`);
  newCharacterPanel.appendChild(tab);

  const inner = document.createElement("div");
  inner.className = "character-inner tile-holder";
  newCharacterPanel.appendChild(inner);

  return newCharacterPanel;
}

function closeAllCharDropdowns() {
  const dropdowns = document.querySelectorAll(".char-dropdown");
  dropdowns.forEach(d => d.remove());
}

function updateAllCharAddDropdownButtons() {
  const panels = charactersRoot.querySelectorAll(".panel.char");
  panels.forEach(p => updateCharAddDropdownButtons(p));
}

function updateCharAddDropdownButtons(panel) {
  const dropdown = panel.querySelector(".char-dropdown");
  if (!dropdown) return;

  const traitOption = dropdown.querySelector('[data-option="trait"]');
  const roleOption = dropdown.querySelector('[data-option="role"]');

  if (traitOption) traitOption.disabled = traitDrawPile.length === 0;
  if (roleOption) roleOption.disabled = roleDrawPile.length === 0;
}

function openCharAddDropdown(panel, btn) {
  const tab = panel.querySelector(".char-tab");
  if (!tab) return;

  closeAllCharDropdowns();

  const dropdown = document.createElement("div");
  dropdown.className = "char-dropdown";

  const traitOption = document.createElement("button");
  traitOption.type = "button";
  traitOption.className = "char-dropdown-item";
  traitOption.textContent = "+ Trait";
  traitOption.dataset.option = "trait";
  traitOption.disabled = traitDrawPile.length === 0;

  const roleOption = document.createElement("button");
  roleOption.type = "button";
  roleOption.className = "char-dropdown-item";
  roleOption.textContent = "+ Role";
  roleOption.dataset.option = "role";
  roleOption.disabled = roleDrawPile.length === 0;

  traitOption.addEventListener("click", () => {
    closeAllCharDropdowns();
    addTraitTileToPanel(panel);
  });

  roleOption.addEventListener("click", () => {
    closeAllCharDropdowns();
    addRoleTileToPanel(panel);
  });

  dropdown.appendChild(roleOption);
  dropdown.appendChild(traitOption);

  tab.appendChild(dropdown);

  const tabRect = tab.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  const centerX = btnRect.left + btnRect.width / 2;
  const leftPx = centerX - tabRect.left;

  dropdown.style.left = leftPx + "px";
}

document.addEventListener("click", (e) => {
  const inDropdown = e.target.closest(".char-dropdown");
  const inAddBtn = e.target.closest(".char-add-tile");
  if (inDropdown || inAddBtn) return;
  closeAllCharDropdowns();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllCharDropdowns();
});

charactersRoot.addEventListener("click", (e) => {
  const addPanel = e.target.closest(".panel.add");
  if (addPanel) {
    closeAllCharDropdowns();
    addPanel.classList.add("is-activating");

    const index = charactersRoot.querySelectorAll(".panel.char").length + 1;
    const newCharacterPanel = buildCharacterPanel(index);

    const newAddPanel = document.createElement("section");
    newAddPanel.className = "panel add";
    newAddPanel.setAttribute("aria-label", "Add Character Panel");

    setTimeout(() => {
      charactersRoot.replaceChild(newCharacterPanel, addPanel);
      charactersRoot.appendChild(newAddPanel);
      setActiveCharacterPanel(newCharacterPanel);
      updateRerollButtons();
      updateAllCharAddDropdownButtons();
    }, 180);

    return;
  }

  const clickedCharPanel = e.target.closest(".panel.char");
  if (clickedCharPanel) setActiveCharacterPanel(clickedCharPanel);

  const rerollBtn = e.target.closest(".char-reroll");
  if (rerollBtn) {
    closeAllCharDropdowns();
    const panel = rerollBtn.closest(".panel.char");
    if (panel) {
      setActiveCharacterPanel(panel);
      rerollCharacter(panel);
    }
    return;
  }

  const addTileBtn = e.target.closest(".char-add-tile");
  if (addTileBtn) {
    const panel = addTileBtn.closest(".panel.char");
    if (panel) {
      setActiveCharacterPanel(panel);
      const existing = panel.querySelector(".char-dropdown");
      if (existing) closeAllCharDropdowns();
      else openCharAddDropdown(panel, addTileBtn);
    }
    return;
  }

  const clearBtn = e.target.closest(".char-clear");
  if (clearBtn) {
    closeAllCharDropdowns();
    const panel = clearBtn.closest(".panel.char");
    if (panel) {
      setActiveCharacterPanel(panel);
      clearPanelTilesAndDiscard(panel);
    }
    return;
  }

  const deleteBtn = e.target.closest(".char-delete");
  if (deleteBtn) {
    closeAllCharDropdowns();
    const panel = deleteBtn.closest(".panel.char");
    if (panel) deleteCharacter(panel);
    return;
  }
});

function commitCharNameEdit(nameEl, inputEl) {
  const value = (inputEl.value || "").trim();
  inputEl.remove();
  nameEl.textContent = value || "Character";
  nameEl.dataset.editing = "";
}

function cancelCharNameEdit(nameEl, inputEl, previousValue) {
  inputEl.remove();
  nameEl.textContent = previousValue || "Character";
  nameEl.dataset.editing = "";
}

document.addEventListener("click", e => {
  const tile = e.target.closest(".tile");
  if (!tile) return;

  tile.remove();
});

charactersRoot.addEventListener("click", (e) => {
  const nameEl = e.target.closest(".char-name");
  if (!nameEl) return;

  const charPanel = nameEl.closest(".panel.char");
  if (!charPanel) return;

  if (nameEl.dataset.editing === "true") return;

  const currentlyEditing = charactersRoot.querySelector('.char-name[data-editing="true"]');
  if (currentlyEditing) {
    const existingInput = currentlyEditing.querySelector("input");
    if (existingInput) commitCharNameEdit(currentlyEditing, existingInput);
  }

  const previousValue = nameEl.textContent.trim();
  nameEl.textContent = "";
  nameEl.dataset.editing = "true";

  const input = document.createElement("input");
  input.type = "text";
  input.value = previousValue;
  input.className = "char-name-input";

  nameEl.appendChild(input);
  input.focus();
  input.select();

  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      commitCharNameEdit(nameEl, input);
      return;
    }
    if (ev.key === "Escape") {
      cancelCharNameEdit(nameEl, input, previousValue);
    }
  });

  input.addEventListener("blur", () => {
    if (!input.isConnected) return;
    commitCharNameEdit(nameEl, input);
  });
});

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
  updater.addEventListener("change", (event) => {
    const isChecked = event.target.checked;
    const chars = updater.dataset.chars;

    if (isChecked) activePowerTiers = chars + activePowerTiers;
    else activePowerTiers = activePowerTiers.replaceAll(chars, "");

    updateActiveRoles();
    refillRoleDrawPile();

    updateActiveTraits();
    refillTraitDrawPile();

    closeAllCharDropdowns();
    updateRerollButtons();
    updateAllCharAddDropdownButtons();
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

clearTilesBtn.addEventListener("click", () => {
  closeAllCharDropdowns();
  clearAllTilesAndRefill();
});

(async () => {
  await loadRoleSets();
  updateActiveRoles();
  refillRoleDrawPile();

  await loadTraitSets();
  updateActiveTraits();
  refillTraitDrawPile();

  updateRerollButtons();
  updateAllCharAddDropdownButtons();
})();

setActive("setup");