import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Spinner } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import PostPickup from "@/pages/PostPickup";
import SkipRequest from "@/pages/SkipRequest";
import WheelieRequest from "@/pages/WheelieRequest";
import Bins from "@/pages/Bins";
import HowItWorks from "@/pages/HowItWorks";
import MyPickups from "@/pages/MyPickups";
import CollectorProfile from "@/pages/CollectorProfile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Account from "@/pages/Account";
import NotFound from "@/pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function RequireSignIn({ children }) {
  const { user, loading } = useAuth();
  const { pathname, search } = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(pathname + search)}`} replace />;
  return children;
}

const PAGE_TITLES = {
  "/": "Rubbish.com.au | Post a pick up, compare up to 3 quotes",
  "/post-pickup": "Post a pick up | Rubbish.com.au",
  "/skip-request": "Skip bin quotes | Rubbish.com.au",
  "/wheelie-request": "Wheelie bin quotes | Rubbish.com.au",
  "/bins": "Bin sizes | Rubbish.com.au",
  "/how": "How it works | Rubbish.com.au",
  "/my-pickups": "My pick ups | Rubbish.com.au",
  "/collector-profile": "Collector | Rubbish.com.au",
  "/login": "Sign in | Rubbish.com.au",
  "/register": "Create an account | Rubbish.com.au",
  "/forgot-password": "Reset password | Rubbish.com.au",
  "/reset-password": "New password | Rubbish.com.au",
  "/account": "Account | Rubbish.com.au",
};

function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => { document.title = PAGE_TITLES[pathname] || "Rubbish.com.au"; }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <ScrollToTop />
        <PageTitle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post-pickup" element={<PostPickup />} />
          <Route path="/skip-request" element={<SkipRequest />} />
          <Route path="/wheelie-request" element={<WheelieRequest />} />
          <Route path="/bins" element={<Bins />} />
          <Route path="/how" element={<HowItWorks />} />
          <Route path="/my-pickups" element={<RequireSignIn><MyPickups /></RequireSignIn>} />
          <Route path="/collector-profile" element={<RequireSignIn><CollectorProfile /></RequireSignIn>} />
          <Route path="/account" element={<RequireSignIn><Account /></RequireSignIn>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
