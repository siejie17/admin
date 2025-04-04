import { Route, Navigate } from "react-router-dom";
import LoginPage from '../pages/auth/LoginPage';
import PasswordResetPage from "../pages/auth/PasswordResetPage";

const AuthRouter = () => (
    <>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
    </>
);

export default AuthRouter;