import { useMemo, useState } from "react";
import "./App.css";

const ownerName = "彭先生";

const createItem = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  driverName: "",
  amount: "",
  note: "",
  image: "",
  imageHeight: 160,
});

const formatNumber = (value) => {
  const numberValue = Number(value) || 0;
  return numberValue.toLocaleString("zh-TW");
};

const App = () => {
  const [items, setItems] = useState([createItem()]);
  const [activeId, setActiveId] = useState(null);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [items]
  );

  const addItem = () => setItems((prev) => [...prev, createItem()]);

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      return next.length ? next : [createItem()];
    });
  };

  const handleImageChange = (id, event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateItem(id, "image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (id, event) => {
    const clipboardItems = event.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i += 1) {
      if (clipboardItems[i].type.includes("image")) {
        const blob = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => {
          updateItem(id, "image", e.target.result);
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <>
      <div className="page">
        <header className="header">
        <div>
          <h1>簽收單表格生成器</h1>
          <p>支援拖拉調整影像高度、貼上/上傳簽收單，快速產出列印表格。</p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={addItem}>
            新增一筆
          </button>
          <button type="button" className="primary" onClick={handlePrint}>
            列印表格
          </button>
        </div>
      </header>

      <section className="card">
        <div className="hint">
          提示：點擊簽收單區塊後按 <b>Ctrl + V</b>{" "}
          可直接貼上截圖；或點擊上傳圖檔。
        </div>
      </section>

      <section className="list">
        {items.map((item) => (
          <div
            key={item.id}
            className={`item ${activeId === item.id ? "active" : ""}`}
            onPaste={(event) => handlePaste(item.id, event)}
            onClick={() => setActiveId(item.id)}
            onFocus={() => setActiveId(item.id)}
            tabIndex={0}
          >
            <div>
              <div
                className="image-area"
                style={{ height: `${item.imageHeight}px` }}
              >
                {item.image ? (
                  <img src={item.image} alt="簽收單" />
                ) : (
                  <div className="placeholder">點擊上傳或 Ctrl+V 貼上</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageChange(item.id, event)}
                  title="點擊上傳圖片"
                />
              </div>
              <div className="image-actions">
                <label>影像高度</label>
                <input
                  type="range"
                  min="120"
                  max="320"
                  value={item.imageHeight}
                  onChange={(event) =>
                    updateItem(item.id, "imageHeight", Number(event.target.value))
                  }
                />
              </div>
            </div>

            <div className="fields">
              <div className="field">
                <label>司機名稱</label>
                <input
                  type="text"
                  placeholder="輸入司機姓名"
                  value={item.driverName}
                  onChange={(event) =>
                    updateItem(item.id, "driverName", event.target.value)
                  }
                />
              </div>
              <div className="field amount-input">
                <label>需收款金額</label>
                <span>NT$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.amount}
                  onChange={(event) =>
                    updateItem(item.id, "amount", event.target.value)
                  }
                />
              </div>
              <div className="field full">
                <label>備註</label>
                <textarea
                  placeholder="補充說明..."
                  value={item.note}
                  onChange={(event) =>
                    updateItem(item.id, "note", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="item-actions">
              <button type="button" onClick={() => removeItem(item.id)}>
                刪除
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="footer-bar">
        <div className="footer-summary">
          <div>
            <span className="label">總筆數</span>
            <span className="value">{items.length}</span>
          </div>
          <div className="divider"></div>
          <div>
            <span className="label">總金額</span>
            <span className="value">NT$ {formatNumber(totalAmount)}</span>
          </div>
        </div>
        <button type="button" className="primary" onClick={handlePrint}>
          列印明細
        </button>
      </div>
      </div>

      <section className="print-page">
        <div className="print-header">
          <div>
            <h2>簽收單補收款項明細</h2>
            <p>製表日期：{new Date().toLocaleDateString("zh-TW")}</p>
          </div>
          <div className="print-meta">製表人：{ownerName}</div>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>簽收單影像</th>
              <th>司機名稱</th>
              <th>需收款金額</th>
              <th>備註</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`print-${item.id}`}>
                <td>
                  {item.image ? (
                    <img
                      src={item.image}
                      className="print-image"
                      style={{ height: `${item.imageHeight}px` }}
                      alt="簽收單影像"
                    />
                  ) : (
                    <div className="print-placeholder">未附影像</div>
                  )}
                </td>
                <td>{item.driverName || "--"}</td>
                <td className="print-amount">
                  NT$ {formatNumber(item.amount)}
                </td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" className="print-total-label">
                合計筆數：{items.length} 筆
              </td>
              <td className="print-total-amount">
                NT$ {formatNumber(totalAmount)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </section>

    </>
  );
};

export default App;
 