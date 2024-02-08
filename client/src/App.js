import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import "./App.css";
import Home from './components/Home/Home';
import Signup from './components/Signup/Signup';
import Signin from './components/Signin/Signin';
import Chat from './components/Chat/Chat';

const App = () => (
<Router>
  <Routes>
    <Route exact path='/' element={<Home />} />
    <Route exact path='/signup' element={<Signup />} />
    <Route exact path='/signin' element={<Signin />} />
    <Route exact path='/chat/:id' element={<Chat />} />
  </Routes>
</Router>
);

export default App;
