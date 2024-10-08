import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ExpenseList.css';

const ExpenseList = () => {
  const [username, setUsername] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newExpense, setNewExpense] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const storedUsername = localStorage.getItem('username');

  const fetchExpenses = async () => {
    try {
      if (!storedUsername) {
        throw new Error("Username not found in localStorage");
      }
      const response = await axios.get(`http://localhost:8081/expenses/${storedUsername}/all`);
      if (!response.data) {
        throw new Error("No data returned from server");
      }
      const { username = '', expenses = [] } = response.data;
      setUsername(username);
      setExpenses(expenses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    try {
      if (!newExpense || !newAmount || !newCategory) {
        setError('Please fill out all fields before adding a new expense.');
        return;
      }
  
      await axios.post(`http://localhost:8081/expenses/${storedUsername}`, null, {
        params: {
          expense: newExpense,
          amount: parseFloat(newAmount),
          category: newCategory,
        },
      });
  
      setNewExpense('');
      setNewAmount('');
      setNewCategory('');
  
      await fetchExpenses();
    } catch (err) {
      console.error("Error adding expense:", err);
      setError(`Failed to add new expense. Reason: ${err.response?.data?.message || err.message}`);
    }
  };
  

  useEffect(() => {
    fetchExpenses();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Total balance: {expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)} USD</h1>
      
      <div className="add-expense-form">
        <h2>Add New Expense</h2>
        <input
          type="text"
          placeholder="Expense"
          value={newExpense}
          onChange={(e) => setNewExpense(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Amount"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddExpense} className="add-expense-button">Add Expense</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Expense</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={index}>
                <td>{expense.expense}</td>
                <td>{expense.amount.toFixed(2)}</td>
                <td>{expense.category}</td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
