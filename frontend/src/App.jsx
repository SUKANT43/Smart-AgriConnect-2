import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./frontendPage/homePage/homePage";
import SignUpPage from "./frontendPage/Authentication/SignUpPage";
import ResetPasswordPage from "./frontendPage/Authentication/ResetPasswordPage";
import Navbar from "./frontendPage/navbarPage/navbar";
import Subsidies from "./frontendPage/subsidiesPage/subsidies";
import SubsidiesInfo from "./frontendPage/subsidiesPage/SubsidiesInfo.jsx";
import CropInsight from "./frontendPage/cropInsigthtPage/cropInsight";
import CropInfo from "./frontendPage/cropInsigthtPage/cropInfo.jsx";
import CropProtect from "./frontendPage/cropProtectPage/cropProtect";
import PesticideInfo from "./frontendPage/cropProtectPage/pesticide.jsx";
import FertilizerInfo from "./frontendPage/cropProtectPage/fertilizer.jsx";
import Weather from "./frontendPage/weatherPage/weather";
import TradeHub from "./frontendPage/tradeHubPage/tradHub";
import Forum from "./frontendPage/forumPage/forum";
import DiscussionForum from "./frontendPage/forumPage/DiscussionForum";
import SuccessStoriesForum from "./frontendPage/forumPage/SuccessStoriesForum.jsx";
import Feedback from "./frontendPage/feedBackPage/feedBack";
import Login from "./frontendPage/Authentication/login";
import PersonalInformation from "./frontendPage/navbarPage/PersonalInformation.jsx";
import TranslateComponent from "./frontendPage/translation/TranslateComponent.jsx";

function AppContent() {
  return (
    <>
      <Navbar />
      <div className="flex-1 p-10 bg-gray-100 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/homepage" replace />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/subsidies" element={<Subsidies />} />
          <Route path="/subsidies-info" element={<SubsidiesInfo />} />
          <Route path="/crop-insight" element={<CropInsight />} />
          <Route path="/crop-info" element={<CropInfo />} />
          <Route path="/crop-protect" element={<CropProtect />} />
          <Route path="/fertilizer-info" element={<FertilizerInfo />} />
          <Route path="/pesticide-info" element={<PesticideInfo />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/trade-hub" element={<TradeHub />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/discussion" element={<DiscussionForum />} />
          <Route path="/success-stories" element={<SuccessStoriesForum />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/personal-info" element={<PersonalInformation />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Application Routes */}
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
