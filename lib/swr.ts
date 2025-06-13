import { SWRConfiguration } from 'swr';

// Define the fetcher function
export const fetcher = async (url: string) => {
    const res = await fetch(url);

    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        (error as any).info = await res.json();
        (error as any).status = res.status;
        throw error;
    }

    return res.json();
};

// Default SWR configuration
export const defaultSWRConfig: SWRConfiguration = {
    fetcher,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    errorRetryCount: 3,
    dedupingInterval: 2000,
}; 