// Trạng thái kết nối cơ sở dữ liệu.
// mode: 'connecting' | 'mongo' | 'memory'
// Nếu không kết nối được MongoDB, server tự chuyển sang chế độ 'memory'
// (dữ liệu mẫu trong bộ nhớ) để website vẫn hiển thị sản phẩm.

const state = { mode: 'connecting', error: null, since: Date.now() };

let resolveReady;
const ready = new Promise((resolve) => { resolveReady = resolve; });

const Db = {
  state,
  setMode(mode, err) {
    state.mode = mode;
    state.error = err ? String(err.message || err) : null;
    state.since = Date.now();
    resolveReady(mode);
  },
  async useMemory() {
    await ready;
    return state.mode === 'memory';
  }
};

module.exports = Db;
