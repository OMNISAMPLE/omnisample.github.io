import './App.css';
import { useEffect, useState } from 'react';
import config from './config'
import { login, createNewRecord } from './firebase'
import { sendTelegramMessage } from './telegram'

const formatDate = () => new Date().toLocaleString();

const products = JSON.parse(JSON.stringify(config.PRODUCT_LIST));

products.sort((a, b) => {
  const [nameA] = a;
  const [nameB] = b;

  return nameA.localeCompare(nameB)
})

const defaultState = {
  date: formatDate(),
  name: "",
  products,
}

const generateText = ({ date, name, total, products }) => {
  const productString = products.map(row => {
    const [name, price, qty] = row;

    return `*${name}*, Упк. ${qty};`
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

  const [isLogin, setIsLogin] = useState(null)
  const [success, setSuccess] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalQty, setTotalQty] = useState(0)
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    setIsLogin(null)
    login()
      .then(() => {
        setIsLogin(true)
        console.log('Login success')
      })
      .catch(e => {
        setIsLogin(false)
        console.error('Login error', e)
      })
  }, [])

  useEffect(() => {
    const value = state.products.reduce((sum, row) => {
      const [_, price, qty] = row;

      sum.total += (price * qty)
      sum.qty += qty

      return sum
    }, {
      total: 0,
      qty: 0,
    });

    setTotal(value.total)
    setTotalQty(value.qty)
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
    const payload = {
      ...state,
      total,
      products: state.products.filter(row => {
        const qty = row[2];
        return qty > 0;
      })
    }

    const isNewRecord = await createNewRecord(payload);
    const isSend = await sendTelegramMessage(generateText(payload));

    setSuccess(isNewRecord && isSend)
  }

  const isValid = isLogin && state.name && totalQty > 0;

  return (
    <div className="App">
      <header className="App-header">

        <div>
          <label htmlFor="date">Дата замовлення:</label>
          <h3>{state.date}</h3>
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
                <th align="center">Кількість, упк. *</th>
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
                <td align="left">Всього</td>
                <td align="right">{total.toFixed(2)}</td>
                <td />
              </tr>
            </tbody>

          </table>
        </div>

        {success ? <div className="form-group">
          <p>Заявка створена успішно!</p>
        </div> : null}

        {typeof isLogin === 'boolean' && !isLogin ? <div className="form-group">
          <p>Помилка на сервері. Будь ласка, перезавантажте сторінку</p>
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
