
import { useState, useEffect } from 'react';
import { getUserFromToken, isAdmin, logout as apiLogout, getToken, isAuthenticated } from './api';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = getToken();
            if (token && isAuthenticated()) {
                const userData = getUserFromToken(token);
                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const logout = () => {
        apiLogout();
    };

    const hasRole = (role: string) => {
        if (role === 'ADMIN') return isAdmin();
        return true;
    };

    return { user, logout, hasRole, loading };
};
