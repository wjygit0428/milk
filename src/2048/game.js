(function () {
  const SIZE = 4;
  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const messageEl = document.getElementById('message');
  let grid, score, best = Number(localStorage.getItem('best2048')) || 0;
  let won, over;

  function newGame() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    score = 0;
    won = false;
    over = false;
    addTile();
    addTile();
    render();
  }

  function addTile() {
    const empty = [];
    grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  // 将一行向左压缩合并，返回新行与得分
  function slideRow(row) {
    const nums = row.filter(Boolean);
    const out = [];
    let gained = 0;
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] === nums[i + 1]) {
        out.push(nums[i] * 2);
        gained += nums[i] * 2;
        i++;
      } else {
        out.push(nums[i]);
      }
    }
    while (out.length < SIZE) out.push(0);
    return { row: out, gained };
  }

  function move(dir) {
    if (over) return;
    const horizontal = dir === 'left' || dir === 'right';
    const reverse = dir === 'right' || dir === 'down';
    let moved = false;
    for (let i = 0; i < SIZE; i++) {
      let line = [];
      for (let j = 0; j < SIZE; j++) {
        line.push(horizontal ? grid[i][j] : grid[j][i]);
      }
      if (reverse) line.reverse();
      const res = slideRow(line);
      score += res.gained;
      line = res.row;
      if (reverse) line.reverse();
      for (let j = 0; j < SIZE; j++) {
        const cur = horizontal ? grid[i][j] : grid[j][i];
        if (cur !== line[j]) moved = true;
        if (horizontal) grid[i][j] = line[j];
        else grid[j][i] = line[j];
      }
    }
    if (!moved) return;
    addTile();
    if (!won && grid.some((r) => r.includes(2048))) won = true;
    if (!canMove()) over = true;
    render();
  }

  function canMove() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!grid[r][c]) return true;
        if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
        if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
      }
    }
    return false;
  }

  function render() {
    boardEl.innerHTML = '';
    grid.forEach((row) => row.forEach((v) => {
      const cell = document.createElement('div');
      cell.className = 'cell' + (v ? (v > 2048 ? ' big' : ' v' + v) : '');
      cell.textContent = v || '';
      boardEl.appendChild(cell);
    }));
    if (score > best) {
      best = score;
      localStorage.setItem('best2048', best);
    }
    scoreEl.textContent = score;
    bestEl.textContent = best;
    messageEl.classList.toggle('hidden', !over && !won);
    messageEl.textContent = over ? '游戏结束!' : '你赢了!';
    if (won && !over) setTimeout(() => messageEl.classList.add('hidden'), 1500);
  }

  const keys = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
    a: 'left', d: 'right', w: 'up', s: 'down'
  };
  document.addEventListener('keydown', (e) => {
    const dir = keys[e.key];
    if (dir) {
      e.preventDefault();
      move(dir);
    }
  });

  let startX, startY;
  boardEl.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  boardEl.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
  });

  document.getElementById('restart').addEventListener('click', newGame);
  newGame();
})();
