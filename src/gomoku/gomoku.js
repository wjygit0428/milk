(function () {
  const SIZE = 15
  const CELL = 40
  const PAD = 20
  const NAMES = { 1: '黑棋', 2: '白棋' }
  const STARS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]]

  const canvas = document.getElementById('board')
  const ctx = canvas.getContext('2d')
  const statusEl = document.getElementById('status')

  let board
  let current
  let winner
  let winLine
  let history

  function init() {
    board = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0))
    current = 1
    winner = 0
    winLine = null
    history = []
    render()
  }

  function inBoard(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE
  }

  function checkWin(r, c) {
    const player = board[r][c]
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
    for (const [dr, dc] of dirs) {
      const line = [[r, c]]
      for (const s of [1, -1]) {
        let nr = r + dr * s
        let nc = c + dc * s
        while (inBoard(nr, nc) && board[nr][nc] === player) {
          line.push([nr, nc])
          nr += dr * s
          nc += dc * s
        }
      }
      if (line.length >= 5) return line
    }
    return null
  }

  function place(r, c) {
    if (winner || !inBoard(r, c) || board[r][c]) return
    board[r][c] = current
    history.push([r, c])
    winLine = checkWin(r, c)
    if (winLine) {
      winner = current
    } else if (history.length === SIZE * SIZE) {
      winner = -1
    } else {
      current = 3 - current
    }
    render()
  }

  function undo() {
    if (!history.length) return
    const [r, c] = history.pop()
    board[r][c] = 0
    winner = 0
    winLine = null
    current = history.length % 2 === 0 ? 1 : 2
    render()
  }

  function drawStone(r, c, player) {
    const x = PAD + c * CELL
    const y = PAD + r * CELL
    const g = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, 17)
    g.addColorStop(0, player === 1 ? '#666' : '#fff')
    g.addColorStop(1, player === 1 ? '#000' : '#ccc')
    ctx.beginPath()
    ctx.arc(x, y, 17, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let i = 0; i < SIZE; i++) {
      const p = PAD + i * CELL
      ctx.beginPath()
      ctx.moveTo(PAD, p)
      ctx.lineTo(PAD + (SIZE - 1) * CELL, p)
      ctx.moveTo(p, PAD)
      ctx.lineTo(p, PAD + (SIZE - 1) * CELL)
      ctx.stroke()
    }
    ctx.fillStyle = '#333'
    for (const [r, c] of STARS) {
      ctx.beginPath()
      ctx.arc(PAD + c * CELL, PAD + r * CELL, 4, 0, Math.PI * 2)
      ctx.fill()
    }
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c]) drawStone(r, c, board[r][c])
      }
    }
    if (history.length) {
      const [r, c] = history[history.length - 1]
      ctx.strokeStyle = '#e33'
      ctx.lineWidth = 2
      ctx.strokeRect(PAD + c * CELL - 6, PAD + r * CELL - 6, 12, 12)
    }
    if (winLine) {
      ctx.strokeStyle = '#e33'
      ctx.lineWidth = 3
      for (const [r, c] of winLine) {
        ctx.beginPath()
        ctx.arc(PAD + c * CELL, PAD + r * CELL, 20, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    if (winner === -1) statusEl.textContent = '平局！'
    else if (winner) statusEl.textContent = NAMES[winner] + '获胜！'
    else statusEl.textContent = '轮到' + NAMES[current] + '落子'
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect()
    const scale = canvas.width / rect.width
    const x = (e.clientX - rect.left) * scale
    const y = (e.clientY - rect.top) * scale
    place(Math.round((y - PAD) / CELL), Math.round((x - PAD) / CELL))
  })
  document.getElementById('undo').addEventListener('click', undo)
  document.getElementById('restart').addEventListener('click', init)

  init()
})()
