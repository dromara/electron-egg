// Capture exceptions
export declare function loadException(): void;
// When an exception is thrown on a process without being caught, trigger the event and silence the exception
export declare function uncaughtExceptionHandler(): void;
// When the reject exception in the promise is not caught using catch in the synchronization task, it will trigger the event，
// Even if catch is used in asynchronous situations, it will trigger the event
export declare function unhandledRejectionHandler(): void;
// This event is triggered when an exception is thrown on the process without being caught.
export declare function uncaughtExceptionMonitorHandler(): void;
