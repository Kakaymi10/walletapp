import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { app } from '../authentication/config';
import './home.css'
import Modal from "react-modal";


function MyComponent(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [showComponent, setShowComponent] = useState(false);


  const closeModal = () => {
    setIsModalOpen(false);
    setShowComponent(false)
  };

  useEffect(() => {
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

    fetchCategories();
  }, [props.user]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleNewSubcategoryChange = (e) => {
    setNewSubcategory(e.target.value);
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();

    if (selectedCategory && newSubcategory) {
      const db = getDatabase(app);
      const subcategoryRef = ref(
        db,
        `${props.user}/Categories/${selectedCategory}/${newSubcategory}`
      );

      try {
        await set(subcategoryRef, '');
        console.log('New subcategory added to the database.');
      } catch (error) {
        console.error('Error adding subcategory:', error);
      }
      setShowComponent(false)
      setNewSubcategory('');

    }
  };

  return (
    <div>
      {showComponent ? (
        <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Truncated Content Modal"
        className="custom-modal" 
       >
        <div>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {selectedCategory && (
            <form onSubmit={handleAddSubcategory}>
              <input
                className='input'
                type="text"
                value={newSubcategory}
                onChange={handleNewSubcategoryChange}
                placeholder="Enter new subcategory"
              />
              <button className='button' type="submit" >Add Subcategory</button>
              <button className='button' onClick={() => {setShowComponent(false); setIsModalOpen(false)}}>Close</button>
            </form>
          )}
        </div>
        </Modal>
      ) : (
        <button className='button' onClick={() => {setShowComponent(true); setIsModalOpen(true)}}>Add Subcategory</button>
      )}
    </div>
  );
}

export default MyComponent;


