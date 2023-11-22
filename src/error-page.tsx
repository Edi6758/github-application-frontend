import { useRouteError } from "react-router-dom";

type Error = {
  statusText: string
  message: string
}

export default function ErrorPage() {
  const error = useRouteError() as Error;
  console.error(error);

  return (
    <div id="error-page" className="w-full min-h-[100vh] flex flex-col justify-center items-center gap-4">
      <h1 className="text-3xl font-semibold">Oops!</h1>
      <p>Não achamos sua procura.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}