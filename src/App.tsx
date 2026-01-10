import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {MemberRoute, PrivateRoute} from './guards/PrivateRoute';
import {OwnerRoute} from './guards/OwnerRoute';
import Login from './features/auth/Login';
import OwnerLogin from './features/auth/OwnerLogin';
import Dashboard from './features/dashboard/Dashboard';
import Inflows from './features/inflows/Inflows';
import Outflows from './features/outflows/Outflows';
import Expenses from './features/expenses/Expenses';
import Worships from './features/worships/Worships';
import Members from './features/members/Members';
import Profile from './features/profile/Profile';
import Tenants from './features/tenants/Tenants';
import Birthdays from './features/birthdays/Birthdays';
import './App.css';
import type {JSX} from 'react';
import {AuthProvider} from "./contexts/AuthProvider.tsx";
import {Toaster} from "./components/ui/sonner.tsx";
import Reports from "./features/reports/Reports.tsx";

function App(): JSX.Element {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/owner-login" element={<OwnerLogin/>}/>

                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/birthdays"
                        element={
                            <PrivateRoute>
                                <Birthdays/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/inflows"
                        element={
                            <PrivateRoute>
                                <Inflows/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <PrivateRoute>
                                <Reports/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/outflows"
                        element={
                            <PrivateRoute>
                                <Outflows/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/expenses"
                        element={
                            <PrivateRoute>
                                <Expenses/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/worships"
                        element={
                            <PrivateRoute>
                                <Worships/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/members"
                        element={
                            <PrivateRoute>
                                <Members/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <MemberRoute>
                                <Profile/>
                            </MemberRoute>
                        }
                    />

                    <Route
                        path="/tenants"
                        element={
                            <OwnerRoute>
                                <Tenants/>
                            </OwnerRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                </Routes>
            </BrowserRouter>
            <Toaster position="top-right" richColors/>
        </AuthProvider>
    );
}

export default App;
