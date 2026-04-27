const EMAIL_REGEX = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateUsername(username, maxLength = 7) {
    if (!username) {
        return { isValid: false, message: 'Warning: username is required' };
    }

    if (username.length > maxLength) {
        return { isValid: false, message: `Warning: username must be ${maxLength} characters or fewer` };
    }

    return { isValid: true, message: '' };
}

export function validateEmail(email) {
    if (!email) {
        return { isValid: false, message: 'Warning: email is required' };
    }

    if (!EMAIL_REGEX.test(email)) {
        return { isValid: false, message: 'Warning: please enter a valid email address' };
    }

    return { isValid: true, message: '' };
}

function decodeJwtPayload(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
        const json = atob(padded);
        return JSON.parse(json);
    } catch (error) {
        return null;
    }
}

export function getSessionExpiration(token, fallbackMs = 7 * 24 * 60 * 60 * 1000) {
    const payload = decodeJwtPayload(token);

    if (payload && typeof payload.exp === 'number') {
        return new Date(payload.exp * 1000).toISOString();
    }

    return new Date(Date.now() + fallbackMs).toISOString();
}

export function isSessionExpired(expiresAt) {
    if (!expiresAt) return false;
    const expiryTime = new Date(expiresAt).getTime();
    if (Number.isNaN(expiryTime)) return false;
    return Date.now() >= expiryTime;
}
