import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { loginSuccess } from "./pages/userSlice";

// Pages
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Profile from "./pages/profile/Profile";
import Messenger from "./components/messenger/Messenger"; // Import the Messenger component
import ForgotPassword from "./components/forgotpassword/ForgotPassword"; // Import the ForgotPassword component
import ResetPassword from "./components/resetpassword/ResetPassword"; // Import the ResetPassword component

function App() {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  // Check if the user is logged in or not
  useEffect(() => {
    // Get the user from local storage
    const loggedInUser = localStorage.getItem("user");
    // If the user is logged in then dispatch the loginSuccess action
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      dispatch(loginSuccess(foundUser));
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* If a user is logged in then go to the homepage otherwise the register page */}
        <Route
          exact
          path="/"
          element={user ? <Home /> : <Register />}
        />
        {/* If the user is on the login page and user is already logged in then go to the homepage otherwise the login page */}
        <Route
          path="/login"
          element={user ? <Navigate replace to={"/"} /> : <Login />}
        />
        {/* If the user is on the register page and user is already logged in then go to the homepage otherwise the register page */}
        <Route
          path="/register"
          element={user ? <Navigate replace to={"/"} /> : <Register />}
        />
        <Route exact path="/profile/:username" element={<Profile />} />

        {/* Add the new route for the Messenger component */}
        <Route
          path="/messenger"
          element={user ? <Messenger currentUser={user} /> : <Navigate replace to={"/login"} />}
        />

        {/* Add the new routes for ForgotPassword and ResetPassword components */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
