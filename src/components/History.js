import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '../authentication/config';
import './history.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const History = (props) => {
  const [transactions, setTransactions] = useState([]);
  const [timeGap, setTimeGap] = useState('all');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [bankNames, setBankNames] = useState([]);
  const [selectedBank, setSelectedBank] = useState('All');
  const [selectedBankBalance, setSelectedBankBalance] = useState(0);

  const sendNotification = (message) => {
    toast.error(message, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };
  
  const fetchTransactionData = async (db, user, type, itemId) => {
    const transactionSnapshot = await get(ref(db, `${user}/${type}/${itemId}`));
    return transactionSnapshot.exists() ? transactionSnapshot.val() : null;
  };

  const processData = async (data, type, db, userId) => {
    for (const itemId in data) {
      const transactionData = await fetchTransactionData(db, userId, type, itemId);
      if (transactionData) {
        for (const timestamp in transactionData) {
          const newData = {
            timestamp: parseInt(timestamp),
            type,
            data: transactionData[timestamp],
          };
          setTransactions((prevState) => [...prevState, newData]);
        }
      }
    }
  };

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }

    const db = getDatabase(app);

    const processTransactions = async () => {
      const expenseRef = ref(db, `${props.user}/expense`);
      const incomeRef = ref(db, `${props.user}/income`);
      const bankRef = ref(db, `${props.user}/banks`);

      const [expenseSnapshot, incomeSnapshot, bankSnapshot] = await Promise.all([
        get(expenseRef),
        get(incomeRef),
        get(bankRef),
      ]);

      const expenseData = expenseSnapshot.val() || {};
      const incomeData = incomeSnapshot.val() || {};
      const bankData = bankSnapshot.val() || {};

      setBankNames(Object.keys(bankData));

      let allBanksBalance = 0;

      if (selectedBank === 'All') {
        for (const bankName of Object.keys(bankData)) {
          allBanksBalance += parseFloat(bankData[bankName].balance);
        }
        setSelectedBankBalance(allBanksBalance);
      } else {
        setSelectedBankBalance(parseFloat(bankData[selectedBank].balance));
      }

      const allTransactions = [];
      await processData(expenseData, 'expense', db, props.user);
      await processData(incomeData, 'income', db, props.user);

      let totalExpenseBalance = 0;
      let totalIncomeBalance = 0;

      allTransactions.forEach((transaction) => {
        if (transaction.type === 'expense') {
          totalExpenseBalance -= parseFloat(transaction.data.split('-')[3]);
        } else {
          totalIncomeBalance += parseFloat(transaction.data.split('-')[1]);
        }
      });

      setTotalExpense(totalExpenseBalance);
      setTotalIncome(totalIncomeBalance);

      const checkBalanceAndNotify = () => {
        let generalBalance = allBanksBalance - (totalIncomeBalance - totalExpenseBalance);
        if (generalBalance < 3000) {
          sendNotification(`Your general balance is low: ${generalBalance}`);
        }
      };
      const notificationInterval = setInterval(checkBalanceAndNotify, 20000);

  // Clear the interval when the component unmounts
  return () => {
    clearInterval(notificationInterval);
  };

    };

    processTransactions();

    
  }, [props.user, selectedBank]);

  const formatTimestampToDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString(); // Customize this format as needed
  };

  const handleTimeGapChange = (event) => {
    setTimeGap(event.target.value);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const currentTime = Date.now();
    const timeDifference = currentTime - transaction.timestamp;
    const gapInSeconds = timeGap === 'day' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    return timeDifference <= gapInSeconds;
  });

  return (
    <div className='history'>
        <ToastContainer />
      <div className='details'>
        <label>
          Time Gap:
          <select value={timeGap} onChange={handleTimeGapChange}>
            <option value='all'>All</option>
            <option value='day'>Last 24 hours</option>
            <option value='week'>Last 7 days</option>
          </select>
        </label>
        <div>
          <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
            <option value='All'>All</option>
            {bankNames.map((bankName) => (
              <option key={bankName} value={bankName}>
                {bankName}
              </option>
            ))}
          </select>
          <p>Selected Account Balance: ${selectedBankBalance.toFixed(2)}</p>
          <p>Total Expense: {totalExpense}</p>
          <p>Total Income: {totalIncome}</p>
        </div>
      </div>
      <h2 className='transactionH'>Transaction History</h2>
      <ul>
      {filteredTransactions.map((transaction, index) => {
        if (transaction.data.includes(selectedBank)) {
        return (
        <li key={index} className={transaction.type === 'expense' ? 'expense' : 'income'}>
          {transaction.type === 'expense' ? (
            <span className="withdraw">
              Withdraw {transaction.data.split('-')[3]} from {transaction.data.split('-')[0]} at {formatTimestampToDate(transaction.timestamp)}
            </span>
          ) : (
            <span className="receive">
              {transaction.data.split('-')[0]} received {transaction.data.split('-')[1]} at {formatTimestampToDate(transaction.timestamp)}
            </span>
          )}
        </li>
      );
    } else if (selectedBank === 'All'){
        return( 
            <li key={index} className={transaction.type === 'expense' ? 'expense' : 'income'}>
              {transaction.type === 'expense' ? (
                <span className="withdraw">
                  Withdraw {transaction.data.split('-')[3]} from {transaction.data.split('-')[0]} at {formatTimestampToDate(transaction.timestamp)}
                </span>
              ) : (
                <span className="receive">
                  {transaction.data.split('-')[0]} received {transaction.data.split('-')[1]} at {formatTimestampToDate(transaction.timestamp)}
                </span>
              )}
            </li>
          )
    }
      
  }).reverse()}
       
      </ul>
    </div>
  );
};

export default History;
