export const logger = {
    log: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(...args);
        }
    },
    error: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.error(...args);
        }
        // 추후 Sentry 등의 에러 트래킹 도구 연동 가능
    },
    warn: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.warn(...args);
        }
    },
    info: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.info(...args);
        }
    }
};
