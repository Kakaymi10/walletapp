import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, push, get } from 'firebase/database';
import { app } from '../authentication/config';
import './home.css'

function TransactionForm(props) {
  const [transactionType, setTransactionType] = useState('');
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // Fetch list of banks from Firebase
    const fetchBanks = async () => {
      const db = getDatabase(app);
      const banksRef = ref(db, `${props.user}/banks`);

      try {
        const snapshot = await get(banksRef);
        if (snapshot.exists()) {
          const banksData = snapshot.val();
          const bankNames = Object.keys(banksData);
          setBanks(bankNames);
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };

    // Fetch list of categories from Firebase
    const fetchCategories = async () => {
      const db = getDatabase(app);
      const categoriesRef = ref(db, `${props.user}/Categories`);

      try {
        const snapshot = await get(categoriesRef);
        if (snapshot.exists()) {
          const categoriesData = snapshot.val();
          const categoryNames = Object.keys(categoriesData);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchBanks();
    fetchCategories();
  }, [props.user]);

  const handleTransactionTypeChange = (e) => {
    setTransactionType(e.target.value);
  };

  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');

    // Fetch subcategories based on the selected category
    const fetchSubcategories = async () => {
      const db = getDatabase(app);
      const subcategoriesRef = ref(db, `${props.user}/Categories/${e.target.value}`);

      try {
        const snapshot = await get(subcategoriesRef);
        if (snapshot.exists()) {
          const subcategoriesData = snapshot.val();
          const subcategoryNames = Object.keys(subcategoriesData);
          setSubcategories(subcategoryNames);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };

    fetchSubcategories();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const db = getDatabase(app);
    const transactionRef = ref(db, `${props.user}/${transactionType}`);
    const bankRef = ref(db, `${props.user}/banks/${selectedBank}`);
    const timestamp = new Date().getTime(); // Get timestamp in milliseconds
  
    console.log('Selected Bank:', selectedBank);
    console.log('Transaction Type:', transactionType);
  
    if (transactionType === 'expense') {
      const transactionData = `${selectedBank}-${selectedCategory}-${selectedSubcategory}-${amount}`;
      try {
        // Subtract the amount from the balance of the chosen bank
        const bankSnapshot = await get(bankRef);
        console.log('Bank Snapshot:', bankSnapshot.val());
        
        if (bankSnapshot.exists()) {
          const bankData = bankSnapshot.val();
          console.log('Current Balance:', bankData.balance);
          const updatedBalance = parseFloat(bankData.balance) - parseFloat(amount);
          console.log('Updated Balance:', updatedBalance);
          await set(bankRef, { ...bankData, balance: updatedBalance });
        }
  
        // Append the expense transaction data
        await push(transactionRef, { [timestamp]: transactionData });
        console.log('Expense transaction recorded.');
  
      } catch (error) {
        console.error('Error recording expense transaction:', error);
      }
    } else if (transactionType === 'income') {
      const transactionData = `${selectedBank}-${amount}`;
      try {
        // Add the amount to the balance of the chosen bank
        const bankSnapshot = await get(bankRef);
        console.log('Bank Snapshot:', bankSnapshot.val());
  
        if (bankSnapshot.exists()) {
          const bankData = bankSnapshot.val();
          console.log('Current Balance:', bankData.balance);
          const updatedBalance = parseFloat(bankData.balance) + parseFloat(amount);
          console.log('Updated Balance:', updatedBalance);
          await set(bankRef, { ...bankData, balance: updatedBalance });
        }
  
        // Append the income transaction data
        await push(transactionRef, { [timestamp]: transactionData });
        console.log('Income transaction recorded.');
  
      } catch (error) {
        console.error('Error recording income transaction:', error);
      }
    }
  
    // Clear form fields
    setTransactionType('');
    setSelectedBank('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setAmount('');
  };
  
  
  
  

  return (
    <div>
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Transaction Type:
          <select value={transactionType} onChange={handleTransactionTypeChange}>
            <option value="">Select</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        {transactionType && (
          <div>
            <label>
              Bank Name:
              <select value={selectedBank} onChange={handleBankChange}>
                <option value="">Select</option>
                {banks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </label>

            {transactionType === 'expense' && (
              <div>
                <label>
                  Category:
                  <select value={selectedCategory} onChange={handleCategoryChange}>
                    <option value="">Select</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedCategory && (
                  <div>
                    <label>
                      Subcategory:
                      <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}>
                        <option value="">Select</option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory} value={subcategory}>
                            {subcategory}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            )}

            <label>
              Amount:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>

            {/* Other fields based on transaction type */}
            {/* ... */}
          </div>
        )}

        <button className='button' type="submit">Submit</button>
        
      </form>
    </div>
  );
}

export default TransactionForm;
