import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from './components/shared/Layout';
import Categories from './components/pages/Categories';
import Offers from './components/pages/Offers';
import Page from './components/pages/Page';
import Myads from './components/pages/Myads';
import Groups from './components/pages/Groups';
import ViewAllAds from './components/pages/ViewAllAds';
import NoPage from './components/pages/Error/NoPage';
import MyNeeds from './components/pages/MyNeeds';
import Login from './components/Auth/Login';
import AuthCallback from './components/Auth/AuthCallback';
import Register from './components/Auth/Register';
import ForgotPasswort from './components/Auth/ForgotPasswort';
import Support from './components/pages/Support';
import TermsOfService from './components/Auth/TermsOfService';
import PrivacyPolicy from './components/Auth/PrivacyPolicy';
import NoticeAtCollection from './components/Auth/NoticeAtCollection';
import PostAdd from './components/PostAdsModalFlow/PostAdsPage.jsx';
import AdDetailPage from './components/pages/AdDetailPage';
import UserSettingsPage from './components/pages/UserSettingsPage';
import Demo from './components/pages/demo';
import Editad from './components/pages/edit-ad.jsx';
import ShowPageProfile from './components/pages/ShowPageProfile';
import Page_create from './components/pages/Page_demo/Page_create.jsx';
import PageDetail from './components/pages/PageDetail.jsx';
import PageEdit from './components/pages/Pageedit.jsx';
import LocationRedirect from './LocationRedirect';

import PrivateRoute from './Middleware/PrivateRoute';

function App() {
  // Clear old cached data on first load
  useEffect(() => {
    const hasCleared = sessionStorage.getItem('cacheCleared');
    if (!hasCleared) {
      console.log('🧹 Clearing old cache...');
      // Only clear if the stored country is "india"
      const persistedData = localStorage.getItem('persist:root');
      if (persistedData) {
        try {
          const parsed = JSON.parse(persistedData);
          if (parsed.country) {
            const countryData = JSON.parse(parsed.country);
            if (countryData.country === 'india') {
              localStorage.removeItem('persist:root');
              localStorage.removeItem('detectedCountry');
              localStorage.removeItem('lastDetectionTime');
              console.log('✓ Cleared old India default');
            }
          }
        } catch (e) {
          console.log('Error parsing cache:', e);
        }
      }
      sessionStorage.setItem('cacheCleared', 'true');
    }
  }, []);

  return (
    <Router>
      {/* Add LocationRedirect component here - it runs on every route */}
      <LocationRedirect />
      
      <Routes>
        {/* MAIN LAYOUT */}
        <Route path="/" element={<Layout />}>

          {/* ROOT - Redirect to location-based viewallads */}
          <Route index element={<RootRedirect />} />

          {/* MULTI-SEGMENT FIRST */}
          <Route path=":countrySlug/viewallads" element={<ViewAllAds />} />
          <Route path=":countrySlug/viewallads/:categorySlug" element={<ViewAllAds />} />
          <Route path=":countrySlug/viewallads/:categorySlug/:subCategorySlug" element={<ViewAllAds />} />

          <Route path=":countrySlug/offers" element={<Offers />} />
          <Route path=":countrySlug/offers/:categorySlug" element={<Offers />} />
          <Route path=":countrySlug/offers/:categorySlug/:subCategorySlug" element={<Offers />} />

          <Route path=":countrySlug/myneeds" element={<MyNeeds />} />
          <Route path=":countrySlug/myneeds/:categorySlug" element={<MyNeeds />} />
          <Route path=":countrySlug/myneeds/:categorySlug/:subCategorySlug" element={<MyNeeds />} />

          {/* SINGLE SEGMENT COUNTRY */}
          <Route path=":countrySlug" element={<Categories />} />

          {/* STATIC ROUTES */}
          <Route path=":countrySlug/page" element={<PrivateRoute><Page /></PrivateRoute>} />
          <Route path="/pages/create" element={<PrivateRoute><Page_create /></PrivateRoute>} />
          <Route path="/page/:id" element={<PageDetail />} />
          <Route path="/pages/:id/edit" element={<PrivateRoute><PageEdit /></PrivateRoute>} />

          <Route path="ShowPageProfile/:id" element={<PrivateRoute><ShowPageProfile /></PrivateRoute>} />
          <Route path="groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
          <Route path="myads" element={<PrivateRoute><Myads /></PrivateRoute>} />
          <Route path="edit-ad/:id" element={<PrivateRoute><Editad /></PrivateRoute>} />
          <Route path="support" element={<Support />} />
          <Route path="PostAdd" element={<PrivateRoute><PostAdd /></PrivateRoute>} />
          <Route path="AdDetailPage/:id" element={<AdDetailPage />} />
          <Route path="UserSettingsPage" element={<PrivateRoute><UserSettingsPage /></PrivateRoute>} />
          <Route path="Demo" element={<Demo />} />

          <Route path="*" element={<NoPage />} />
        </Route>

        {/* FULL PAGE POST ADS ROUTES */}
        <Route path="post-ads" element={<PrivateRoute><PostAdd /></PrivateRoute>} />
        <Route path="post-ads/:type" element={<PrivateRoute><PostAdd /></PrivateRoute>} />

        {/* AUTH ROUTES */}
        <Route path="auth">
          <Route index element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgotPasswort" element={<ForgotPasswort />} />
          <Route path="TermsOfService" element={<TermsOfService />} />
          <Route path="PrivacyPolicy" element={<PrivacyPolicy />} />
          <Route path="NoticeAtCollection" element={<NoticeAtCollection />} />
          <Route path="callback" element={<AuthCallback />} />
        </Route>
      </Routes>
    </Router>
  );
}

// Component to handle root redirect based on detected country
function RootRedirect() {
  const country = useSelector((state) => state.country?.country);
  
  // Show loading while detecting
  if (!country || country === "null") {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>
          <div style={{ marginBottom: '10px' }}>🌍 Detecting your location...</div>
          <div style={{ fontSize: '14px' }}>Please wait...</div>
        </div>
      </div>
    );
  }
  
  // Redirect to detected country
  return <Navigate to={`/${country}/viewallads`} replace />;
}

export default App;