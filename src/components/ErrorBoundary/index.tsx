import { isRouteErrorResponse, useRouteError } from "react-router";
import styles from "./index.module.scss";

export default function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className={styles.errorBoundary}>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className={styles.errorBoundary}>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return (
      <div className={styles.errorBoundary}>
        <h1>Unknown Error</h1>
      </div>
    );
  }
}
