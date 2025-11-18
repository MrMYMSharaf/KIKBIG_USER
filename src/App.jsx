import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Register from './components/Auth/Register';
import ForgotPasswort from './components/Auth/ForgotPasswort';
import Support from './components/pages/Support';
import TermsOfService from './components/Auth/TermsOfService';
import PrivacyPolicy from './components/Auth/PrivacyPolicy';
import NoticeAtCollection from './components/Auth/NoticeAtCollection';
import PostAdd from './components/pages/PostAdd';
import AdDetailPage from './components/pages/AdDetailPage';
import UserSettingsPage from './components/pages/UserSettingsPage';
import Demo from './components/pages/demo';
import Editad from './components/pages/edit-ad.jsx';
import ShowPageProfile from './components/pages/ShowPageProfile';

import PrivateRoute from './Middleware/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main layout routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Categories />} />
          <Route path="offers" element={<Offers />} />

          <Route path="page" element={<PrivateRoute><Page /></PrivateRoute>} />
          <Route path="ShowPageProfile/:id" element={<PrivateRoute><ShowPageProfile /></PrivateRoute>} />

          <Route path="groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
          <Route path="myads" element={<PrivateRoute><Myads /></PrivateRoute>} />
          <Route path="edit-ad/:id" element={<PrivateRoute><Editad /></PrivateRoute>} />
          
          {/* ✅ FIXED: All three view modes with category/subcategory support */}
          
          {/* View All Ads Routes */}
          <Route path="viewallads" element={<ViewAllAds />} />
<Route path="viewallads/:countrySlug" element={<ViewAllAds />} />
<Route path="viewallads/:countrySlug/:categorySlug" element={<ViewAllAds />} />
<Route path="viewallads/:countrySlug/:categorySlug/:subCategorySlug" element={<ViewAllAds />} />

         
          {/* Offers Routes */}
          <Route path="offers//:countrySlug" element={<Offers />} />
          <Route path="offers/:countrySlug/:categorySlug" element={<Offers />} />
          <Route path="offers/:countrySlug/:categorySlug/:subCategorySlug" element={<Offers />} />
          
          {/* My Needs Routes */}
          <Route path="myneeds" element={<MyNeeds />} />
          <Route path="myneeds/:countrySlug" element={<MyNeeds />} />
          <Route path="myneeds/:countrySlug/:categorySlug" element={<MyNeeds />} />
          <Route path="myneeds/:countrySlug/:categorySlug/:subCategorySlug" element={<MyNeeds />} />
          
          <Route path="categories" element={<Categories />} />
          <Route path="support" element={<Support />} />
          <Route path="PostAdd" element={<PostAdd />} />
          <Route path="AdDetailPage/:id" element={<AdDetailPage />} />
          <Route path="UserSettingsPage" element={<PrivateRoute><UserSettingsPage /></PrivateRoute>} />
          <Route path="Demo" element={<Demo />} />
          <Route path="*" element={<NoPage />} />
        </Route>

        {/* Authentication routes */}
        <Route path="auth">
          <Route index element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgotPasswort" element={<ForgotPasswort />} />
          <Route path="TermsOfService" element={<TermsOfService />} />
          <Route path="PrivacyPolicy" element={<PrivacyPolicy />} />
          <Route path="NoticeAtCollection" element={<NoticeAtCollection />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;