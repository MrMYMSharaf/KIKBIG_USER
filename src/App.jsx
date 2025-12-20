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
import Page_create from './components/pages/Page_create.jsx';

import PrivateRoute from './Middleware/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>

        {/* MAIN LAYOUT */}
        <Route path="/" element={<Layout />}>

          {/* DEFAULT INDEX */}
          <Route index element={<Categories />} />

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
          <Route path="/pages/create" element={<Page_create />} />
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

export default App;
