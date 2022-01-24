import './App.css';
import axios from 'axios';
import config from './config';
import { useEffect, useState } from 'react';

const formatDate = () => new Date().toISOString().replace('T', ' ').replace('Z', '').split('.')[0]

const generateText = ({ date, name, products }) => {
  const total = products.reduce((sum, row) => {
    const [_, price, qty] = row;

    return sum + (price * qty);
  }, 0);

  const productString = products.map(row => {
    const [name, price, qty] = row;

    return `*${name}*, ${price.toFixed(2)}, Кіл. ${qty};`
  }).join('\n')

  return `
*Дата замовлення:* ${date}
*Прізвище:* ${name}

*Замовлення:*
---
${productString}
---
*Всього:* ${total.toFixed(2)}
  `.trim()
}

function App() {

  const [success, setSuccess] = useState(false)
  const [total, setTotal] = useState(0)
  const [state, setState] = useState({
    date: formatDate(),
    name: "",
    products: [
      // Name, Price, Qty
      ["Агепта таб. №20", 10.0, 0],
      ["Альба капс. №60", 10.0, 0],
      ["Валеріанівна капс. №20", 10.0, 0],
      ["Верта капс. №60", 10.0, 0],
      ["Декап 2000 таб. №60", 10.0, 0],
      ["Декап 5000 таб. №60", 10.0, 0],
      ["Доктовіт таб. №30", 10.0, 0],
      ["Ендомар капс. №30", 10.0, 0],
      ["Йосен таб. №50", 10.0, 0],
      ["Йосен для берем. таб. №50", 10.0, 0],
      ["Йосен для детей таб. №50", 10.0, 0],
      ["Кадван капс. №30", 10.0, 0],
      ["Капсумен капс. №30", 10.0, 0],
      ["Лаклін саше №10", 10.0, 0],
      ["Магнель капс. №30", 10.0, 0],
      ["Омніфер капс. №30", 10.0, 0],
      ["Райт капс. №30", 10.0, 0],
      ["Реверс капс. №30", 10.0, 0],
      ["Селенорм таб. №50", 10.0, 0],
      ["Фітостатін 20 мг таб. №30", 10.0, 0],
      ["Цинфорт капс. №20", 10.0, 0],
    ],
  });

  useEffect(() => {
    const value = state.products.reduce((sum, row) => {
      const [_, price, qty] = row;

      return sum + (price * qty);
    }, 0);

    setTotal(value)
  }, [state.products])

  const setName = e => {
    setState({
      ...state,
      name: e.target.value
    })
  }

  const setQty = index => e => {
    const newProducts = [...state.products];
    let value = Number.parseInt(e.target.value);
    value = !isNaN(value) ? Math.max(0, value) : 0;

    // Set qty
    newProducts[index][2] = value;

    setState({
      ...state,
      products: newProducts
    })
  }

  const sendMessage = async () => {
    const text = generateText({
      ...state,
      products: state.products.filter(row => {
        const qty = row[2];
        return qty > 0;
      })
    });

    const res = await axios.get(`https://api.telegram.org/bot${config.TG_API_TOKEN}/sendMessage`, {
      params: {
        chat_id: config.TG_CHAT_ID,
        parse_mode: 'markdown',
        text
      }
    });
    if (res?.data?.ok) {
      setSuccess(true)
    }
  }

  const isValid = state.name && total > 0;

  return (
    <div className="App">
      <header className="App-header">

        <div className="form-group">
          <label htmlFor="date">Дата замовлення:</label>
          <input name="date" type="text" value={state.date} disabled />
        </div>

        <div className="form-group">
          <label htmlFor="name">Прізвище *:</label>
          <input name="name" type="text" value={state.name} onChange={setName} />
        </div>

        <div className="form-group">
          <table>
            <thead>
              <tr>
                <th align="center">Назва</th>
                <th align="center">Ціна</th>
                <th align="center">Кількість *</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((row, i) => {
                const [name, price, qty] = row;
                return <tr key={name}>
                  <td align="left">{name}</td>
                  <td align="right">{price.toFixed(2)}</td>
                  <td align="center">
                    <input type="number" min={0} max={999} value={qty} onChange={setQty(i)} />
                  </td>
                </tr>
              })}
              <tr>
                <td align="left" colSpan={2}>Всього</td>
                <td align="center">{total.toFixed(2)}</td>
              </tr>
            </tbody>

          </table>
        </div>

        {success ? <div className="form-group">
          <p>Заявка створена успішно!</p>
        </div> : null}

        <button
          className="App-link"
          onClick={sendMessage}
          disabled={!isValid || success}
        >
          Створити заявку
        </button>
      </header>
    </div>
  );
}

export default App;
