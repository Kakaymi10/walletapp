import React, { useState } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { app } from '../authentication/config';
import MyComponent from './subcategories';
import TransactionForm from './transaction';
import './home.css'
import Modal from "react-modal";
import History from './History';

const Home = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankBalance, setBankBalance] = useState('');
  const [transactionOpen, setTransactionOpen] = useState(false)

  // Modal open and close functions
  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionOpen(true);
    setBankName('');
    setBankBalance('');
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeBank = () => {
    setShowForm(false);
    setIsModalOpen(false);
    setBankName('');
    setBankBalance('');
  };

  const closeCat = () => {
    setShowCategories(false);
    setIsModalOpen(false);
    setBankName('');
    setBankBalance('');
  };

  // Handlers for buttons
  const handleButtonClick = () => {
    setShowForm(true);
    setIsModalOpen(true);
    setShowCategories(false);
  };

  const handleCategoryClick = () => {
    setShowForm(false);
    setIsModalOpen(true);
    setShowCategories(true);
  };

  // Form submission handlers
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Push data to Firebase Realtime Database
    const db = getDatabase(app);
    const dbRef = ref(db, `${props.user}/banks/${bankName}/balance`);
    try {
      await set(dbRef, bankBalance);
      console.log('Data posted to Firebase Realtime Database.');
    } catch (error) {
      console.error('Error posting data:', error);
    }
    // Clear the form and hide it
    setBankName('');
    setBankBalance('');
    setShowForm(false);
  };

  const handleCategory = async (e) => {
    e.preventDefault();
    const db = getDatabase(app);
    const dbRef = ref(db, `${props.user}/Categories/`);
    try {
      // Fetch existing data
      const snapshot = await get(dbRef);
      const existingData = snapshot.val() || {};
      // Update data by appending a new property
      existingData[bankName] = '';
      // Write the updated data back to the database
      await set(dbRef, existingData);
      console.log('Data appended to Firebase Realtime Database.');
    } catch (error) {
      console.error('Error appending data:', error);
    }
    // Clear the form and hide it
    setBankName('');
    setShowCategories(false);
  };

  return (
    <div>
      <div className='operation'>
        <div className='operationOne'>
        <button className='button' onClick={handleButtonClick}>Add Acoount</button>
        <button className='button' onClick={handleCategoryClick}>Add Category</button>
        <MyComponent user={props.user}/>
        <button className='button' onClick={props.signout}>SignOut</button>
        </div>

        
      </div>
      <div className='transaction'>
        <TransactionForm user={props.user}/>
      </div>
        

      {/* Bank Form Modal */}
      {showForm && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Truncated Content Modal"
          className="custom-modal"
        >
          <form onSubmit={handleFormSubmit}>
            <label>
              Bank Name:
              <input
                className='input'
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </label>
            <br />
            <label>
              Bank Balance:
              <input
                className='input'
                type="number"
                value={bankBalance}
                onChange={(e) => setBankBalance(e.target.value)}
              />
            </label>
            <br />
            <button className='button' type="submit">Submit</button>
            <button className='button' onClick={closeBank}>Close</button>
          </form>
        </Modal>
      )}

      {/* Category Form Modal */}
      {showCategories && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Truncated Content Modal"
          className="custom-modal"
        >
          <form onSubmit={handleCategory}>
            <label>
              Category:
              <input
                className='input'
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </label>
            <br />
            <br />
            <button className='button' type="submit">Submit</button>
            <button className='button' onClick={closeCat}>Close</button>
          </form>
        </Modal>
      )}

        <History user={props.user} />
      
    </div>
  );
};

export default Home;
