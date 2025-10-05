import { jwtDecode } from "jwt-decode";
import { useAuth } from '../Contexts/AuthContext';

export const isTokenExpired = () => {
    const { token } = useAuth();
    if(!token) return true;

    try {
        const decoded = jwtDecode(token);
        if(!decoded.exp) return true;
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}