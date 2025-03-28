import './App.css';
import HomePage from './Pages/HomePage';
import About from './Pages/About';
import Crops from './Pages/Crops';
import Markets from './Pages/Markets';
import ProductDetails from './Pages/ProductDetails/ProductDetails';
import News from './Pages/News';
import LatestNews from './Pages/News/LatestNews';
import PressReleases from './Pages/News/PressReleases';
import Gallery from './Pages/Gallery';
import Weather from './Pages/Weather';
import Policy from './Pages/Policy';
import PolicyDetails from './Pages/PolicyDetails/PolicyDetails';
import CropDetails from './Pages/CropDetails/CropDetails';
import Contact from './Pages/Contacts';
import Products from './Pages/Products';
import SignUp from './Pages/Signup';
import Login from './Pages/Login';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  // props for components, loggedIn is a boolean
  const props = {
    loggedIn: true
  }
  
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Home */}
          <Route path='/' element={<HomePage {...props}/>}/>
          
          {/* About */}
          <Route path='/about' element={<About {...props}/>}/>
          
          <Route path='/markets' element={<Markets {...props}/>}/>
          <Route path='/markets/products' element={<Products {...props}/>}/>
          <Route path='/markets/products/catalog' element={<Products {...props}/>}/>
          
          {/* News */}
          <Route path='/news' element={<News {...props}/>}/>
          <Route path='/news/latest' element={<LatestNews {...props}/>}/>
          <Route path='/news/press-releases' element={<PressReleases {...props}/>}/>
          <Route path='/news/gallery' element={<Gallery {...props}/>}/>
          
          {/* Weather */}
          <Route path='/weather' element={<Weather {...props}/>}/>

          <Route path='/contact' element={<Contact {...props}/>}/>
          
          {/* Crops */}
          <Route path='/crops' element={<Crops {...props}/>}/>
          <Route path='/crops/:cropId' element={<CropDetails {...props}/>}/>
          
          {/* Policies */}
          <Route path='/policies' element={<Policy {...props}/>}/>
          <Route path='/policyDetails/:policyId' element={<PolicyDetails {...props}/>}/>
          
          {/* Product Details */}
          <Route path='/product/:productId' element={<ProductDetails {...props}/>}/>
          
          {/* Authentication */}
          <Route path='/signup' element={<SignUp {...props}/>}/>
          <Route path='/login' element={<Login {...props}/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;