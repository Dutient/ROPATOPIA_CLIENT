import { jwtDecode } from "jwt-decode";

const isTokenExpired = (token: string) => {
    if(!token) return true;
    try {
        const decoded = jwtDecode(token);
        if(!decoded.exp) return true;
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

export default isTokenExpired;