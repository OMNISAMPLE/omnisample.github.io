import './App.css';
import XLSX from 'xlsx';
import config from './config';
import { useEffect } from 'react';
import { login, exportRecords } from './firebase'

function Export() {

  useEffect(() => {
    login()
      .then(() => {
        console.log('Login success')
      })
      .catch(e => {
        console.error(e)
      })
  }, [])

  const runExport = async () => {
    const records = await exportRecords();

    const productNames = config.PRODUCT_LIST.map(row => row[0])

    const header = ['Дата', 'Прізвище', ...productNames, "Всього"];
    const rows = [];
    records.forEach(record => {
      const row = [record.date, record.name];

      productNames.forEach(productName => {
        let qty = null;
        const match = record.products.find(([name]) => {
          return name === productName;
        });
        if (match) {
          qty = match[2]; // [name, price, qty]
        }

        row.push(qty)
      })

      row.push((record.total || 0).toFixed(2))

      rows.push(row)
    });

    const _base64ToArrayBuffer = (base64) => {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }

    const downloadFile = (data) => {
      const { fileName, mimeType, content } = data;

      const blob = new Blob([_base64ToArrayBuffer(content)], { type: mimeType });

      const objectURL = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectURL;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(objectURL);
    };

    const excelMatrix = [header, ...rows];

    const ws = XLSX.utils.aoa_to_sheet(excelMatrix);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Заявки')

    const base64 = XLSX.write(wb, {
      type: 'base64'
    });

    downloadFile({
      fileName: 'Заявки.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      content: base64,
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="App-link"
          onClick={runExport}
        >
          Экспорт
        </button>
      </header>
    </div>
  );
}

export default Export;
