
/**
 * API Client for cPanel MySQL Backend
 */

const API_URL = import.meta.env.VITE_API_URL || '/api.php';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function apiRequest<T>(action: string, method: string = 'GET', body?: any): Promise<ApiResponse<T>> {
    try {
        const url = `${API_URL}?action=${action}`;
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result as ApiResponse<T>;
    } catch (error) {
        console.error('API Request Failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown network error',
        };
    }
}
