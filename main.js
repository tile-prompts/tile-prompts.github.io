const menuTabs = Array.from(document.querySelectorAll(".panel-tab"));
const menus = Array.from(document.querySelectorAll(".menu"));

const roles = new Map();
let activeRoleSets = ["standard", "bonus"];
let activeRoles = [];
let roleDrawPile = [];

const traits = new Map();
let activeTraitSets = ["standard"];
let activeTraits = [];
let traitDrawPile = [];

const situations = new Map();
let activeSituationSets = ["standard"];
let activeSituations = [];
let situationDrawPile = [];

const places = new Map();
let activePlaceSets = ["standard"];
let activePlaces = [];
let placeDrawPile = [];

const tasks = new Map();
let activeTaskSets = ["standard"];
let activeTasks = [];
let taskDrawPile = [];

let activePowerTiers = "<-=+>";
let allowPlace = true;
let allowTask = true;

const charactersRoot = document.querySelector("#characters");
const clearTilesBtn = document.querySelector("#btn-clear-tiles");
const togglePlaceEl = document.querySelector("#toggle-place");
const toggleTaskEl = document.querySelector("#toggle-task");

const setsRoleList = document.querySelector("#sets-role");
const setsTraitList = document.querySelector("#sets-trait");
const setsSituationList = document.querySelector("#sets-situation");
const setsPlaceList = document.querySelector("#sets-place");
const setsTaskList = document.querySelector("#sets-task");

const metaPanel = document.querySelector("#meta-panel");
const metaHolder = document.querySelector("#meta-holder");


function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

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
      targetScroll = Math.max(0, Math.min(targetScroll, element.scrollWidth - element.clientWidth));

      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animate);
      }
    },
    { passive: false }
  );
}

enableSmoothHorizontalScroll(charactersRoot);

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function parseSetEntries(text) {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !l.startsWith("#"));
}

function buildActiveFromSets(map, activeSetNames) {
  const out = [];
  activeSetNames.forEach(setName => {
    const set = map.get(setName) || [];
    set.forEach(s => {
      if (s && activePowerTiers.includes(s[0])) out.push(s.slice(1));
    });
  });
  return out;
}

function rebuildRolePools() {
  activeRoles = buildActiveFromSets(roles, activeRoleSets);
  roleDrawPile = [...activeRoles];
  shuffle(roleDrawPile);
}

function rebuildTraitPools() {
  activeTraits = buildActiveFromSets(traits, activeTraitSets);
  traitDrawPile = [...activeTraits];
  shuffle(traitDrawPile);
}

function rebuildSituationPools() {
  activeSituations = buildActiveFromSets(situations, activeSituationSets);
  situationDrawPile = [...activeSituations];
  shuffle(situationDrawPile);
}

function rebuildPlacePools() {
  activePlaces = buildActiveFromSets(places, activePlaceSets);
  placeDrawPile = [...activePlaces];
  shuffle(placeDrawPile);
}

function rebuildTaskPools() {
  activeTasks = buildActiveFromSets(tasks, activeTaskSets);
  taskDrawPile = [...activeTasks];
  shuffle(taskDrawPile);
}

function rebuildAllPools() {
  rebuildRolePools();
  rebuildTraitPools();
  rebuildSituationPools();
  rebuildPlacePools();
  rebuildTaskPools();
}

function takeFromPile(activeList, pile) {
  if (!activeList || activeList.length === 0) return null;
  const v = pile.pop();
  return v === undefined ? null : v;
}

function createTile(type, phrase) {
  const tile = document.createElement("div");
  tile.className = `tile ${type}`;
  tile.textContent = phrase;
  return tile;
}

function countTiles(holder, type) {
  return holder.querySelectorAll(`.tile.${type}`).length;
}

function discardTiles(holder, type) {
  const tiles = Array.from(holder.querySelectorAll(`.tile.${type}`));
  tiles.forEach(t => t.remove());
  return tiles.length;
}

let lastActiveCharPanel = null;

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

function addRoleTileToPanel(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;
  const phrase = takeFromPile(activeRoles, roleDrawPile);
  if (!phrase) return;
  const tile = createTile("role", phrase);
  const firstTraitTile = holder.querySelector(".tile.trait");
  if (firstTraitTile) holder.insertBefore(tile, firstTraitTile);
  else holder.appendChild(tile);
  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function addTraitTileToPanel(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;
  const phrase = takeFromPile(activeTraits, traitDrawPile);
  if (!phrase) return;
  const tile = createTile("trait", phrase);
  holder.appendChild(tile);
  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function clearCharacterTilesDiscard(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;
  discardTiles(holder, "role");
  discardTiles(holder, "trait");
  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function clearCharacterTilesRefill(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;
  Array.from(holder.querySelectorAll(".tile")).forEach(t => t.remove());
  updateRerollButtons();
  updateCharAddDropdownButtons(panel);
}

function rerollCharacter(panel) {
  const holder = getTileHolder(panel);
  if (!holder) return;

  const roleCount = countTiles(holder, "role");
  const traitCount = countTiles(holder, "trait");

  if (roleCount === 0 && traitCount === 0) {
    updateRerollButtons();
    updateCharAddDropdownButtons(panel);
    return;
  }

  if (roleDrawPile.length < roleCount || traitDrawPile.length < traitCount) {
    updateRerollButtons();
    updateCharAddDropdownButtons(panel);
    return;
  }

  discardTiles(holder, "role");
  discardTiles(holder, "trait");

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

    const roleCount = countTiles(holder, "role");
    const traitCount = countTiles(holder, "trait");
    const hasTiles = roleCount + traitCount > 0;
    const canReroll = hasTiles && roleDrawPile.length >= roleCount && traitDrawPile.length >= traitCount;
    rerollBtn.disabled = !canReroll;
  });
}

function deleteCharacter(panel) {
  if (!panel) return;
  closeAllDropdowns();
  clearCharacterTilesRefill(panel);
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

function closeAllDropdowns() {
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

  closeAllDropdowns();

  const dropdown = document.createElement("div");
  dropdown.className = "char-dropdown";

  const roleOption = document.createElement("button");
  roleOption.type = "button";
  roleOption.className = "char-dropdown-item";
  roleOption.textContent = "+ Role";
  roleOption.dataset.option = "role";
  roleOption.disabled = roleDrawPile.length === 0;

  const traitOption = document.createElement("button");
  traitOption.type = "button";
  traitOption.className = "char-dropdown-item";
  traitOption.textContent = "+ Trait";
  traitOption.dataset.option = "trait";
  traitOption.disabled = traitDrawPile.length === 0;

  roleOption.addEventListener("click", () => {
    closeAllDropdowns();
    addRoleTileToPanel(panel);
  });

  traitOption.addEventListener("click", () => {
    closeAllDropdowns();
    addTraitTileToPanel(panel);
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

document.addEventListener("click", (e) => {
  const inDropdown = e.target.closest(".char-dropdown");
  const inAddBtn = e.target.closest(".char-add-tile") || e.target.closest(".meta-add-tile");
  if (inDropdown || inAddBtn) return;
  closeAllDropdowns();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDropdowns();
});

charactersRoot.addEventListener("click", (e) => {
  const addPanel = e.target.closest(".panel.add");
  if (addPanel) {
    closeAllDropdowns();
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
    closeAllDropdowns();
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
      if (existing) closeAllDropdowns();
      else openCharAddDropdown(panel, addTileBtn);
    }
    return;
  }

  const clearBtn = e.target.closest(".char-clear");
  if (clearBtn) {
    closeAllDropdowns();
    const panel = clearBtn.closest(".panel.char");
    if (panel) {
      setActiveCharacterPanel(panel);
      clearCharacterTilesDiscard(panel);
    }
    return;
  }

  const deleteBtn = e.target.closest(".char-delete");
  if (deleteBtn) {
    closeAllDropdowns();
    const panel = deleteBtn.closest(".panel.char");
    if (panel) deleteCharacter(panel);
    return;
  }
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

function getTileType(tile) {
  if (tile.classList.contains("role")) return "role";
  if (tile.classList.contains("trait")) return "trait";
  if (tile.classList.contains("situation")) return "situation";
  if (tile.classList.contains("place")) return "place";
  if (tile.classList.contains("task")) return "task";
  return null;
}

function rerollSingleTile(tile) {
  const type = getTileType(tile);
  if (!type) return;

  let phrase = null;
  if (type === "role") phrase = takeFromPile(activeRoles, roleDrawPile);
  if (type === "trait") phrase = takeFromPile(activeTraits, traitDrawPile);
  if (type === "situation") phrase = takeFromPile(activeSituations, situationDrawPile);
  if (type === "place") phrase = takeFromPile(activePlaces, placeDrawPile);
  if (type === "task") phrase = takeFromPile(activeTasks, taskDrawPile);
  if (!phrase) return;

  tile.textContent = phrase;
  updateRerollButtons();
  updateAllCharAddDropdownButtons();
  updateMetaUI();
}

document.addEventListener("contextmenu", (e) => {
  const tile = e.target.closest(".tile");
  if (!tile) return;
  e.preventDefault();
  rerollSingleTile(tile);
});

document.addEventListener("click", (e) => {
  const tile = e.target.closest(".tile");
  if (!tile) return;
  tile.remove();
  updateRerollButtons();
  updateAllCharAddDropdownButtons();
  updateMetaUI();
});

function addSituationTileToMeta() {
  const phrase = takeFromPile(activeSituations, situationDrawPile);
  if (!phrase) return;
  const tile = createTile("situation", phrase);
  metaHolder.appendChild(tile);
  updateMetaUI();
}

function addPlaceTileToMeta() {
  if (!allowPlace) return;
  const phrase = takeFromPile(activePlaces, placeDrawPile);
  if (!phrase) return;
  const existing = metaHolder.querySelector(".tile.place");
  if (existing) existing.remove();
  const tile = createTile("place", phrase);
  const taskTile = metaHolder.querySelector(".tile.task");
  if (taskTile) metaHolder.insertBefore(tile, taskTile);
  else {
    const firstSituation = metaHolder.querySelector(".tile.situation");
    if (firstSituation) metaHolder.insertBefore(tile, firstSituation);
    else metaHolder.appendChild(tile);
  }
  updateMetaUI();
}

function addTaskTileToMeta() {
  if (!allowTask) return;
  const phrase = takeFromPile(activeTasks, taskDrawPile);
  if (!phrase) return;
  const existing = metaHolder.querySelector(".tile.task");
  if (existing) existing.remove();
  const tile = createTile("task", phrase);
  const firstSituation = metaHolder.querySelector(".tile.situation");
  if (firstSituation) metaHolder.insertBefore(tile, firstSituation);
  else metaHolder.appendChild(tile);
  const placeTile = metaHolder.querySelector(".tile.place");
  if (placeTile) metaHolder.insertBefore(placeTile, tile);
  updateMetaUI();
}

function clearMetaDiscard() {
  Array.from(metaHolder.querySelectorAll(".tile")).forEach(t => t.remove());
  updateMetaUI();
}

function resetMeta() {
  clearMetaDiscard();
  rebuildSituationPools();
  rebuildPlacePools();
  rebuildTaskPools();
  updateMetaUI();
}

function rerollMeta() {
  const placeCount = allowPlace ? countTiles(metaHolder, "place") : 0;
  const taskCount = allowTask ? countTiles(metaHolder, "task") : 0;
  const situationCount = countTiles(metaHolder, "situation");

  const hasTiles = placeCount + taskCount + situationCount > 0;
  if (!hasTiles) {
    updateMetaUI();
    return;
  }

  if (
    placeDrawPile.length < placeCount ||
    taskDrawPile.length < taskCount ||
    situationDrawPile.length < situationCount
  ) {
    updateMetaUI();
    return;
  }

  if (placeCount) addPlaceTileToMeta();
  if (taskCount) addTaskTileToMeta();

  const situationTiles = Array.from(metaHolder.querySelectorAll(".tile.situation"));
  situationTiles.forEach(t => rerollSingleTile(t));

  updateMetaUI();
}

function updateMetaUI() {
  const rerollBtn = metaPanel.querySelector(".meta-reroll");
  const dropdown = metaPanel.querySelector(".char-dropdown");

  const placeCount = allowPlace ? countTiles(metaHolder, "place") : 0;
  const taskCount = allowTask ? countTiles(metaHolder, "task") : 0;
  const situationCount = countTiles(metaHolder, "situation");

  const hasTiles = placeCount + taskCount + situationCount > 0;
  const canReroll =
    hasTiles &&
    placeDrawPile.length >= placeCount &&
    taskDrawPile.length >= taskCount &&
    situationDrawPile.length >= situationCount;

  if (rerollBtn) rerollBtn.disabled = !canReroll;

  if (dropdown) {
    const placeOption = dropdown.querySelector('[data-option="place"]');
    const taskOption = dropdown.querySelector('[data-option="task"]');
    const situationOption = dropdown.querySelector('[data-option="situation"]');

    if (placeOption) placeOption.disabled = !allowPlace || placeDrawPile.length === 0;
    if (taskOption) taskOption.disabled = !allowTask || taskDrawPile.length === 0;
    if (situationOption) situationOption.disabled = situationDrawPile.length === 0;
  }
}

function openMetaAddDropdown(btn) {
  const tab = metaPanel.querySelector(".meta-tab");
  if (!tab) return;

  closeAllDropdowns();

  const dropdown = document.createElement("div");
  dropdown.className = "char-dropdown";

  const placeOption = document.createElement("button");
  placeOption.type = "button";
  placeOption.className = "char-dropdown-item";
  placeOption.textContent = "+ Place";
  placeOption.dataset.option = "place";
  placeOption.disabled = !allowPlace || placeDrawPile.length === 0;

  const taskOption = document.createElement("button");
  taskOption.type = "button";
  taskOption.className = "char-dropdown-item";
  taskOption.textContent = "+ Task";
  taskOption.dataset.option = "task";
  taskOption.disabled = !allowTask || taskDrawPile.length === 0;

  const situationOption = document.createElement("button");
  situationOption.type = "button";
  situationOption.className = "char-dropdown-item";
  situationOption.textContent = "+ Situation";
  situationOption.dataset.option = "situation";
  situationOption.disabled = situationDrawPile.length === 0;

  placeOption.addEventListener("click", () => {
    closeAllDropdowns();
    addPlaceTileToMeta();
  });

  taskOption.addEventListener("click", () => {
    closeAllDropdowns();
    addTaskTileToMeta();
  });

  situationOption.addEventListener("click", () => {
    closeAllDropdowns();
    addSituationTileToMeta();
  });

  dropdown.appendChild(placeOption);
  dropdown.appendChild(taskOption);
  dropdown.appendChild(situationOption);
  tab.appendChild(dropdown);

  const tabRect = tab.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  const centerX = btnRect.left + btnRect.width / 2;
  const leftPx = centerX - tabRect.left;
  dropdown.style.left = leftPx + "px";
}

document.querySelector("#meta").addEventListener("click", (e) => {
  const rerollBtn = e.target.closest(".meta-reroll");
  if (rerollBtn) {
    closeAllDropdowns();
    rerollMeta();
    return;
  }

  const addBtn = e.target.closest(".meta-add-tile");
  if (addBtn) {
    const existing = metaPanel.querySelector(".char-dropdown");
    if (existing) closeAllDropdowns();
    else openMetaAddDropdown(addBtn);
    return;
  }

  const clearBtn = e.target.closest(".meta-clear");
  if (clearBtn) {
    closeAllDropdowns();
    clearMetaDiscard();
    return;
  }

  const delBtn = e.target.closest(".meta-delete");
  if (delBtn) {
    closeAllDropdowns();
    resetMeta();
    return;
  }
});

function clearMetaRefill() {
  Array.from(metaHolder.querySelectorAll(".tile")).forEach(t => t.remove());
}

function clearAllTilesAndRefill() {
  closeAllDropdowns();
  const panels = charactersRoot.querySelectorAll(".panel.char");
  panels.forEach(panel => clearCharacterTilesRefill(panel));
  clearMetaRefill();
  rebuildAllPools();
  updateRerollButtons();
  updateAllCharAddDropdownButtons();
  updateMetaUI();
}

function buildSetCheckbox(listEl, setName, activeSetNames, onChange) {
  const li = document.createElement("li");
  const label = document.createElement("label");
  label.className = "menu-item checkbox";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = activeSetNames.includes(setName);

  const box = document.createElement("span");
  box.className = "box";
  box.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.className = "label-text";
  text.textContent = setName;

  label.appendChild(input);
  label.appendChild(box);
  label.appendChild(text);
  li.appendChild(label);
  listEl.appendChild(li);

  input.addEventListener("change", (e) => {
    const checked = e.target.checked;
    const idx = activeSetNames.indexOf(setName);
    if (checked && idx === -1) activeSetNames.push(setName);
    if (!checked && idx !== -1) activeSetNames.splice(idx, 1);
    onChange();
  });
}

function rebuildSetMenu(listEl, map, activeSetNames, onChange) {
  while (listEl.children.length > 1) listEl.removeChild(listEl.lastChild);
  const setNames = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
  setNames.forEach(setName => buildSetCheckbox(listEl, setName, activeSetNames, onChange));
}

function buildSetsMenus() {
  rebuildSetMenu(setsRoleList, roles, activeRoleSets, () => {
    rebuildRolePools();
    updateRerollButtons();
    updateAllCharAddDropdownButtons();
  });

  rebuildSetMenu(setsTraitList, traits, activeTraitSets, () => {
    rebuildTraitPools();
    updateRerollButtons();
    updateAllCharAddDropdownButtons();
  });

  rebuildSetMenu(setsSituationList, situations, activeSituationSets, () => {
    rebuildSituationPools();
    updateMetaUI();
  });

  rebuildSetMenu(setsPlaceList, places, activePlaceSets, () => {
    rebuildPlacePools();
    updateMetaUI();
  });

  rebuildSetMenu(setsTaskList, tasks, activeTaskSets, () => {
    rebuildTaskPools();
    updateMetaUI();
  });
}

async function loadSetsInto(map, folder) {
  const manifestRes = await fetch(`${folder}/index.json`);
  const files = await manifestRes.json();

  for (const file of files) {
    const res = await fetch(`${folder}/${file}`);
    const text = await res.text();
    const setName = file.replace(/\.set$/, "");
    map.set(setName, parseSetEntries(text));
  }
}

const powerTierUpdaters = document.querySelectorAll(".update-power-tiers");

powerTierUpdaters.forEach(updater => {
  updater.addEventListener("click", (event) => {
    let count = 0;
    powerTierUpdaters.forEach(checkbox => {
      if (checkbox.checked) count++;
    });
    if (count === 0) event.preventDefault();
  });
});

powerTierUpdaters.forEach(updater => {
  updater.addEventListener("change", (event) => {
    const isChecked = event.target.checked;
    const chars = updater.dataset.chars;

    if (isChecked) activePowerTiers = chars + activePowerTiers;
    else activePowerTiers = activePowerTiers.replaceAll(chars, "");

    rebuildAllPools();

    closeAllDropdowns();
    updateRerollButtons();
    updateAllCharAddDropdownButtons();
    updateMetaUI();
  });
});

togglePlaceEl.addEventListener("change", (e) => {
  allowPlace = e.target.checked;
  if (!allowPlace) discardTiles(metaHolder, "place");
  closeAllDropdowns();
  updateMetaUI();
});

toggleTaskEl.addEventListener("change", (e) => {
  allowTask = e.target.checked;
  if (!allowTask) discardTiles(metaHolder, "task");
  closeAllDropdowns();
  updateMetaUI();
});

clearTilesBtn.addEventListener("click", () => {
  clearAllTilesAndRefill();
});

(async () => {
  await loadSetsInto(roles, "roles");
  await loadSetsInto(traits, "traits");
  await loadSetsInto(situations, "situations");
  await loadSetsInto(places, "places");
  await loadSetsInto(tasks, "tasks");

  allowPlace = togglePlaceEl.checked;
  allowTask = toggleTaskEl.checked;

  rebuildAllPools();
  buildSetsMenus();

  updateRerollButtons();
  updateAllCharAddDropdownButtons();
  updateMetaUI();
})();

document.addEventListener("keydown", (event) => {
  console.log("key:", event.key);
  console.log("code:", event.code);

  if (event.code === "Backquote") {
    console.log("Backquote pressed");

    activeTraits.forEach(trait => console.log(trait));
    activeRoles.forEach(role => console.log(role));
    activeSituations.forEach(situation => console.log(situation));
    activeTasks.forEach(task => console.log(task));
    activePlaces.forEach(place => console.log(place));
  }
});

setActive("setup");
