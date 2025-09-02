import Layout from "./Layout.jsx";

import Home from "./Home";

import TryOn from "./TryOn";

import Gallery from "./Gallery";

import Profile from "./Profile";

import GeminiTest from "../components/test/GeminiTest";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    TryOn: TryOn,
    
    Gallery: Gallery,
    
    Profile: Profile,
    
    GeminiTest: GeminiTest,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/TryOn" element={<TryOn />} />
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/GeminiTest" element={<GeminiTest />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}